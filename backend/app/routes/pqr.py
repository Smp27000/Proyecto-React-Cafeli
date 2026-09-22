from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.pqr import PQR
from app.models.usuario import Usuario
from app.schemas.pqr import (
    PQRCreate,
    PQRUpdateEstado,
    PQRResponse,
    PQRListResponse
)
from app.schemas.auth import UserAuthInfo
from app.auth import get_current_active_user, require_admin_or_empleado, require_any_authenticated

router = APIRouter(prefix="/pqr", tags=["Gestión PQR (Peticiones, Quejas y Reclamos)"])


def _build_pqr_response(p: PQR) -> PQRResponse:
    cliente_resp = None
    if p.cliente:
        cliente_resp = UserAuthInfo(
            id=p.cliente.id,
            nombres=p.cliente.nombres,
            apellidos=p.cliente.apellidos,
            email=p.cliente.email,
            rol_id=p.cliente.rol_id,
            rol_nombre=p.cliente.rol_nombre,
            tipo_documento=p.cliente.tipo_documento,
            numero_documento=p.cliente.numero_documento,
            telefono=p.cliente.telefono,
            direccion=p.cliente.direccion,
            estado=p.cliente.estado
        )
    user_asig_resp = None
    if p.usuario_asignado:
        user_asig_resp = UserAuthInfo(
            id=p.usuario_asignado.id,
            nombres=p.usuario_asignado.nombres,
            apellidos=p.usuario_asignado.apellidos,
            email=p.usuario_asignado.email,
            rol_id=p.usuario_asignado.rol_id,
            rol_nombre=p.usuario_asignado.rol_nombre,
            tipo_documento=p.usuario_asignado.tipo_documento,
            numero_documento=p.usuario_asignado.numero_documento,
            telefono=p.usuario_asignado.telefono,
            direccion=p.usuario_asignado.direccion,
            estado=p.usuario_asignado.estado
        )
    return PQRResponse(
        id=p.id,
        cliente_id=p.cliente_id,
        tipo=p.tipo,
        asunto=p.asunto,
        descripcion=p.descripcion,
        pedido_asociado_id=p.pedido_asociado_id,
        respuesta=p.respuesta,
        estado=p.estado,
        prioridad=p.prioridad,
        usuario_asignado_id=p.usuario_asignado_id,
        fecha_creacion=p.fecha_creacion,
        fecha_actualizacion=p.fecha_actualizacion,
        fecha_cierre=p.fecha_cierre,
        cliente=cliente_resp,
        usuario_asignado=user_asig_resp
    )


@router.post("", status_code=201, summary="Registrar una nueva PQR (Cliente)")
def crear_pqr(
    body: PQRCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    nueva = PQR(
        cliente_id=current_user.id,
        tipo=body.tipo,
        asunto=body.asunto.strip(),
        descripcion=body.descripcion.strip(),
        pedido_asociado_id=body.pedido_asociado_id,
        estado="Pendiente",
        prioridad=body.prioridad or "Media"
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return {
        "success": True,
        "message": f"{body.tipo} registrada con éxito. Número #{nueva.id}",
        "pqr": _build_pqr_response(nueva)
    }


@router.get("", response_model=PQRListResponse, summary="Listar PQR con filtros")
def listar_pqr(
    cliente_id: Optional[int] = Query(None, gt=0),
    tipo: Optional[str] = Query(None),
    estado: Optional[str] = Query(None),
    prioridad: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=300),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_any_authenticated)
):
    query = db.query(PQR)

    if current_user.rol_nombre not in ["Administrador", "Empleado"]:
        query = query.filter(PQR.cliente_id == current_user.id)
    else:
        if cliente_id:
            query = query.filter(PQR.cliente_id == cliente_id)

    if tipo:
        query = query.filter(PQR.tipo == tipo)
    if estado:
        query = query.filter(PQR.estado == estado)
    if prioridad:
        query = query.filter(PQR.prioridad == prioridad)

    total = query.count()
    lista = query.order_by(PQR.fecha_creacion.desc()).offset(skip).limit(limit).all()

    return PQRListResponse(
        success=True,
        total=total,
        pqr=[_build_pqr_response(p) for p in lista]
    )


@router.get("/mis-pqr", response_model=PQRListResponse, summary="Mis PQR (Cliente)")
def mis_pqr(
    estado: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    query = db.query(PQR).filter(PQR.cliente_id == current_user.id)
    if estado:
        query = query.filter(PQR.estado == estado)
    total = query.count()
    lista = query.order_by(PQR.fecha_creacion.desc()).all()
    return PQRListResponse(success=True, total=total, pqr=[_build_pqr_response(p) for p in lista])


@router.get("/{pqr_id}", response_model=PQRResponse, summary="Obtener detalle de PQR")
def get_pqr(
    pqr_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_any_authenticated)
):
    p = db.query(PQR).filter(PQR.id == pqr_id).first()
    if not p:
        raise HTTPException(404, "PQR no encontrada")
    if current_user.rol_nombre not in ["Administrador", "Empleado"] and p.cliente_id != current_user.id:
        raise HTTPException(403, "No tienes acceso a esta PQR")
    return _build_pqr_response(p)


@router.patch("/{pqr_id}/gestionar", summary="Gestionar PQR (Admin/Empleado)")
def gestionar_pqr(
    pqr_id: int,
    body: PQRUpdateEstado,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin_or_empleado)
):
    p = db.query(PQR).filter(PQR.id == pqr_id).first()
    if not p:
        raise HTTPException(404, "PQR no encontrada")

    p.estado = body.estado
    if body.respuesta:
        p.respuesta = body.respuesta.strip()
        if body.estado in ("Respondida", "Cerrada") and p.fecha_cierre is None:
            if body.estado == "Cerrada":
                p.fecha_cierre = datetime.now()
        elif p.fecha_cierre and body.estado not in ("Respondida", "Cerrada"):
            p.fecha_cierre = None
    if body.usuario_asignado_id:
        asig = db.query(Usuario).filter(Usuario.id == body.usuario_asignado_id).first()
        if not asig or asig.rol_nombre not in ("Administrador", "Empleado"):
            raise HTTPException(400, "Usuario asignado inválido (debe ser Admin o Empleado)")
        p.usuario_asignado_id = body.usuario_asignado_id
    else:
        if not p.usuario_asignado_id:
            p.usuario_asignado_id = current_user.id

    db.commit()
    return {
        "success": True,
        "message": f"PQR #{p.id} actualizada a estado '{body.estado}'",
        "pqr_id": p.id,
        "nuevo_estado": body.estado
    }
