from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario, Rol
from app.schemas.usuario import (
    UsuarioCreate,
    UsuarioUpdate,
    UsuarioResponse,
    UsuarioStatusUpdate,
    UsuarioListResponse,
    RolBase
)
from app.schemas.common import MessageResponse
from app.auth import get_password_hash, require_admin, require_any_authenticated

router = APIRouter(prefix="/usuarios", tags=["Gestión de Usuarios"])

@router.get("", response_model=UsuarioListResponse, summary="Listar todos los usuarios (Admin)")
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    rol_id: Optional[int] = Query(None),
    estado: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin)
):
    """Obtiene la lista completa de usuarios registrados en el sistema."""
    query = db.query(Usuario)
    if rol_id is not None:
        query = query.filter(Usuario.rol_id == rol_id)
    if estado is not None:
        query = query.filter(Usuario.estado == estado)

    total = query.count()
    usuarios_db = query.order_by(Usuario.id.desc()).offset(skip).limit(limit).all()

    items = [
        UsuarioResponse(
            id=u.id,
            nombres=u.nombres,
            apellidos=u.apellidos,
            tipo_documento=u.tipo_documento,
            numero_documento=u.numero_documento,
            direccion=u.direccion,
            telefono=u.telefono,
            email=u.email,
            rol_id=u.rol_id,
            rol_nombre=u.rol_nombre,
            estado=u.estado,
            fecha_registro=u.fecha_registro
        )
        for u in usuarios_db
    ]

    return UsuarioListResponse(success=True, total=total, usuarios=items)

@router.get("/roles", response_model=List[RolBase], summary="Listar roles disponibles")
def list_roles(db: Session = Depends(get_db)):
    """Retorna los roles configurados en la base de datos."""
    return db.query(Rol).all()

@router.get("/{user_id}", response_model=UsuarioResponse, summary="Obtener usuario por ID")
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_any_authenticated)
):
    """Obtiene el detalle de un usuario específico. Clientes solo pueden ver su propio ID."""
    if current_user.rol_nombre != "Administrador" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para consultar información de otros usuarios."
        )

    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    return UsuarioResponse(
        id=usuario.id,
        nombres=usuario.nombres,
        apellidos=usuario.apellidos,
        tipo_documento=usuario.tipo_documento,
        numero_documento=usuario.numero_documento,
        direccion=usuario.direccion,
        telefono=usuario.telefono,
        email=usuario.email,
        rol_id=usuario.rol_id,
        rol_nombre=usuario.rol_nombre,
        estado=usuario.estado,
        fecha_registro=usuario.fecha_registro
    )

