from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field
from app.schemas.producto import ProductoResponse
from app.schemas.auth import UserAuthInfo

class PedidoItemDirecto(BaseModel):
    producto_id: int = Field(..., gt=0)
    cantidad: int = Field(..., gt=0)

class PedidoCreate(BaseModel):
    direccion_envio: str = Field(..., min_length=5, max_length=255, description="Dirección de entrega")
    telefono_contacto: Optional[str] = Field(None, max_length=20, description="Teléfono de contacto")
    metodo_pago: Optional[str] = Field("Contraentrega", description="Método de pago (Contraentrega, Tarjeta, Transferencia)")
    notas: Optional[str] = Field(None, max_length=500, description="Instrucciones especiales de entrega")
    items: Optional[List[PedidoItemDirecto]] = Field(
        None, 
        description="Lista opcional de artículos. Si no se envía, se procesará automáticamente el carrito actual del usuario."
    )

class DetallePedidoResponse(BaseModel):
    id: int
    pedido_id: int
    producto_id: int
    cantidad: int
    precio_unitario: Decimal
    subtotal: Decimal
    producto: Optional[ProductoResponse] = None

    class Config:
        from_attributes = True

class PedidoResponse(BaseModel):
    id: int
    usuario_id: int
    total: Decimal
    estado: str
    direccion_envio: str
    telefono_contacto: Optional[str] = None
    metodo_pago: str
    notas: Optional[str] = None
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    usuario: Optional[UserAuthInfo] = None
    detalles: List[DetallePedidoResponse] = []

    class Config:
        from_attributes = True

class PedidoStatusUpdate(BaseModel):
    estado: str = Field(..., pattern="^(Pendiente|Pagado|Preparando|Enviado|Entregado|Cancelado)$")

class PedidoListResponse(BaseModel):
    success: bool = True
    total: int
    pedidos: List[PedidoResponse]
