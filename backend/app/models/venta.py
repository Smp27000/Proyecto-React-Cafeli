from sqlalchemy import Column, Integer, String, Text, Numeric, ForeignKey, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Venta(Base):
    __tablename__ = "ventas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="RESTRICT", onupdate="CASCADE"), nullable=False, index=True)
    cliente_id = Column(Integer, ForeignKey("usuarios.id", ondelete="RESTRICT", onupdate="CASCADE"), nullable=False, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True, index=True)
    subtotal = Column(Numeric(12, 2), nullable=False, default=0.00)
    impuestos = Column(Numeric(12, 2), nullable=False, default=0.00)
    descuento = Column(Numeric(12, 2), nullable=False, default=0.00)
    total = Column(Numeric(12, 2), nullable=False, default=0.00)
    metodo_pago = Column(String(50), nullable=False, default="Contraentrega")
    estado = Column(
        Enum("Pendiente", "Pagada", "Anulada", "Devuelta", name="estado_venta_enum"),
        nullable=False,
        default="Pagada",
        index=True
    )
    notas = Column(Text, nullable=True)
    fecha_venta = Column(DateTime, server_default=func.now(), nullable=False, index=True)

    usuario = relationship("Usuario", foreign_keys=[usuario_id])
    cliente = relationship("Usuario", foreign_keys=[cliente_id])
    pedido = relationship("Pedido")
    detalles = relationship("DetalleVenta", back_populates="venta", cascade="all, delete-orphan")
    factura = relationship("Factura", back_populates="venta", uselist=False)


class DetalleVenta(Base):
    __tablename__ = "detalle_ventas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    venta_id = Column(Integer, ForeignKey("ventas.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True, index=True)
    servicio_id = Column(Integer, ForeignKey("servicios.id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True, index=True)
    descripcion_item = Column(String(255), nullable=False)
    cantidad = Column(Integer, nullable=False, default=1)
    precio_unitario = Column(Numeric(10, 2), nullable=False)
    descuento_unitario = Column(Numeric(10, 2), nullable=False, default=0.00)
    subtotal = Column(Numeric(12, 2), nullable=False)
    tipo_item = Column(
        Enum("Producto", "Servicio", name="tipo_item_enum"),
        nullable=False,
        default="Producto"
    )

    venta = relationship("Venta", back_populates="detalles")
    producto = relationship("Producto")
    servicio = relationship("Servicio")
