from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from typing import Generator
import logging
from app.config import settings

logger = logging.getLogger(__name__)

# Configuración del motor de base de datos
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False
)

# Fábrica de sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase base para modelos ORM
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    Dependencia de FastAPI para inyectar una sesión de base de datos por petición.
    Asegura el cierre automático de la conexión al finalizar.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        logger.error(f"Error en sesión de base de datos: {e}")
        raise
    finally:
        db.close()
