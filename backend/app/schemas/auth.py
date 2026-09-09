from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Correo electrónico del usuario")
    password: str = Field(..., min_length=1, description="Contraseña")

class UserAuthInfo(BaseModel):
    id: int
    nombres: str
    apellidos: str
    email: str
    rol_id: int
    rol_nombre: str
    tipo_documento: Optional[str] = None
    numero_documento: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    estado: str

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    success: bool = True
    token: str
    access_token: Optional[str] = None
    token_type: str = "bearer"
    usuario: UserAuthInfo
    message: Optional[str] = "Inicio de sesión exitoso"

class TokenData(BaseModel):
    email: Optional[str] = None
    rol_id: Optional[int] = None
    rol_nombre: Optional[str] = None

class PasswordResetRequest(BaseModel):
    email: EmailStr = Field(..., description="Correo electrónico para restablecimiento")