@router.post("", status_code=status.HTTP_201_CREATED, summary="Crear usuario desde panel administrativo")
def create_user(
    user_in: UsuarioCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin)
):
    """Permite al Administrador registrar usuarios asignando cualquier rol."""
    email_clean = user_in.email.lower().strip()
    nombres_clean = user_in.get_nombres()
    apellidos_clean = user_in.get_apellidos()
    tipo_doc_clean = user_in.get_tipo_documento()
    num_doc_clean = user_in.get_numero_documento()
    rol_id_target = user_in.get_rol_id()

    if db.query(Usuario).filter(Usuario.email == email_clean).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya se encuentra registrado."
        )

    if db.query(Usuario).filter(
        Usuario.tipo_documento == tipo_doc_clean,
        Usuario.numero_documento == num_doc_clean
    ).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario con este tipo y número de documento."
        )

    rol = db.query(Rol).filter(Rol.id == rol_id_target).first()
    if not rol:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El rol seleccionado no existe.")

    hashed_pwd = get_password_hash(user_in.password)

    nuevo_usuario = Usuario(
        nombres=nombres_clean,
        apellidos=apellidos_clean,
        tipo_documento=tipo_doc_clean,
        numero_documento=num_doc_clean,
        direccion=user_in.direccion,
        telefono=user_in.telefono,
        email=email_clean,
        password=hashed_pwd,
        rol_id=rol_id_target,
        estado=user_in.estado or "Activo"
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return {
        "success": True,
        "message": "Usuario creado exitosamente.",
        "usuario": {
            "id": nuevo_usuario.id,
            "nombres": nuevo_usuario.nombres,
            "apellidos": nuevo_usuario.apellidos,
            "email": nuevo_usuario.email,
            "rol_id": nuevo_usuario.rol_id,
            "rol_nombre": nuevo_usuario.rol_nombre,
            "estado": nuevo_usuario.estado
        }
    }

@router.put("/{user_id}", summary="Actualizar información de usuario")
def update_user(
    user_id: int,
    user_in: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_any_authenticated)
):
    """Actualiza datos del usuario. Clientes solo pueden editar su propio perfil."""
    if current_user.rol_nombre != "Administrador" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para modificar la información de otros usuarios."
        )

    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    # Actualizar nombres/apellidos
    if user_in.nombres or user_in.nombre:
        usuario.nombres = (user_in.nombres or user_in.nombre).strip()
    if user_in.apellidos or user_in.apellido:
        usuario.apellidos = (user_in.apellidos or user_in.apellido).strip()

    # Actualizar documentos
    if user_in.tipo_documento or user_in.tipoDocumento:
        usuario.tipo_documento = user_in.tipo_documento or user_in.tipoDocumento
    if user_in.numero_documento or user_in.numeroDocumento:
        usuario.numero_documento = str(user_in.numero_documento or user_in.numeroDocumento).strip()

    if user_in.direccion is not None:
        usuario.direccion = user_in.direccion
    if user_in.telefono is not None:
        usuario.telefono = user_in.telefono

    # Actualizar email si cambió
    if user_in.email:
        new_email = user_in.email.lower().strip()
        if new_email != usuario.email:
            if db.query(Usuario).filter(Usuario.email == new_email).first():
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El nuevo correo ya está en uso.")
            usuario.email = new_email

    # Actualizar password si se especificó
    if user_in.password:
        usuario.password = get_password_hash(user_in.password)

    # Solo Admin puede cambiar rol y estado
    if current_user.rol_nombre == "Administrador":
        if user_in.rol_id is not None:
            usuario.rol_id = int(user_in.rol_id)
        elif user_in.rolId is not None:
            usuario.rol_id = int(user_in.rolId)
        if user_in.estado is not None:
            usuario.estado = user_in.estado

    db.commit()
    db.refresh(usuario)

    return {
        "success": True,
        "message": "Usuario actualizado correctamente.",
        "usuario": {
            "id": usuario.id,
            "nombres": usuario.nombres,
            "apellidos": usuario.apellidos,
            "email": usuario.email,
            "rol_id": usuario.rol_id,
            "rol_nombre": usuario.rol_nombre,
            "estado": usuario.estado
        }
    }

@router.patch("/{user_id}/estado", summary="Cambiar estado del usuario (Activo / Inactivo)")
def toggle_user_status(
    user_id: int,
    status_in: UsuarioStatusUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Permite al Administrador activar o desactivar una cuenta de usuario."""
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    if usuario.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes cambiar el estado de tu propia cuenta de administrador."
        )

    usuario.estado = status_in.estado
    db.commit()
    db.refresh(usuario)

    return {
        "success": True,
        "message": f"Estado del usuario actualizado a '{usuario.estado}'.",
        "usuario_id": usuario.id,
        "nuevo_estado": usuario.estado
    }

@router.delete("/{user_id}", response_model=MessageResponse, summary="Eliminar usuario permanentemente (Admin)")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Elimina permanentemente un usuario de la base de datos."""
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    if usuario.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes eliminar tu propia cuenta de administrador."
        )

    db.delete(usuario)
    db.commit()

    return MessageResponse(success=True, message="Usuario eliminado correctamente.")
