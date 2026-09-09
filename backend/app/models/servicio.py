from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Servicio(Base):
    __tablename__ = "servicios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)
    precio = Column(Numeric(10, 2), nullable=False)
    duracion = Column(String(50), nullable=False, default="1 hora")
    estado = Column(String(20), nullable=False, default="Activo")
    fecha_creacion = Column(DateTime, server_default=func.now(), nullable=False)
