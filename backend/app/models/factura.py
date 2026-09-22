from sqlalchemy import Column, Integer, String, Text, Numeric, ForeignKey, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Factura(Base):
    __tablename__ = "facturas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    numero_factura = Column(String(30), unique=True, nullable=False, index=True)
    venta_id = Column(Integer, ForeignKey("ventas.id", ondelete="RESTRICT", onupdate="CASCADE"), nullable=False, index=True)
    cliente_id = Column(Integer, ForeignKey("usuarios.id", ondelete="RESTRICT", onupdate="CASCADE"), nullable=False, index=True)
    subtotal = Column(Numeric(12, 2), nullable=False, default=0.00)
    impuestos = Column(Numeric(12, 2), nullable=False, default=0.00)
    total = Column(Numeric(12, 2), nullable=False, default=0.00)
    estado = Column(
        Enum("Emitida", "Pagada", "Anulada", "Vencida", name="estado_factura_enum"),
        nullable=False,
        default="Emitida",
        index=True
    )
    fecha_emision = Column(DateTime, server_default=func.now(), nullable=False, index=True)
    fecha_vencimiento = Column(DateTime, nullable=True)

    venta = relationship("Venta", back_populates="factura")
    cliente = relationship("Usuario", foreign_keys=[cliente_id])
    detalles = relationship("DetalleFactura", back_populates="factura", cascade="all, delete-orphan")


class DetalleFactura(Base):
    __tablename__ = "detalle_facturas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    factura_id = Column(Integer, ForeignKey("facturas.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    detalle_venta_id = Column(Integer, ForeignKey("detalle_ventas.id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True, index=True)
    descripcion = Column(String(255), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(12, 2), nullable=False)

    factura = relationship("Factura", back_populates="detalles")
    detalle_venta = relationship("DetalleVenta")
