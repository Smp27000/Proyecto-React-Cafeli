from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

class ServicioBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    descripcion: Optional[str] = None
    precio: Decimal = Field(..., gt=0)
    duracion: Optional[str] = Field("1 hora", max_length=50)
    estado: Optional[str] = "Activo"

class ServicioCreate(ServicioBase):
    pass

class ServicioUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[Decimal] = None
    duracion: Optional[str] = None
    estado: Optional[str] = None

class ServicioResponse(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    precio: Decimal
    duracion: str
    estado: str
    fecha_creacion: datetime

    class Config:
        from_attributes = True

class ServicioListResponse(BaseModel):
    success: bool = True
    total: int
    servicios: List[ServicioResponse]
