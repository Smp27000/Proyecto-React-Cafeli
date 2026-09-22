from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field
from app.schemas.auth import UserAuthInfo


class DetalleFacturaResponse(BaseModel):
    id: int
    factura_id: int
    detalle_venta_id: Optional[int] = None
    descripcion: str
    cantidad: int
    precio_unitario: Decimal
    subtotal: Decimal

    class Config:
        from_attributes = True


class FacturaResponse(BaseModel):
    id: int
    numero_factura: str
    venta_id: int
    cliente_id: int
    subtotal: Decimal
    impuestos: Decimal
    total: Decimal
    estado: str
    fecha_emision: datetime
    fecha_vencimiento: Optional[datetime] = None
    cliente: Optional[UserAuthInfo] = None
    detalles: List[DetalleFacturaResponse] = []

    class Config:
        from_attributes = True


class FacturaListResponse(BaseModel):
    success: bool = True
    total: int
    facturas: List[FacturaResponse]


class FacturaEstadoUpdate(BaseModel):
    estado: str = Field(..., pattern="^(Emitida|Pagada|Anulada|Vencida)$")


class FacturaFromVenta(BaseModel):
    venta_id: int = Field(..., gt=0)
    fecha_vencimiento: Optional[datetime] = None
