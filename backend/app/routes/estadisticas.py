from typing import Optional
from datetime import datetime, timedelta
from decimal import Decimal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date, Integer

from app.database import get_db
from app.models.venta import Venta, DetalleVenta
from app.models.factura import Factura
from app.models.pedido import Pedido
from app.models.pqr import PQR
from app.models.producto import Producto
from app.models.servicio import Servicio
from app.models.usuario import Usuario, Rol
from app.schemas.estadisticas import (
    KPIItem,
    KPIDashboardResponse,
    PuntoDatoGrafico,
    GraficoVentasResponse
)
from app.auth import require_admin_or_empleado, require_any_authenticated

router = APIRouter(prefix="/estadisticas", tags=["Estadísticas y Dashboards"])


@router.get("/kpis", response_model=KPIDashboardResponse, summary="KPIs generales para Dashboard")
def obtener_kpis(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_any_authenticated)
):
    es_admin = current_user.rol_nombre == "Administrador"
    es_empleado = current_user.rol_nombre == "Empleado"

    total_usuarios = db.query(Usuario).count()
    total_clientes = db.query(Usuario).join(Rol).filter(Rol.nombre == "Cliente").count()
    total_productos = db.query(Producto).filter(Producto.estado == "Activo").count()
    total_servicios = db.query(Servicio).filter(Servicio.estado == "Activo").count()
    total_ventas = db.query(Venta).filter(Venta.estado == "Pagada").count()
    total_facturacion = (
        db.query(func.coalesce(func.sum(Venta.total), Decimal("0.00")))
        .filter(Venta.estado == "Pagada")
        .scalar()
    )
    total_pqr = db.query(PQR).count()
    pqr_pendientes = db.query(PQR).filter(PQR.estado == "Pendiente").count()
    pqr_en_proceso = db.query(PQR).filter(PQR.estado == "EnProceso").count()
    total_pedidos = db.query(Pedido).count()
    pedidos_pendientes = db.query(Pedido).filter(Pedido.estado == "Pendiente").count()

    kpis = []
    if es_admin or es_empleado:
        kpis.extend([
            KPIItem(titulo="Total Usuarios", valor=total_usuarios, color="#3b82f6", icono="users"),
            KPIItem(titulo="Total Clientes", valor=total_clientes, color="#10b981", icono="user-group"),
            KPIItem(titulo="Productos Activos", valor=total_productos, color="#6F4E37", icono="package"),
            KPIItem(titulo="Servicios Activos", valor=total_servicios, color="#f59e0b", icono="wrench"),
            KPIItem(titulo="Ventas Pagadas", valor=total_ventas, color="#8b5cf6", icono="shopping-bag"),
            KPIItem(titulo="Facturación Total", valor=f"${float(total_facturacion):,.0f}", color="#ef4444", icono="dollar"),
            KPIItem(titulo="Total PQR", valor=total_pqr, color="#ec4899", icono="clipboard"),
            KPIItem(titulo="PQR Pendientes", valor=pqr_pendientes, color="#f97316", icono="clock"),
        ])

    if es_admin:
        kpis.extend([
            KPIItem(titulo="Total Pedidos", valor=total_pedidos, color="#14b8a6", icono="truck"),
            KPIItem(titulo="Pedidos Pendientes", valor=pedidos_pendientes, color="#a855f7", icono="hourglass"),
        ])

    if current_user.rol_nombre == "Cliente":
        mis_ventas = db.query(Venta).filter(Venta.cliente_id == current_user.id, Venta.estado == "Pagada").count()
        mis_pqr = db.query(PQR).filter(PQR.cliente_id == current_user.id).count()
        mis_pedidos = db.query(Pedido).filter(Pedido.usuario_id == current_user.id).count()
        kpis = [
            KPIItem(titulo="Mis Compras", valor=mis_ventas, color="#8b5cf6", icono="shopping-bag"),
            KPIItem(titulo="Mis Pedidos", valor=mis_pedidos, color="#14b8a6", icono="truck"),
            KPIItem(titulo="Mis PQR", valor=mis_pqr, color="#ec4899", icono="clipboard"),
        ]

    return KPIDashboardResponse(
        success=True,
        total_usuarios=total_usuarios,
        total_clientes=total_clientes,
        total_productos=total_productos,
        total_servicios=total_servicios,
        total_ventas=total_ventas,
        total_facturacion=total_facturacion,
        total_pqr=total_pqr,
        pqr_pendientes=pqr_pendientes,
        pqr_en_proceso=pqr_en_proceso,
        total_pedidos=total_pedidos,
        pedidos_pendientes=pedidos_pendientes,
        kpis=kpis
    )


