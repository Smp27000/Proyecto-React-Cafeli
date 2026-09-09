from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.servicio import Servicio
from app.models.usuario import Usuario
from app.schemas.servicio import (
    ServicioCreate,
    ServicioUpdate,
    ServicioResponse,
    ServicioListResponse
)
from app.schemas.common import MessageResponse
from app.auth import require_admin_or_empleado

router = APIRouter(prefix="/servicios", tags=["Servicios de Café y Barismo"])

@router.get("", response_model=ServicioListResponse, summary="Listar servicios disponibles (Público)")
def list_services(
    solo_activos: bool = Query(True),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Retorna los servicios ofrecidos por la tienda (catas, talleres, mantenimiento)"""
    query = db.query(Servicio)
    if solo_activos:
        query = query.filter(Servicio.estado == "Activo")

    total = query.count()
    servicios = query.order_by(Servicio.id.desc()).offset(skip).limit(limit).all()

    return ServicioListResponse(
        success=True,
        total=total,
        servicios=[ServicioResponse.model_validate(s) for s in servicios]
    )

@router.get("/{servicio_id}", response_model=ServicioResponse, summary="Consultar detalle de un servicio")
def get_service(servicio_id: int, db: Session = Depends(get_db)):
    """Consulta la información de un servicio por su ID"""
    servicio = db.query(Servicio).filter(Servicio.id == servicio_id).first()
    if not servicio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Servicio no encontrado")
    return servicio

@router.post("", status_code=status.HTTP_201_CREATED, summary="Crear un nuevo servicio (Admin/Empleado)")
def create_service(
    serv_in: ServicioCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin_or_empleado)
):
    """Permite crear un nuevo servicio en la plataforma"""
    nuevo_servicio = Servicio(
        nombre=serv_in.nombre.strip(),
        descripcion=serv_in.descripcion,
        precio=serv_in.precio,
        duracion=serv_in.duracion or "1 hora",
        estado=serv_in.estado or "Activo"
    )

    db.add(nuevo_servicio)
    db.commit()
    db.refresh(nuevo_servicio)

    return {
        "success": True,
        "message": "Servicio registrado exitosamente.",
        "servicio": ServicioResponse.model_validate(nuevo_servicio)
    }

@router.put("/{servicio_id}", summary="Actualizar servicio existente (Admin/Empleado)")
def update_service(
    servicio_id: int,
    serv_in: ServicioUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin_or_empleado)
):
    """Permite actualizar la información de un servicio"""
    servicio = db.query(Servicio).filter(Servicio.id == servicio_id).first()
    if not servicio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Servicio no encontrado")

    if serv_in.nombre is not None:
        servicio.nombre = serv_in.nombre.strip()
    if serv_in.descripcion is not None:
        servicio.descripcion = serv_in.descripcion
    if serv_in.precio is not None:
        servicio.precio = serv_in.precio
    if serv_in.duracion is not None:
        servicio.duracion = serv_in.duracion
    if serv_in.estado is not None:
        servicio.estado = serv_in.estado

    db.commit()
    db.refresh(servicio)

    return {
        "success": True,
        "message": "Servicio actualizado correctamente.",
        "servicio": ServicioResponse.model_validate(servicio)
    }

@router.delete("/{servicio_id}", response_model=MessageResponse, summary="Eliminar servicio (Admin/Empleado)")
def delete_service(
    servicio_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin_or_empleado)
):
    """Elimina un servicio de la plataforma"""
    servicio = db.query(Servicio).filter(Servicio.id == servicio_id).first()
    if not servicio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Servicio no encontrado")

    db.delete(servicio)
    db.commit()

    return MessageResponse(success=True, message="Servicio eliminado correctamente.")
