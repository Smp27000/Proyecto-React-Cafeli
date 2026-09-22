from decimal import Decimal
from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, cast, Date

from app.database import get_db
from app.models.venta import Venta, DetalleVenta
from app.models.producto import Producto
from app.models.servicio import Servicio
from app.models.usuario import Usuario
from app.schemas.venta import (
    VentaCreate,
    VentaResponse,
    DetalleVentaResponse,
    VentaListResponse,
    VentaEstadoUpdate
)
from app.schemas.auth import UserAuthInfo
from app.schemas.common import MessageResponse
from app.auth import get_current_active_user, require_admin_or_empleado, require_any_authenticated
from app.config import settings

router = APIRouter(prefix="/ventas", tags=["Gestión de Ventas"])


def _build_venta_response(venta: Venta) -> VentaResponse:
    detalles_resp = [
        DetalleVentaResponse.model_validate(d) for d in venta.detalles
    ]

    usuario_resp = None
    if venta.usuario:
        usuario_resp = UserAuthInfo(
            id=venta.usuario.id,
            nombres=venta.usuario.nombres,
            apellidos=venta.usuario.apellidos,
            email=venta.usuario.email,
            rol_id=venta.usuario.rol_id,
            rol_nombre=venta.usuario.rol_nombre,
            tipo_documento=venta.usuario.tipo_documento,
            numero_documento=venta.usuario.numero_documento,
            telefono=venta.usuario.telefono,
            direccion=venta.usuario.direccion,
            estado=venta.usuario.estado
        )

    cliente_resp = None
    if venta.cliente:
        cliente_resp = UserAuthInfo(
            id=venta.cliente.id,
            nombres=venta.cliente.nombres,
            apellidos=venta.cliente.apellidos,
            email=venta.cliente.email,
            rol_id=venta.cliente.rol_id,
            rol_nombre=venta.cliente.rol_nombre,
            tipo_documento=venta.cliente.tipo_documento,
            numero_documento=venta.cliente.numero_documento,
            telefono=venta.cliente.telefono,
            direccion=venta.cliente.direccion,
            estado=venta.cliente.estado
        )

    return VentaResponse(
        id=venta.id,
        usuario_id=venta.usuario_id,
        cliente_id=venta.cliente_id,
        pedido_id=venta.pedido_id,
        subtotal=venta.subtotal,
        impuestos=venta.impuestos,
        descuento=venta.descuento,
        total=venta.total,
        metodo_pago=venta.metodo_pago,
        estado=venta.estado,
        notas=venta.notas,
        fecha_venta=venta.fecha_venta,
        usuario=usuario_resp,
        cliente=cliente_resp,
        detalles=detalles_resp
    )


@router.post("", status_code=status.HTTP_201_CREATED, summary="Registrar una nueva venta")
def create_venta(
    venta_in: VentaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin_or_empleado)
):
    cliente = db.query(Usuario).filter(Usuario.id == venta_in.cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    subtotal_venta = Decimal("0.00")
    total_descuento = Decimal(str(venta_in.descuento or "0.00"))
    detalles_creados = []

    for item in venta_in.items:
        precio_unitario = Decimal(str(item.precio_unitario))
        descuento_u = Decimal(str(item.descuento_unitario or "0.00"))
        precio_efectivo = precio_unitario - descuento_u
        subtotal_item = precio_efectivo * Decimal(item.cantidad)
        subtotal_venta += subtotal_item

        descripcion = item.descripcion_item
        producto_id = item.producto_id
        servicio_id = item.servicio_id

        if producto_id:
            prod = db.query(Producto).filter(Producto.id == producto_id).first()
            if prod:
                descripcion = descripcion or prod.nombre
                if prod.stock < item.cantidad:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Stock insuficiente para '{prod.nombre}'"
                    )
                prod.stock -= item.cantidad

        if servicio_id:
            serv = db.query(Servicio).filter(Servicio.id == servicio_id).first()
            if serv:
                descripcion = descripcion or serv.nombre

        detalles_creados.append(DetalleVenta(
            producto_id=producto_id,
            servicio_id=servicio_id,
            descripcion_item=descripcion,
            cantidad=item.cantidad,
            precio_unitario=precio_unitario,
            descuento_unitario=descuento_u,
            subtotal=subtotal_item,
            tipo_item=item.tipo_item
        ))

    impuestos = subtotal_venta * Decimal(str(settings.IMPUESTO_PORCENTAJE))
    total_venta = subtotal_venta + impuestos - total_descuento

    nueva_venta = Venta(
        usuario_id=current_user.id,
        cliente_id=venta_in.cliente_id,
        pedido_id=venta_in.pedido_id,
        subtotal=subtotal_venta,
        impuestos=impuestos,
        descuento=total_descuento,
        total=total_venta,
        metodo_pago=venta_in.metodo_pago or "Contraentrega",
        estado="Pagada",
        notas=venta_in.notas
    )
    db.add(nueva_venta)
    db.flush()

    for det in detalles_creados:
        det.venta_id = nueva_venta.id
        db.add(det)

    db.commit()
    db.refresh(nueva_venta)

    return {
        "success": True,
        "message": "Venta registrada con éxito",
        "venta": _build_venta_response(nueva_venta)
    }


