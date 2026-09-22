from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.auth import UserAuthInfo


class PQRCreate(BaseModel):
    tipo: str = Field(..., pattern="^(Peticion|Queja|Reclamo|Sugerencia)$")
    asunto: str = Field(..., min_length=5, max_length=200)
    descripcion: str = Field(..., min_length=10)
    pedido_asociado_id: Optional[int] = Field(None, gt=0)
    prioridad: Optional[str] = Field("Media", pattern="^(Baja|Media|Alta)$")


class PQRUpdateEstado(BaseModel):
    estado: str = Field(..., pattern="^(Pendiente|EnProceso|Respondida|Cerrada)$")
    respuesta: Optional[str] = Field(None, min_length=5)
    usuario_asignado_id: Optional[int] = Field(None, gt=0)


class PQRResponse(BaseModel):
    id: int
    cliente_id: int
    tipo: str
    asunto: str
    descripcion: str
    pedido_asociado_id: Optional[int] = None
    respuesta: Optional[str] = None
    estado: str
    prioridad: str
    usuario_asignado_id: Optional[int] = None
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    fecha_cierre: Optional[datetime] = None
    cliente: Optional[UserAuthInfo] = None
    usuario_asignado: Optional[UserAuthInfo] = None

    class Config:
        from_attributes = True


class PQRListResponse(BaseModel):
    success: bool = True
    total: int
    pqr: List[PQRResponse]
