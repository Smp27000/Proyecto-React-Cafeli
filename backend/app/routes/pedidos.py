from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.pedido import Pedido, DetallePedido
from app.models.carrito import CarritoItem
from app.models.producto import Producto
from app.models.usuario import Usuario
from app.schemas.pedido import (
    PedidoCreate,
    PedidoResponse,
    DetallePedidoResponse,
    PedidoStatusUpdate,
    PedidoListResponse
)
from app.schemas.producto import ProductoResponse
from app.schemas.auth import UserAuthInfo
from app.schemas.common import MessageResponse
from app.auth import get_current_active_user, require_admin_or_empleado, require_any_authenticated

router = APIRouter(prefix="/pedidos", tags=["Gestión de Pedidos"])

def _build_pedido_response(pedido: Pedido) -> PedidoResponse:
    """Helper para estructurar la respuesta de un pedido con sus relaciones completas"""
    detalles_resp = []
    for d in pedido.detalles:
        detalles_resp.append(
            DetallePedidoResponse(
                id=d.id,
                pedido_id=d.pedido_id,
                producto_id=d.producto_id,
                cantidad=d.cantidad,
                precio_unitario=d.precio_unitario,
                subtotal=d.subtotal,
                producto=ProductoResponse.model_validate(d.producto) if d.producto else None
            )
        )

    usuario_resp = None
    if pedido.usuario:
        usuario_resp = UserAuthInfo(
            id=pedido.usuario.id,
            nombres=pedido.usuario.nombres,
            apellidos=pedido.usuario.apellidos,
            email=pedido.usuario.email,
            rol_id=pedido.usuario.rol_id,
            rol_nombre=pedido.usuario.rol_nombre,
            tipo_documento=pedido.usuario.tipo_documento,
            numero_documento=pedido.usuario.numero_documento,
            telefono=pedido.usuario.telefono,
            direccion=pedido.usuario.direccion,
            estado=pedido.usuario.estado
        )

    return PedidoResponse(
        id=pedido.id,
        usuario_id=pedido.usuario_id,
        total=pedido.total,
        estado=pedido.estado,
        direccion_envio=pedido.direccion_envio,
        telefono_contacto=pedido.telefono_contacto,
        metodo_pago=pedido.metodo_pago,
        notas=pedido.notas,
        fecha_creacion=pedido.fecha_creacion,
        fecha_actualizacion=pedido.fecha_actualizacion,
        usuario=usuario_resp,
        detalles=detalles_resp
    )

