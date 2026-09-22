from decimal import Decimal
from typing import Optional
from datetime import datetime, date, timedelta
from io import BytesIO
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import cast, Date

from app.database import get_db
from app.models.venta import Venta, DetalleVenta
from app.models.factura import Factura, DetalleFactura
from app.models.usuario import Usuario
from app.schemas.factura import (
    FacturaResponse,
    DetalleFacturaResponse,
    FacturaListResponse,
    FacturaEstadoUpdate,
    FacturaFromVenta
)
from app.schemas.auth import UserAuthInfo
from app.schemas.common import MessageResponse
from app.auth import get_current_active_user, require_admin_or_empleado, require_any_authenticated
from app.config import settings

router = APIRouter(prefix="/facturas", tags=["Gestión de Facturas"])


def _build_factura_response(factura: Factura) -> FacturaResponse:
    detalles = [DetalleFacturaResponse.model_validate(d) for d in factura.detalles]
    cliente_resp = None
    if factura.cliente:
        cliente_resp = UserAuthInfo(
            id=factura.cliente.id,
            nombres=factura.cliente.nombres,
            apellidos=factura.cliente.apellidos,
            email=factura.cliente.email,
            rol_id=factura.cliente.rol_id,
            rol_nombre=factura.cliente.rol_nombre,
            tipo_documento=factura.cliente.tipo_documento,
            numero_documento=factura.cliente.numero_documento,
            telefono=factura.cliente.telefono,
            direccion=factura.cliente.direccion,
            estado=factura.cliente.estado
        )
    return FacturaResponse(
        id=factura.id,
        numero_factura=factura.numero_factura,
        venta_id=factura.venta_id,
        cliente_id=factura.cliente_id,
        subtotal=factura.subtotal,
        impuestos=factura.impuestos,
        total=factura.total,
        estado=factura.estado,
        fecha_emision=factura.fecha_emision,
        fecha_vencimiento=factura.fecha_vencimiento,
        cliente=cliente_resp,
        detalles=detalles
    )


def _generar_numero_factura(db: Session) -> str:
    year = datetime.now().year
    ultima = (
        db.query(Factura)
        .filter(Factura.numero_factura.like(f"FAC-{year}-%"))
        .order_by(Factura.id.desc())
        .first()
    )
    if ultima:
        try:
            num = int(ultima.numero_factura.split("-")[-1]) + 1
        except (ValueError, IndexError):
            num = 1
    else:
        num = 1
    return f"FAC-{year}-{num:04d}"


@router.post("", status_code=201, summary="Generar factura desde una venta")
def crear_factura(
    body: FacturaFromVenta,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin_or_empleado)
):
    venta = db.query(Venta).filter(Venta.id == body.venta_id).first()
    if not venta:
        raise HTTPException(404, "Venta no encontrada")

    factura_existente = db.query(Factura).filter(Factura.venta_id == venta.id).first()
    if factura_existente:
        return {
            "success": True,
            "message": "La venta ya tiene una factura asociada",
            "factura": _build_factura_response(factura_existente)
        }

    numero = _generar_numero_factura(db)
    factura = Factura(
        numero_factura=numero,
        venta_id=venta.id,
        cliente_id=venta.cliente_id,
        subtotal=venta.subtotal,
        impuestos=venta.impuestos,
        total=venta.total,
        estado="Emitida",
        fecha_vencimiento=body.fecha_vencimiento or (datetime.now() + timedelta(days=30))
    )
    db.add(factura)
    db.flush()

    for dv in venta.detalles:
        db.add(DetalleFactura(
            factura_id=factura.id,
            detalle_venta_id=dv.id,
            descripcion=dv.descripcion_item,
            cantidad=dv.cantidad,
            precio_unitario=dv.precio_unitario - dv.descuento_unitario,
            subtotal=dv.subtotal
        ))

    db.commit()
    db.refresh(factura)

    return {
        "success": True,
        "message": f"Factura {numero} generada con éxito",
        "factura": _build_factura_response(factura)
    }


@router.get("", response_model=FacturaListResponse, summary="Listar facturas con filtros")
def list_facturas(
    numero_factura: Optional[str] = Query(None),
    cliente_id: Optional[int] = Query(None, gt=0),
    estado: Optional[str] = Query(None),
    fecha_inicio: Optional[str] = Query(None),
    fecha_fin: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_any_authenticated)
):
    query = db.query(Factura)

    if current_user.rol_nombre not in ["Administrador", "Empleado"]:
        query = query.filter(Factura.cliente_id == current_user.id)
    else:
        if cliente_id:
            query = query.filter(Factura.cliente_id == cliente_id)

    if numero_factura:
        query = query.filter(Factura.numero_factura.ilike(f"%{numero_factura}%"))
    if estado:
        query = query.filter(Factura.estado == estado)
    if fecha_inicio:
        try:
            fi = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
            query = query.filter(cast(Factura.fecha_emision, Date) >= fi)
        except ValueError:
            raise HTTPException(400, "Formato fecha_inicio inválido (YYYY-MM-DD)")
    if fecha_fin:
        try:
            ff = datetime.strptime(fecha_fin, "%Y-%m-%d").date()
            query = query.filter(cast(Factura.fecha_emision, Date) <= ff)
        except ValueError:
            raise HTTPException(400, "Formato fecha_fin inválido (YYYY-MM-DD)")

    total = query.count()
    facturas = query.order_by(Factura.fecha_emision.desc()).offset(skip).limit(limit).all()

    return FacturaListResponse(
        success=True,
        total=total,
        facturas=[_build_factura_response(f) for f in facturas]
    )


