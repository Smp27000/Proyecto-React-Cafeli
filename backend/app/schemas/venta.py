from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field
from app.schemas.auth import UserAuthInfo


class DetalleVentaItemCreate(BaseModel):
    producto_id: Optional[int] = Field(None, gt=0)
    servicio_id: Optional[int] = Field(None, gt=0)
    descripcion_item: str = Field(..., min_length=2, max_length=255)
    cantidad: int = Field(..., gt=0)
    precio_unitario: Decimal = Field(..., ge=0)
    descuento_unitario: Decimal = Field(Decimal("0.00"), ge=0)
    tipo_item: str = Field("Producto", pattern="^(Producto|Servicio)$")


class VentaCreate(BaseModel):
    cliente_id: int = Field(..., gt=0)
    pedido_id: Optional[int] = Field(None, gt=0)
    metodo_pago: Optional[str] = Field("Contraentrega", max_length=50)
    descuento: Optional[Decimal] = Field(Decimal("0.00"), ge=0)
    notas: Optional[str] = Field(None, max_length=500)
    items: List[DetalleVentaItemCreate] = Field(..., min_length=1)


class DetalleVentaResponse(BaseModel):
    id: int
    venta_id: int
    producto_id: Optional[int] = None
    servicio_id: Optional[int] = None
    descripcion_item: str
    cantidad: int
    precio_unitario: Decimal
    descuento_unitario: Decimal
    subtotal: Decimal
    tipo_item: str

    class Config:
        from_attributes = True


class VentaResponse(BaseModel):
    id: int
    usuario_id: int
    cliente_id: int
    pedido_id: Optional[int] = None
    subtotal: Decimal
    impuestos: Decimal
    descuento: Decimal
    total: Decimal
    metodo_pago: str
    estado: str
    notas: Optional[str] = None
    fecha_venta: datetime
    usuario: Optional[UserAuthInfo] = None
    cliente: Optional[UserAuthInfo] = None
    detalles: List[DetalleVentaResponse] = []

    class Config:
        from_attributes = True


class VentaListResponse(BaseModel):
    success: bool = True
    total: int
    ventas: List[VentaResponse]


class VentaEstadoUpdate(BaseModel):
    estado: str = Field(..., pattern="^(Pendiente|Pagada|Anulada|Devuelta)$")
