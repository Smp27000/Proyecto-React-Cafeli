from app.routes.auth import router as auth_router
from app.routes.usuarios import router as usuarios_router
from app.routes.productos import router as productos_router
from app.routes.carrito import router as carrito_router
from app.routes.pedidos import router as pedidos_router
from app.routes.servicios import router as servicios_router
from app.routes.ventas import router as ventas_router
from app.routes.facturas import router as facturas_router
from app.routes.reportes import router as reportes_router
from app.routes.estadisticas import router as estadisticas_router
from app.routes.pqr import router as pqr_router
from app.routes.chatbot import router as chatbot_router

__all__ = [
    "auth_router",
    "usuarios_router",
    "productos_router",
    "carrito_router",
    "pedidos_router",
    "servicios_router",
    "ventas_router",
    "facturas_router",
    "reportes_router",
    "estadisticas_router",
    "pqr_router",
    "chatbot_router"
]