@router.get("/{factura_id}", response_model=FacturaResponse, summary="Obtener factura por ID")
def get_factura(
    factura_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_any_authenticated)
):
    factura = db.query(Factura).filter(Factura.id == factura_id).first()
    if not factura:
        raise HTTPException(404, "Factura no encontrada")
    if current_user.rol_nombre not in ["Administrador", "Empleado"] and factura.cliente_id != current_user.id:
        raise HTTPException(403, "No tienes acceso a esta factura")
    return _build_factura_response(factura)


@router.patch("/{factura_id}/estado", summary="Actualizar estado de factura")
def update_factura_estado(
    factura_id: int,
    body: FacturaEstadoUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin_or_empleado)
):
    factura = db.query(Factura).filter(Factura.id == factura_id).first()
    if not factura:
        raise HTTPException(404, "Factura no encontrada")
    factura.estado = body.estado
    db.commit()
    return {
        "success": True,
        "message": f"Factura {factura.numero_factura} actualizada a {body.estado}",
        "factura_id": factura.id,
        "nuevo_estado": body.estado
    }


@router.get("/{factura_id}/pdf", summary="Descargar factura en PDF")
def descargar_factura_pdf(
    factura_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_any_authenticated)
):
    try:
        from reportlab.lib.pagesizes import LETTER
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib import colors
    except ImportError:
        raise HTTPException(500, "reportlab no está instalado. Ejecute: pip install reportlab")

    factura = db.query(Factura).filter(Factura.id == factura_id).first()
    if not factura:
        raise HTTPException(404, "Factura no encontrada")
    if current_user.rol_nombre not in ["Administrador", "Empleado"] and factura.cliente_id != current_user.id:
        raise HTTPException(403, "No tienes acceso a esta factura")

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=LETTER)
    styles = getSampleStyleSheet()
    elements = []

    title_style = ParagraphStyle("CustomTitle", parent=styles["Title"], fontSize=22, textColor=colors.HexColor("#6F4E37"))
    h2_style = ParagraphStyle("H2", parent=styles["Heading2"], fontSize=13, textColor=colors.HexColor("#3b2a22"))
    normal = styles["Normal"]

    elements.append(Paragraph(settings.EMPRESA_NOMBRE, title_style))
    elements.append(Paragraph(f"NIT: {settings.EMPRESA_NIT} | Tel: {settings.EMPRESA_TELEFONO}", normal))
    elements.append(Paragraph(settings.EMPRESA_DIRECCION, normal))
    elements.append(Spacer(1, 0.3 * inch))

    elements.append(Paragraph(f"<b>FACTURA N° {factura.numero_factura}</b>", h2_style))
    info_data = [
        ["Fecha Emisión:", factura.fecha_emision.strftime("%Y-%m-%d %H:%M")],
        ["Fecha Vencimiento:", (factura.fecha_vencimiento.strftime("%Y-%m-%d") if factura.fecha_vencimiento else "N/A")],
        ["Estado:", factura.estado],
        ["Cliente:", f"{factura.cliente.nombres} {factura.cliente.apellidos}" if factura.cliente else "N/A"],
        ["Documento:", f"{factura.cliente.tipo_documento} {factura.cliente.numero_documento}" if factura.cliente else "N/A"],
        ["Dirección:", factura.cliente.direccion or "N/A" if factura.cliente else "N/A"],
        ["Teléfono:", factura.cliente.telefono or "N/A" if factura.cliente else "N/A"],
        ["Email:", factura.cliente.email if factura.cliente else "N/A"],
    ]
    info_table = Table(info_data, colWidths=[2 * inch, 4 * inch])
    info_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 0.3 * inch))

    elements.append(Paragraph("<b>Detalle de la Factura</b>", h2_style))
    detalle_header = ["#", "Descripción", "Cant.", "Precio Unit.", "Subtotal"]
    detalle_rows = [detalle_header]
    for idx, d in enumerate(factura.detalles, 1):
        detalle_rows.append([
            str(idx),
            d.descripcion,
            str(d.cantidad),
            f"${d.precio_unitario:,.2f}",
            f"${d.subtotal:,.2f}"
        ])
    detalle_table = Table(detalle_rows, colWidths=[0.4 * inch, 3.2 * inch, 0.7 * inch, 1.1 * inch, 1.1 * inch])
    detalle_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#6F4E37")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
    ]))
    elements.append(detalle_table)
    elements.append(Spacer(1, 0.3 * inch))

    total_data = [
        ["Subtotal:", f"${factura.subtotal:,.2f}"],
        ["Impuestos:", f"${factura.impuestos:,.2f}"],
        ["TOTAL:", f"${factura.total:,.2f}"],
    ]
    totales_t = Table(total_data, colWidths=[5.1 * inch, 1.4 * inch])
    totales_t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 11),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#6F4E37")),
        ("TEXTCOLOR", (0, -1), (-1, -1), colors.white),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(totales_t)
    elements.append(Spacer(1, 0.5 * inch))
    elements.append(Paragraph(f"Generado el: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles["Italic"]))

    doc.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Factura_{factura.numero_factura}.pdf"}
    )
