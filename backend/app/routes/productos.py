from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.producto import Producto
from app.models.usuario import Usuario
from app.schemas.producto import (
    ProductoCreate,
    ProductoUpdate,
    ProductoResponse,
    ProductoListResponse
)
from app.schemas.common import MessageResponse
from app.auth import require_admin_or_empleado

router = APIRouter(prefix="/productos", tags=["Catálogo de Productos"])

@router.get("", response_model=ProductoListResponse, summary="Listar catálogo de productos de café (Público)")
def list_products(
    categoria: Optional[str] = Query(None, description="Filtrar por categoría"),
    tipo_tueste: Optional[str] = Query(None, description="Filtrar por tipo de tueste"),
    search: Optional[str] = Query(None, description="Buscar por nombre o descripción"),
    solo_activos: bool = Query(True, description="Mostrar únicamente productos activos"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    Retorna el listado de productos de café disponibles con soporte de búsqueda y filtros.
    """
    query = db.query(Producto)

    if solo_activos:
        query = query.filter(Producto.estado == "Activo")

    if categoria:
        query = query.filter(Producto.categoria.ilike(f"%{categoria}%"))

    if tipo_tueste:
        query = query.filter(Producto.tipo_tueste.ilike(f"%{tipo_tueste}%"))

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Producto.nombre.ilike(search_pattern),
                Producto.descripcion.ilike(search_pattern),
                Producto.origen.ilike(search_pattern)
            )
        )

    total = query.count()
    productos = query.order_by(Producto.id.desc()).offset(skip).limit(limit).all()

    return ProductoListResponse(
        success=True,
        total=total,
        productos=[ProductoResponse.model_validate(p) for p in productos]
    )

@router.get("/categorias/todas", summary="Obtener lista de categorías de productos")
def get_categories(db: Session = Depends(get_db)):
    """Retorna las categorías únicas disponibles en los productos"""
    categories = db.query(Producto.categoria).distinct().all()
    return {
        "success": True,
        "categorias": [cat[0] for cat in categories if cat[0]]
    }

@router.get("/{producto_id}", response_model=ProductoResponse, summary="Obtener detalle de un producto por ID")
def get_product(producto_id: int, db: Session = Depends(get_db)):
    """Consulta la información detallada de un producto de café"""
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return producto

@router.post("", status_code=status.HTTP_201_CREATED, summary="Crear nuevo producto de café (Admin/Empleado)")
def create_product(
    prod_in: ProductoCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin_or_empleado)
):
    """Permite al Administrador o Empleado crear un nuevo producto en el catálogo"""
    nuevo_producto = Producto(
        nombre=prod_in.nombre.strip(),
        descripcion=prod_in.descripcion,
        origen=prod_in.origen,
        tipo_tueste=prod_in.tipo_tueste,
        categoria=prod_in.categoria or "Café en Grano",
        precio=prod_in.precio,
        stock=prod_in.stock,
        imagen_url=prod_in.get_imagen_url(),
        estado=prod_in.estado or "Activo"
    )

    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)

    return {
        "success": True,
        "message": "Producto de café creado exitosamente.",
        "producto": ProductoResponse.model_validate(nuevo_producto)
    }

@router.put("/{producto_id}", summary="Actualizar producto existente (Admin/Empleado)")
def update_product(
    producto_id: int,
    prod_in: ProductoUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin_or_empleado)
):
    """Permite a Administradores y Empleados actualizar precio, stock, descripción o imágenes del producto"""
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

    if prod_in.nombre is not None:
        producto.nombre = prod_in.nombre.strip()
    if prod_in.descripcion is not None:
        producto.descripcion = prod_in.descripcion
    if prod_in.origen is not None:
        producto.origen = prod_in.origen
    if prod_in.tipo_tueste is not None:
        producto.tipo_tueste = prod_in.tipo_tueste
    if prod_in.categoria is not None:
        producto.categoria = prod_in.categoria
    if prod_in.precio is not None:
        producto.precio = prod_in.precio
    if prod_in.stock is not None:
        producto.stock = prod_in.stock
    if prod_in.imagen_url is not None or prod_in.imagen is not None:
        producto.imagen_url = prod_in.get_imagen_url()
    if prod_in.estado is not None:
        producto.estado = prod_in.estado

    db.commit()
    db.refresh(producto)

    return {
        "success": True,
        "message": "Producto actualizado correctamente.",
        "producto": ProductoResponse.model_validate(producto)
    }

@router.delete("/{producto_id}", response_model=MessageResponse, summary="Eliminar producto de café (Admin/Empleado)")
def delete_product(
    producto_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin_or_empleado)
):
    """Elimina un producto del catálogo"""
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

    db.delete(producto)
    db.commit()

    return MessageResponse(success=True, message="Producto eliminado correctamente.")
