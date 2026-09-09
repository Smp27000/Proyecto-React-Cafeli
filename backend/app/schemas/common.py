from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

T = TypeVar("T")

class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Operación exitosa"
    data: Optional[T] = None

class MessageResponse(BaseModel):
    success: bool = True
    message: str
