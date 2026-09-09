from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=False, index=True)
    descripcion = Column(Text, nullable=True)
    origen = Column(String(100), nullable=True, default="Colombia")
    tipo_tueste = Column(String(50), nullable=True, default="Medio")
    categoria = Column(String(50), nullable=False, default="Café en Grano", index=True)
    precio = Column(Numeric(10, 2), nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    imagen_url = Column(String(500), nullable=True)
    estado = Column(String(20), nullable=False, default="Activo", index=True)
    fecha_creacion = Column(DateTime, server_default=func.now(), nullable=False)

    # Relaciones
    carrito_items = relationship("CarritoItem", back_populates="producto", cascade="all, delete-orphan")
    detalles_pedido = relationship("DetallePedido", back_populates="producto")
