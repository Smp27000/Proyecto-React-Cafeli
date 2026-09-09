import uvicorn
from app.config import settings

if __name__ == "__main__":
    print(f"Iniciando {settings.APP_NAME} en http://{settings.HOST}:{settings.PORT}")
    print(f"Documentación Swagger disponible en: http://localhost:{settings.PORT}/docs")
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
