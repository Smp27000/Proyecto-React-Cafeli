from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class CarritoItem(Base):
    __tablename__ = "carrito"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    cantidad = Column(Integer, nullable=False, default=1)
    fecha_agregado = Column(DateTime, server_default=func.now(), nullable=False)

    # Restricción única: un usuario no debe tener registros duplicados para el mismo producto
    __table_args__ = (
        UniqueConstraint("usuario_id", "producto_id", name="uq_usuario_producto"),
    )

    # Relaciones
    usuario = relationship("Usuario", back_populates="carrito_items")
    producto = relationship("Producto", back_populates="carrito_items")
