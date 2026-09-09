from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.models.usuario import Usuario, Rol
from app.schemas.auth import LoginRequest, TokenResponse, UserAuthInfo, PasswordResetRequest
from app.schemas.usuario import UsuarioCreate, UsuarioResponse
from app.schemas.common import MessageResponse
from app.auth import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    get_current_active_user
)

router = APIRouter(tags=["Autenticación"])

@router.post("/auth/login", response_model=TokenResponse, summary="Iniciar Sesión con Correo y Contraseña")
@router.post("/login", response_model=TokenResponse, include_in_schema=False)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """
    Autentica al usuario, valida credenciales y retorna un token JWT firmado junto con los datos de rol y perfil.
    """
    usuario = db.query(Usuario).filter(Usuario.email == credentials.email.lower().strip()).first()
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo electrónico o contraseña incorrectos"
        )

    if not verify_password(credentials.password, usuario.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo electrónico o contraseña incorrectos"
        )

    if usuario.estado != "Activo":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu cuenta se encuentra inactiva. Comunícate con soporte."
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_payload = {
        "sub": usuario.email,
        "id": usuario.id,
        "rol_id": usuario.rol_id,
        "rol_nombre": usuario.rol_nombre,
        "nombres": usuario.nombres,
        "apellidos": usuario.apellidos
    }
    access_token = create_access_token(data=token_payload, expires_delta=access_token_expires)

    user_info = UserAuthInfo(
        id=usuario.id,
        nombres=usuario.nombres,
        apellidos=usuario.apellidos,
        email=usuario.email,
        rol_id=usuario.rol_id,
        rol_nombre=usuario.rol_nombre,
        tipo_documento=usuario.tipo_documento,
        numero_documento=usuario.numero_documento,
        telefono=usuario.telefono,
        direccion=usuario.direccion,
        estado=usuario.estado
    )

    return TokenResponse(
        success=True,
        token=access_token,
        access_token=access_token,
        token_type="bearer",
        usuario=user_info,
        message="Inicio de sesión exitoso"
    )

@router.post("/auth/register", status_code=status.HTTP_201_CREATED, summary="Registro de Nuevos Usuarios (Clientes)")
@router.post("/register", status_code=status.HTTP_201_CREATED, include_in_schema=False)
def register(user_in: UsuarioCreate, db: Session = Depends(get_db)):
    """
    Crea un nuevo usuario en la plataforma. Por defecto se asigna rol Cliente (2).
    Verifica que no exista conflicto de email o documento.
    """
    email_clean = user_in.email.lower().strip()
    nombres_clean = user_in.get_nombres()
    apellidos_clean = user_in.get_apellidos()
    tipo_doc_clean = user_in.get_tipo_documento()
    num_doc_clean = user_in.get_numero_documento()
    rol_id_target = user_in.get_rol_id()

    # Verificar si el correo ya está registrado
    if db.query(Usuario).filter(Usuario.email == email_clean).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya se encuentra registrado."
        )

    # Verificar si el documento ya está registrado
    if db.query(Usuario).filter(
        Usuario.tipo_documento == tipo_doc_clean,
        Usuario.numero_documento == num_doc_clean
    ).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario con este tipo y número de documento."
        )

    # Verificar existencia del rol
    rol = db.query(Rol).filter(Rol.id == rol_id_target).first()
    if not rol:
        rol_id_target = 2  # Fallback a Cliente

    # Hashear contraseña
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
        "message": "Usuario registrado exitosamente.",
        "usuario": {
            "id": nuevo_usuario.id,
            "nombres": nuevo_usuario.nombres,
            "apellidos": nuevo_usuario.apellidos,
            "email": nuevo_usuario.email,
            "rol_id": nuevo_usuario.rol_id,
            "rol_nombre": nuevo_usuario.rol_nombre,
            "tipo_documento": nuevo_usuario.tipo_documento,
            "numero_documento": nuevo_usuario.numero_documento,
            "estado": nuevo_usuario.estado
        }
    }

@router.get("/auth/me", summary="Obtener Perfil del Usuario Autenticado")
def get_profile(current_user: Usuario = Depends(get_current_active_user)):
    """Retorna la información del usuario en sesión actual"""
    return {
        "success": True,
        "usuario": {
            "id": current_user.id,
            "nombres": current_user.nombres,
            "apellidos": current_user.apellidos,
            "email": current_user.email,
            "rol_id": current_user.rol_id,
            "rol_nombre": current_user.rol_nombre,
            "tipo_documento": current_user.tipo_documento,
            "numero_documento": current_user.numero_documento,
            "telefono": current_user.telefono,
            "direccion": current_user.direccion,
            "estado": current_user.estado,
            "fecha_registro": current_user.fecha_registro
        }
    }

@router.post("/auth/reset-password", response_model=MessageResponse, summary="Solicitar Restablecimiento de Contraseña")
def reset_password(req: PasswordResetRequest, db: Session = Depends(get_db)):
    """Simula o procesa la solicitud de restablecimiento de contraseña"""
    usuario = db.query(Usuario).filter(Usuario.email == req.email.lower().strip()).first()
    if not usuario:
        # Por seguridad no revelamos si el correo existe o no
        return MessageResponse(
            success=True,
            message="Si el correo existe en nuestro sistema, hemos enviado las instrucciones para restablecer tu contraseña."
        )
    return MessageResponse(
        success=True,
        message="Se han enviado las instrucciones de recuperación a tu correo electrónico."
    )
