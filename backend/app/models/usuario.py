from sqlalchemy import Column, Integer, String, Text, ForeignKey, Table, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

# Tabla intermedia de Roles y Permisos (Muchos a Muchos)
roles_permisos = Table(
    "roles_permisos",
    Base.metadata,
    Column("rol_id", Integer, ForeignKey("roles.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True),
    Column("permiso_id", Integer, ForeignKey("permisos.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)
)

class Rol(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(50), unique=True, nullable=False, index=True)
    descripcion = Column(String(255), nullable=True)
    fecha_creacion = Column(DateTime, server_default=func.now(), nullable=False)

    # Relaciones
    usuarios = relationship("Usuario", back_populates="rol")
    permisos = relationship("Permiso", secondary=roles_permisos, back_populates="roles")


class Permiso(Base):
    __tablename__ = "permisos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(50), unique=True, nullable=False, index=True)
    descripcion = Column(String(255), nullable=True)

    # Relaciones
    roles = relationship("Rol", secondary=roles_permisos, back_populates="permisos")


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombres = Column(String(50), nullable=False)
    apellidos = Column(String(50), nullable=False)
    tipo_documento = Column(String(10), nullable=False)
    numero_documento = Column(String(20), nullable=False)
    direccion = Column(String(100), nullable=True)
    telefono = Column(String(20), nullable=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    rol_id = Column(Integer, ForeignKey("roles.id", onupdate="CASCADE"), nullable=False, default=2)
    estado = Column(String(20), nullable=False, default="Activo")
    fecha_registro = Column(DateTime, server_default=func.now(), nullable=False)

    # Relaciones
    rol = relationship("Rol", back_populates="usuarios")
    carrito_items = relationship("CarritoItem", back_populates="usuario", cascade="all, delete-orphan")
    pedidos = relationship("Pedido", back_populates="usuario")

    @property
    def rol_nombre(self) -> str:
        return self.rol.nombre if self.rol else "Cliente"
