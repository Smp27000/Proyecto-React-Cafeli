from app.routes.auth import router as auth_router
from app.routes.usuarios import router as usuarios_router
from app.routes.productos import router as productos_router
from app.routes.carrito import router as carrito_router
from app.routes.pedidos import router as pedidos_router
from app.routes.servicios import router as servicios_router

__all__ = [
    "auth_router",
    "usuarios_router",
    "productos_router",
    "carrito_router",
    "pedidos_router",
    "servicios_router"
]
