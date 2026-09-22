import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.database import engine, Base
import app.models  # Asegurar importación de todos los modelos para SQLAlchemy
from app.routes import (
    auth_router,
    usuarios_router,
    productos_router,
    carrito_router,
    pedidos_router,
    servicios_router,
    ventas_router,
    facturas_router,
    reportes_router,
    estadisticas_router,
    pqr_router,
    chatbot_router
)

# Configuración de logs
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("cafeli_api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Eventos de inicio y apagado de la aplicación"""
    logger.info("Iniciando CafeLi Marketplace API...")
    try:
        # Crea las tablas si no existen en la base de datos
        Base.metadata.create_all(bind=engine)
        logger.info("Verificación de tablas en base de datos completada.")
    except Exception as e:
        logger.warning(f"Aviso al conectar con la base de datos en arranque: {e}")
        logger.warning("Asegúrate de que MySQL esté activo y que la base de datos esté creada.")
    yield
    logger.info("Deteniendo CafeLi Marketplace API...")

# Instancia de FastAPI
app = FastAPI(
    title="CafeLi Marketplace API",
    description="""
    API REST para la plataforma de comercio electrónico de café de especialidad **CafeLi**.
    
    ### Características principales:
    * 🔐 **Autenticación JWT** con Bcrypt y gestión de sesiones.
    * 🛡️ **Control de acceso basado en roles (RBAC)**: Administrador, Empleado, Cliente.
    * ☕ **Catálogo de Café**: Productos, categorías, tuestes, inventario y búsqueda.
    * 🛒 **Carrito de Compras**: Gestión de ítems por usuario con validación de stock.
    * 📦 **Gestión de Pedidos**: Checkout directo desde carrito o ítems, cálculo automático y trazabilidad de estados.
    * 👥 **Gestión de Usuarios**: Registro, activación y administración.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite orígenes en desarrollo (React Vite en localhost:5173 y 3000)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Manejador de errores de validación Pydantic
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = " -> ".join([str(loc) for loc in err.get("loc", []) if loc != "body"])
        msg = err.get("msg", "Error de validación")
        errors.append(f"{field}: {msg}" if field else msg)

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Error de validación en los datos enviados.",
            "errors": errors,
            "detail": exc.errors()
        }
    )

# Manejador de excepciones HTTP estándar
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail if isinstance(exc.detail, str) else "Error en la petición",
            "detail": exc.detail
        },
        headers=exc.headers
    )

# Manejador de errores generales no capturados
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Error no controlado en {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Error interno del servidor. Por favor intente más tarde.",
            "detail": str(exc) if settings.APP_DEBUG else None
        }
    )

# ------------------------------------------------------------------------------
# Inclusión de Rutas
# Soporta tanto /api/v1/... como /api/... para máxima compatibilidad con el frontend
# ------------------------------------------------------------------------------

# Versión 1 (/api/v1)
api_v1_routers = [
    auth_router,
    usuarios_router,
    productos_router,
    carrito_router,
    pedidos_router,
    servicios_router,
    ventas_router,
    facturas_router,
    reportes_router,
    estadisticas_router,
    pqr_router,
    chatbot_router
]

for r in api_v1_routers:
    app.include_router(r, prefix="/api/v1")
    app.include_router(r, prefix="/api")

# Endpoint raíz informativo
@app.get("/", summary="Estado de la API")
def root():
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
        "endpoints": {
            "auth": "/api/v1/auth",
            "usuarios": "/api/v1/usuarios",
            "productos": "/api/v1/productos",
            "carrito": "/api/v1/carrito",
            "pedidos": "/api/v1/pedidos",
            "servicios": "/api/v1/servicios"
        }
    }

@app.get("/health", summary="Health Check")
def health_check():
    return {"status": "healthy"}