@router.get("", response_model=VentaListResponse, summary="Listar ventas con filtros (Admin/Empleado)")
def list_ventas(
    fecha_inicio: Optional[str] = Query(None, description="Fecha inicio YYYY-MM-DD"),
    fecha_fin: Optional[str] = Query(None, description="Fecha fin YYYY-MM-DD"),
    cliente_id: Optional[int] = Query(None, gt=0),
    estado: Optional[str] = Query(None),
    metodo_pago: Optional[str] = Query(None),
    min_total: Optional[float] = Query(None, ge=0),
    max_total: Optional[float] = Query(None, ge=0),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin_or_empleado)
):
    query = db.query(Venta)

    if fecha_inicio:
        try:
            fi = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
            query = query.filter(cast(Venta.fecha_venta, Date) >= fi)
        except ValueError:
            raise HTTPException(400, "Formato de fecha_inicio inválido (YYYY-MM-DD)")
    if fecha_fin:
        try:
            ff = datetime.strptime(fecha_fin, "%Y-%m-%d").date()
            query = query.filter(cast(Venta.fecha_venta, Date) <= ff)
        except ValueError:
            raise HTTPException(400, "Formato de fecha_fin inválido (YYYY-MM-DD)")
    if cliente_id:
        query = query.filter(Venta.cliente_id == cliente_id)
    if estado:
        query = query.filter(Venta.estado == estado)
    if metodo_pago:
        query = query.filter(Venta.metodo_pago == metodo_pago)
    if min_total is not None:
        query = query.filter(Venta.total >= Decimal(str(min_total)))
    if max_total is not None:
        query = query.filter(Venta.total <= Decimal(str(max_total)))

    total = query.count()
    ventas = query.order_by(Venta.fecha_venta.desc()).offset(skip).limit(limit).all()

    return VentaListResponse(
        success=True,
        total=total,
        ventas=[_build_venta_response(v) for v in ventas]
    )


@router.get("/mis-ventas", response_model=VentaListResponse, summary="Historial de compras del cliente")
def get_mis_ventas(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    query = db.query(Venta).filter(Venta.cliente_id == current_user.id)
    total = query.count()
    ventas = query.order_by(Venta.fecha_venta.desc()).offset(skip).limit(limit).all()

    return VentaListResponse(
        success=True,
        total=total,
        ventas=[_build_venta_response(v) for v in ventas]
    )


@router.get("/{venta_id}", response_model=VentaResponse, summary="Obtener detalle de una venta")
def get_venta(
    venta_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_any_authenticated)
):
    venta = db.query(Venta).filter(Venta.id == venta_id).first()
    if not venta:
        raise HTTPException(404, "Venta no encontrada")

    if current_user.rol_nombre not in ["Administrador", "Empleado"] and venta.cliente_id != current_user.id:
        raise HTTPException(403, "No tienes acceso a esta venta")

    return _build_venta_response(venta)


@router.patch("/{venta_id}/estado", summary="Actualizar estado de una venta")
def update_venta_estado(
    venta_id: int,
    body: VentaEstadoUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin_or_empleado)
):
    venta = db.query(Venta).filter(Venta.id == venta_id).first()
    if not venta:
        raise HTTPException(404, "Venta no encontrada")

    estado_anterior = venta.estado
    venta.estado = body.estado

    if body.estado == "Anulada" and estado_anterior != "Anulada":
        for d in venta.detalles:
            if d.producto_id:
                prod = db.query(Producto).filter(Producto.id == d.producto_id).first()
                if prod:
                    prod.stock += d.cantidad

    db.commit()
    return {
        "success": True,
        "message": f"Estado de venta #{venta.id} actualizado a '{body.estado}'",
        "venta_id": venta.id,
        "nuevo_estado": body.estado
    }
