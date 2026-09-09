from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.carrito import CarritoItem
from app.models.producto import Producto
from app.models.usuario import Usuario
from app.schemas.carrito import (
    CarritoItemCreate,
    CarritoItemUpdate,
    CarritoItemResponse,
    CarritoResponse
)
from app.schemas.producto import ProductoResponse
from app.schemas.common import MessageResponse
from app.auth import get_current_active_user

router = APIRouter(prefix="/carrito", tags=["Carrito de Compras"])

@router.get("", response_model=CarritoResponse, summary="Obtener el carrito de compras del usuario autenticado")
def get_cart(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Retorna todos los artículos en el carrito del usuario actual, calculando subtotales y precio global.
    """
    items_db = (
        db.query(CarritoItem)
        .filter(CarritoItem.usuario_id == current_user.id)
        .order_by(CarritoItem.fecha_agregado.desc())
        .all()
    )

    items_response = []
    total_articulos = 0
    total_precio = Decimal("0.00")

    for item in items_db:
        subtotal = Decimal(str(item.producto.precio)) * Decimal(item.cantidad)
        total_articulos += item.cantidad
        total_precio += subtotal

        items_response.append(
            CarritoItemResponse(
                id=item.id,
                usuario_id=item.usuario_id,
                producto_id=item.producto_id,
                cantidad=item.cantidad,
                fecha_agregado=item.fecha_agregado,
                producto=ProductoResponse.model_validate(item.producto),
                subtotal=subtotal
            )
        )

    return CarritoResponse(
        success=True,
        total_articulos=total_articulos,
        total_precio=total_precio,
        items=items_response
    )

@router.post("", status_code=status.HTTP_201_CREATED, summary="Agregar un producto de café al carrito")
def add_to_cart(
    item_in: CarritoItemCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Agrega un producto al carrito del usuario autenticado. Si el producto ya estaba en el carrito, suma la cantidad.
    Valida la disponibilidad de stock en el inventario.
    """
    producto = db.query(Producto).filter(Producto.id == item_in.producto_id).first()
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto de café no encontrado")

    if producto.estado != "Activo":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El producto seleccionado no está disponible para la venta")

    if producto.stock < item_in.cantidad:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stock insuficiente. Solo quedan {producto.stock} unidades disponibles."
        )

    # Buscar si ya existe en el carrito
    existente = (
        db.query(CarritoItem)
        .filter(CarritoItem.usuario_id == current_user.id, CarritoItem.producto_id == item_in.producto_id)
        .first()
    )

    if existente:
        nueva_cantidad = existente.cantidad + item_in.cantidad
        if producto.stock < nueva_cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No puedes agregar más unidades. El stock máximo disponible es de {producto.stock}."
            )
        existente.cantidad = nueva_cantidad
        db.commit()
        db.refresh(existente)
        item_final = existente
    else:
        item_final = CarritoItem(
            usuario_id=current_user.id,
            producto_id=item_in.producto_id,
            cantidad=item_in.cantidad
        )
        db.add(item_final)
        db.commit()
        db.refresh(item_final)

    return {
        "success": True,
        "message": f"'{producto.nombre}' agregado al carrito correctamente.",
        "item_id": item_final.id,
        "cantidad": item_final.cantidad
    }

@router.put("/{item_id}", summary="Actualizar cantidad de un artículo en el carrito")
def update_cart_item(
    item_id: int,
    item_in: CarritoItemUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Permite ajustar la cantidad de un producto específico en el carrito"""
    item = (
        db.query(CarritoItem)
        .filter(CarritoItem.id == item_id, CarritoItem.usuario_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artículo de carrito no encontrado")

    if item.producto.stock < item_in.cantidad:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stock insuficiente. El stock máximo disponible es de {item.producto.stock}."
        )

    item.cantidad = item_in.cantidad
    db.commit()
    db.refresh(item)

    return {
        "success": True,
        "message": "Cantidad del carrito actualizada.",
        "item_id": item.id,
        "nueva_cantidad": item.cantidad
    }

@router.delete("/{item_id}", response_model=MessageResponse, summary="Eliminar un artículo del carrito")
def remove_cart_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Elimina un producto del carrito"""
    item = (
        db.query(CarritoItem)
        .filter(CarritoItem.id == item_id, CarritoItem.usuario_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artículo no encontrado en tu carrito")

    db.delete(item)
    db.commit()

    return MessageResponse(success=True, message="Artículo eliminado del carrito.")

@router.delete("", response_model=MessageResponse, summary="Vaciar todo el carrito de compras")
def clear_cart(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Elimina todos los productos del carrito del usuario actual"""
    db.query(CarritoItem).filter(CarritoItem.usuario_id == current_user.id).delete()
    db.commit()

    return MessageResponse(success=True, message="Carrito vaciado con éxito.")
