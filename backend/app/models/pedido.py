from sqlalchemy import Column, Integer, String, Text, Numeric, ForeignKey, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class EstadoPedido(str, enum.Enum):
    PENDIENTE = "Pendiente"
    PAGADO = "Pagado"
    PREPARANDO = "Preparando"
    ENVIADO = "Enviado"
    ENTREGADO = "Entregado"
    CANCELADO = "Cancelado"

class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="RESTRICT", onupdate="CASCADE"), nullable=False, index=True)
    total = Column(Numeric(12, 2), nullable=False, default=0.00)
    estado = Column(
        Enum("Pendiente", "Pagado", "Preparando", "Enviado", "Entregado", "Cancelado", name="estado_pedido_enum"),
        nullable=False,
        default="Pendiente",
        index=True
    )
    direccion_envio = Column(String(255), nullable=False)
    telefono_contacto = Column(String(20), nullable=True)
    metodo_pago = Column(String(50), nullable=False, default="Contraentrega")
    notas = Column(Text, nullable=True)
    fecha_creacion = Column(DateTime, server_default=func.now(), nullable=False)
    fecha_actualizacion = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relaciones
    usuario = relationship("Usuario", back_populates="pedidos")
    detalles = relationship("DetallePedido", back_populates="pedido", cascade="all, delete-orphan")


class DetallePedido(Base):
    __tablename__ = "detalle_pedidos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id", ondelete="RESTRICT", onupdate="CASCADE"), nullable=False, index=True)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(12, 2), nullable=False)

    # Relaciones
    pedido = relationship("Pedido", back_populates="detalles")
    producto = relationship("Producto", back_populates="detalles_pedido")