@router.get("/ventas-graficos", response_model=GraficoVentasResponse, summary="Datos para gráficos de ventas")
def graficos_ventas(
    periodo: str = Query("mes", description="Periodo: dia | semana | mes"),
    fecha_inicio: Optional[str] = Query(None),
    fecha_fin: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin_or_empleado)
):
    now = datetime.now()
    if periodo == "dia":
        start = now - timedelta(days=7)
    elif periodo == "semana":
        start = now - timedelta(weeks=6)
    else:
        start = now - timedelta(days=90)

    if fecha_inicio:
        start = datetime.strptime(fecha_inicio, "%Y-%m-%d")
    if fecha_fin:
        end = datetime.strptime(fecha_fin, "%Y-%m-%d")
    else:
        end = now

    # Ventas por día (gráfico lineal y barras)
    q_por_dia = (
        db.query(
            cast(Venta.fecha_venta, Date).label("fecha"),
            func.coalesce(func.sum(Venta.total), Decimal("0.00")).label("total"),
            func.count(Venta.id).label("cantidad")
        )
        .filter(
            Venta.estado == "Pagada",
            cast(Venta.fecha_venta, Date) >= start.date(),
            cast(Venta.fecha_venta, Date) <= end.date()
        )
        .group_by(cast(Venta.fecha_venta, Date))
        .order_by("fecha")
        .all()
    )
    ventas_por_dia = [
        PuntoDatoGrafico(
            etiqueta=r.fecha.strftime("%d/%m") if hasattr(r.fecha, "strftime") else str(r.fecha),
            valor=r.total,
            extra={"cantidad": r.cantidad}
        )
        for r in q_por_dia
    ]

    # Ventas por semana
    q_semana = (
        db.query(
            func.yearweek(Venta.fecha_venta, 3).label("yw"),
            func.coalesce(func.sum(Venta.total), Decimal("0.00")).label("total")
        )
        .filter(Venta.estado == "Pagada", Venta.fecha_venta >= start, Venta.fecha_venta <= end)
        .group_by("yw")
        .order_by("yw")
        .all()
    )
    ventas_por_semana = [
        PuntoDatoGrafico(etiqueta=f"Sem {r.yw}", valor=r.total) for r in q_semana
    ]

    # Ventas por mes
    q_mes = (
        db.query(
            func.date_format(Venta.fecha_venta, "%Y-%m").label("mes"),
            func.coalesce(func.sum(Venta.total), Decimal("0.00")).label("total")
        )
        .filter(Venta.estado == "Pagada", Venta.fecha_venta >= start, Venta.fecha_venta <= end)
        .group_by("mes")
        .order_by("mes")
        .all()
    )
    ventas_por_mes = [
        PuntoDatoGrafico(etiqueta=r.mes, valor=r.total) for r in q_mes
    ]

    # Productos más vendidos
    q_productos = (
        db.query(
            DetalleVenta.descripcion_item.label("nombre"),
            func.coalesce(func.sum(DetalleVenta.cantidad), 0).label("cantidad"),
            func.coalesce(func.sum(DetalleVenta.subtotal), Decimal("0.00")).label("total")
        )
        .join(Venta, Venta.id == DetalleVenta.venta_id)
        .filter(Venta.estado == "Pagada", Venta.fecha_venta >= start, Venta.fecha_venta <= end)
        .group_by(DetalleVenta.descripcion_item)
        .order_by(func.sum(DetalleVenta.cantidad).desc())
        .limit(10)
        .all()
    )
    productos_mas_vendidos = [
        PuntoDatoGrafico(
            etiqueta=r.nombre[:25],
            valor=Decimal(r.cantidad),
            extra={"total_ventas": float(r.total)}
        )
        for r in q_productos
    ]

    # Ventas por método de pago
    q_mp = (
        db.query(
            func.coalesce(Venta.metodo_pago, "Otro").label("mp"),
            func.count(Venta.id).label("cantidad"),
            func.coalesce(func.sum(Venta.total), Decimal("0.00")).label("total")
        )
        .filter(Venta.estado == "Pagada", Venta.fecha_venta >= start, Venta.fecha_venta <= end)
        .group_by(Venta.metodo_pago)
        .order_by(func.sum(Venta.total).desc())
        .all()
    )
    ventas_por_metodo_pago = [
        PuntoDatoGrafico(etiqueta=r.mp, valor=r.total, extra={"cantidad": r.cantidad})
        for r in q_mp
    ]

    resumen = {
        "total_ventas_periodo": float(sum((v.valor for v in ventas_por_dia), Decimal("0.00"))),
        "numero_ventas": int(sum((v.extra.get("cantidad", 0) if v.extra else 0 for v in ventas_por_dia))),
        "fecha_inicio": start.date().isoformat(),
        "fecha_fin": end.date().isoformat(),
    }

    return GraficoVentasResponse(
        success=True,
        ventas_por_dia=ventas_por_dia,
        ventas_por_semana=ventas_por_semana,
        ventas_por_mes=ventas_por_mes,
        productos_mas_vendidos=productos_mas_vendidos,
        ventas_por_metodo_pago=ventas_por_metodo_pago,
        resumen=resumen
    )