@router.post("", status_code=status.HTTP_201_CREATED, summary="Crear un nuevo pedido / Checkout")
def create_order(
    pedido_in: PedidoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Crea una orden de compra.
    - Si se omiten los items, toma automáticamente los productos del carrito del usuario.
    - Valida y descuenta el stock en una transacción segura.
    - Vacía el carrito del usuario tras completar la orden con éxito.
    """
    items_to_process = []

    if pedido_in.items and len(pedido_in.items) > 0:
        for item in pedido_in.items:
            prod = db.query(Producto).filter(Producto.id == item.producto_id).first()
            if not prod:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Producto con ID {item.producto_id} no encontrado")
            items_to_process.append((prod, item.cantidad))
    else:
        # Tomar items del carrito
        carrito_items = db.query(CarritoItem).filter(CarritoItem.usuario_id == current_user.id).all()
        if not carrito_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El carrito de compras está vacío. Agrega productos antes de generar un pedido."
            )
        for c in carrito_items:
            items_to_process.append((c.producto, c.cantidad))

    # Validar stock para todos los productos
    for prod, cant in items_to_process:
        if prod.estado != "Activo":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El producto '{prod.nombre}' ya no se encuentra activo para la venta."
            )
        if prod.stock < cant:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente para '{prod.nombre}'. Disponible: {prod.stock}, Solicitado: {cant}."
            )

    # Calcular total y preparar orden
    total_pedido = Decimal("0.00")
    telefono_final = pedido_in.telefono_contacto or current_user.telefono

    nuevo_pedido = Pedido(
        usuario_id=current_user.id,
        total=Decimal("0.00"),
        estado="Pendiente",
        direccion_envio=pedido_in.direccion_envio.strip(),
        telefono_contacto=telefono_final,
        metodo_pago=pedido_in.metodo_pago or "Contraentrega",
        notas=pedido_in.notas
    )
    db.add(nuevo_pedido)
    db.flush()  # Obtener el ID asignado al pedido

    # Crear detalles y descontar stock
    for prod, cant in items_to_process:
        precio_unitario = Decimal(str(prod.precio))
        subtotal = precio_unitario * Decimal(cant)
        total_pedido += subtotal

        # Descontar inventario
        prod.stock -= cant

        detalle = DetallePedido(
            pedido_id=nuevo_pedido.id,
            producto_id=prod.id,
            cantidad=cant,
            precio_unitario=precio_unitario,
            subtotal=subtotal
        )
        db.add(detalle)

    nuevo_pedido.total = total_pedido

    # Si se originó desde el carrito, vaciarlo
    if not pedido_in.items or len(pedido_in.items) == 0:
        db.query(CarritoItem).filter(CarritoItem.usuario_id == current_user.id).delete()

    db.commit()
    db.refresh(nuevo_pedido)

    return {
        "success": True,
        "message": "¡Pedido generado con éxito!",
        "pedido": _build_pedido_response(nuevo_pedido)
    }

@router.get("/mis-pedidos", response_model=PedidoListResponse, summary="Listar pedidos del usuario autenticado (Cliente)")
def get_my_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Retorna el historial completo de pedidos realizados por el usuario en sesión."""
    query = db.query(Pedido).filter(Pedido.usuario_id == current_user.id)
    total = query.count()
    pedidos = query.order_by(Pedido.id.desc()).offset(skip).limit(limit).all()

    return PedidoListResponse(
        success=True,
        total=total,
        pedidos=[_build_pedido_response(p) for p in pedidos]
    )

@router.get("", response_model=PedidoListResponse, summary="Listar todos los pedidos de la tienda (Admin/Empleado)")
def list_all_orders(
    estado: Optional[str] = Query(None, description="Filtrar por estado del pedido"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin_or_empleado)
):
    """Permite al personal administrativo consultar y filtrar todos los pedidos del marketplace."""
    query = db.query(Pedido)
    if estado:
        query = query.filter(Pedido.estado == estado)

    total = query.count()
    pedidos = query.order_by(Pedido.id.desc()).offset(skip).limit(limit).all()

    return PedidoListResponse(
        success=True,
        total=total,
        pedidos=[_build_pedido_response(p) for p in pedidos]
    )

@router.get("/{pedido_id}", response_model=PedidoResponse, summary="Obtener el detalle de un pedido")
def get_order_by_id(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_any_authenticated)
):
    """Consulta la información completa y artículos de un pedido por su identificador."""
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")

    # Clientes solo pueden ver sus propios pedidos
    if current_user.rol_nombre not in ["Administrador", "Empleado"] and pedido.usuario_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes acceso a este pedido.")

    return _build_pedido_response(pedido)

@router.patch("/{pedido_id}/estado", summary="Actualizar estado del pedido (Admin/Empleado)")
def update_order_status(
    pedido_id: int,
    status_in: PedidoStatusUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin_or_empleado)
):
    """
    Permite cambiar el estado de un pedido (ej. 'Pendiente' -> 'Preparando' -> 'Enviado' -> 'Entregado' o 'Cancelado').
    Si el pedido se cancela, reincorpora automáticamente las unidades al stock disponible.
    """
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")

    estado_anterior = pedido.estado
    nuevo_estado = status_in.estado

    # Si se cancela y no estaba cancelado previamente, restablecer inventario
    if nuevo_estado == "Cancelado" and estado_anterior != "Cancelado":
        for d in pedido.detalles:
            if d.producto:
                d.producto.stock += d.cantidad

    # Si se reactiva un pedido cancelado, validar y volver a descontar
    elif estado_anterior == "Cancelado" and nuevo_estado != "Cancelado":
        for d in pedido.detalles:
            if d.producto:
                if d.producto.stock < d.cantidad:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"No se puede reactivar el pedido: Stock insuficiente para '{d.producto.nombre}'."
                    )
                d.producto.stock -= d.cantidad

    pedido.estado = nuevo_estado
    db.commit()
    db.refresh(pedido)

    return {
        "success": True,
        "message": f"Estado del pedido #{pedido.id} actualizado a '{pedido.estado}'.",
        "pedido_id": pedido.id,
        "nuevo_estado": pedido.estado
    }
