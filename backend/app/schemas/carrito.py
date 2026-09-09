from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field
from app.schemas.producto import ProductoResponse

class CarritoItemCreate(BaseModel):
    producto_id: int = Field(..., gt=0, description="ID del producto de café a agregar")
    cantidad: int = Field(1, gt=0, description="Cantidad a agregar")

class CarritoItemUpdate(BaseModel):
    cantidad: int = Field(..., gt=0, description="Nueva cantidad para el producto")

class CarritoItemResponse(BaseModel):
    id: int
    usuario_id: int
    producto_id: int
    cantidad: int
    fecha_agregado: datetime
    producto: ProductoResponse
    subtotal: Decimal

    class Config:
        from_attributes = True

class CarritoResponse(BaseModel):
    success: bool = True
    total_articulos: int = 0
    total_precio: Decimal = Decimal("0.00")
    items: List[CarritoItemResponse] = []
