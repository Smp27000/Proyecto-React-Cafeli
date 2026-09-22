from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class MensajeCreate(BaseModel):
    contenido: str = Field(..., min_length=1)
    session_id: Optional[str] = Field(None, max_length=100)


class MensajeResponse(BaseModel):
    id: int
    conversacion_id: int
    remitente: str
    contenido: str
    fecha_envio: datetime

    class Config:
        from_attributes = True


class ChatbotResponse(BaseModel):
    success: bool = True
    session_id: str
    respuesta: str
    mensajes: List[MensajeResponse] = []


class ConversacionResponse(BaseModel):
    id: int
    usuario_id: Optional[int] = None
    session_id: str
    titulo: Optional[str] = None
    origen: str
    fecha_inicio: datetime
    fecha_ultima_interaccion: datetime
    finalizada: bool
    mensajes: List[MensajeResponse] = []

    class Config:
        from_attributes = True


class ConversacionListResponse(BaseModel):
    success: bool = True
    total: int
    conversaciones: List[ConversacionResponse]
