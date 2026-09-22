from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Conversacion(Base):
    __tablename__ = "conversaciones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True, index=True)
    session_id = Column(String(100), unique=True, nullable=False, index=True)
    titulo = Column(String(200), nullable=True, default="Nueva conversación")
    origen = Column(
        Enum("Web", "WhatsApp", "Otro", name="origen_conversacion_enum"),
        nullable=False,
        default="Web"
    )
    fecha_inicio = Column(DateTime, server_default=func.now(), nullable=False)
    fecha_ultima_interaccion = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    finalizada = Column(Boolean, nullable=False, default=False)

    usuario = relationship("Usuario")
    mensajes = relationship("Mensaje", back_populates="conversacion", cascade="all, delete-orphan")


class Mensaje(Base):
    __tablename__ = "mensajes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    conversacion_id = Column(Integer, ForeignKey("conversaciones.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    remitente = Column(
        Enum("Usuario", "Bot", "Empleado", name="remitente_mensaje_enum"),
        nullable=False
    )
    contenido = Column(Text, nullable=False)
    fecha_envio = Column(DateTime, server_default=func.now(), nullable=False, index=True)

    conversacion = relationship("Conversacion", back_populates="mensajes")
