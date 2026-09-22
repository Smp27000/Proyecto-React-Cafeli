from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class PQR(Base):
    __tablename__ = "pqr"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    cliente_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    tipo = Column(
        Enum("Peticion", "Queja", "Reclamo", "Sugerencia", name="tipo_pqr_enum"),
        nullable=False,
        index=True
    )
    asunto = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=False)
    pedido_asociado_id = Column(Integer, ForeignKey("pedidos.id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True, index=True)
    respuesta = Column(Text, nullable=True)
    estado = Column(
        Enum("Pendiente", "EnProceso", "Respondida", "Cerrada", name="estado_pqr_enum"),
        nullable=False,
        default="Pendiente",
        index=True
    )
    prioridad = Column(
        Enum("Baja", "Media", "Alta", name="prioridad_pqr_enum"),
        nullable=False,
        default="Media"
    )
    usuario_asignado_id = Column(Integer, ForeignKey("usuarios.id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True, index=True)
    fecha_creacion = Column(DateTime, server_default=func.now(), nullable=False)
    fecha_actualizacion = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    fecha_cierre = Column(DateTime, nullable=True)

    cliente = relationship("Usuario", foreign_keys=[cliente_id])
    pedido_asociado = relationship("Pedido")
    usuario_asignado = relationship("Usuario", foreign_keys=[usuario_asignado_id])
