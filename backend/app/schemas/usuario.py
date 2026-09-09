from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator
import re

class RolBase(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None

    class Config:
        from_attributes = True

class UsuarioBase(BaseModel):
    nombres: str = Field(..., min_length=2, max_length=50)
    apellidos: str = Field(..., min_length=2, max_length=50)
    tipo_documento: str = Field("CC", min_length=2, max_length=10)
    numero_documento: str = Field(..., min_length=5, max_length=20)
    direccion: Optional[str] = Field(None, max_length=100)
    telefono: Optional[str] = Field(None, max_length=20)
    email: EmailStr
    rol_id: int = Field(2, description="1: Administrador, 2: Cliente, 3: Empleado")
    estado: Optional[str] = "Activo"

    @field_validator("numero_documento")
    @classmethod
    def validate_document(cls, v: str) -> str:
        if not re.match(r"^[0-9A-Za-z-]+$", v):
            raise ValueError("El número de documento contiene caracteres inválidos")
        return v

class UsuarioCreate(BaseModel):
    # Soporta nombres tanto en formato snake_case como camelCase
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    tipo_documento: Optional[str] = None
    tipoDocumento: Optional[str] = None
    numero_documento: Optional[str] = None
    numeroDocumento: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    rol_id: Optional[int] = None
    rolId: Optional[int] = None
    estado: Optional[str] = "Activo"

    def get_nombres(self) -> str:
        val = self.nombres or self.nombre
        if not val:
            raise ValueError("El nombre es requerido")
        return val.strip()

    def get_apellidos(self) -> str:
        val = self.apellidos or self.apellido
        if not val:
            raise ValueError("El apellido es requerido")
        return val.strip()

    def get_tipo_documento(self) -> str:
        return self.tipo_documento or self.tipoDocumento or "CC"

    def get_numero_documento(self) -> str:
        val = self.numero_documento or self.numeroDocumento
        if not val:
            raise ValueError("El número de documento es requerido")
        return str(val).strip()

    def get_rol_id(self) -> int:
        if self.rol_id is not None:
            return int(self.rol_id)
        if self.rolId is not None:
            return int(self.rolId)
        return 2

class UsuarioUpdate(BaseModel):
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    tipo_documento: Optional[str] = None
    tipoDocumento: Optional[str] = None
    numero_documento: Optional[str] = None
    numeroDocumento: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    rol_id: Optional[int] = None
    rolId: Optional[int] = None
    estado: Optional[str] = None

class UsuarioStatusUpdate(BaseModel):
    estado: str = Field(..., pattern="^(Activo|Inactivo|Bloqueado)$")

class UsuarioResponse(BaseModel):
    id: int
    nombres: str
    apellidos: str
    tipo_documento: str
    numero_documento: str
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    email: str
    rol_id: int
    rol_nombre: str
    estado: str
    fecha_registro: datetime

    class Config:
        from_attributes = True

class UsuarioListResponse(BaseModel):
    success: bool = True
    total: int
    usuarios: List[UsuarioResponse]
