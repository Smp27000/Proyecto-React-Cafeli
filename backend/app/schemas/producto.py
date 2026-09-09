from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

class ProductoBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    descripcion: Optional[str] = None
    origen: Optional[str] = "Colombia"
    tipo_tueste: Optional[str] = "Medio"
    categoria: str = Field("Café en Grano", min_length=2, max_length=50)
    precio: Decimal = Field(..., gt=0)
    stock: int = Field(0, ge=0)
    imagen_url: Optional[str] = None
    estado: Optional[str] = "Activo"

class ProductoCreate(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    descripcion: Optional[str] = None
    origen: Optional[str] = "Colombia"
    tipo_tueste: Optional[str] = "Medio"
    categoria: Optional[str] = "Café en Grano"
    precio: Decimal = Field(..., gt=0)
    stock: int = Field(0, ge=0)
    imagen_url: Optional[str] = None
    imagen: Optional[str] = None  # Soporte para alias de campo
    estado: Optional[str] = "Activo"

    def get_imagen_url(self) -> Optional[str]:
        return self.imagen_url or self.imagen

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    origen: Optional[str] = None
    tipo_tueste: Optional[str] = None
    categoria: Optional[str] = None
    precio: Optional[Decimal] = None
    stock: Optional[int] = None
    imagen_url: Optional[str] = None
    imagen: Optional[str] = None
    estado: Optional[str] = None

    def get_imagen_url(self) -> Optional[str]:
        return self.imagen_url or self.imagen

class ProductoResponse(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    origen: Optional[str] = None
    tipo_tueste: Optional[str] = None
    categoria: str
    precio: Decimal
    stock: int
    imagen_url: Optional[str] = None
    estado: str
    fecha_creacion: datetime

    class Config:
        from_attributes = True

class ProductoListResponse(BaseModel):
    success: bool = True
    total: int
    productos: List[ProductoResponse]
