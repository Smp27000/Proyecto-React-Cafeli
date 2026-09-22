from typing import List, Optional, Dict, Any
from decimal import Decimal
from datetime import date
from pydantic import BaseModel, Field


class KPIItem(BaseModel):
    titulo: str
    valor: Any
    descripcion: Optional[str] = None
    color: Optional[str] = None
    icono: Optional[str] = None


class KPIDashboardResponse(BaseModel):
    success: bool = True
    total_usuarios: int = 0
    total_clientes: int = 0
    total_productos: int = 0
    total_servicios: int = 0
    total_ventas: int = 0
    total_facturacion: Decimal = Decimal("0.00")
    total_pqr: int = 0
    pqr_pendientes: int = 0
    pqr_en_proceso: int = 0
    total_pedidos: int = 0
    pedidos_pendientes: int = 0
    kpis: List[KPIItem] = []


class PuntoDatoGrafico(BaseModel):
    etiqueta: str
    valor: Decimal
    extra: Optional[Dict[str, Any]] = None


class GraficoVentasResponse(BaseModel):
    success: bool = True
    ventas_por_dia: List[PuntoDatoGrafico] = []
    ventas_por_semana: List[PuntoDatoGrafico] = []
    ventas_por_mes: List[PuntoDatoGrafico] = []
    productos_mas_vendidos: List[PuntoDatoGrafico] = []
    ventas_por_metodo_pago: List[PuntoDatoGrafico] = []
    resumen: Dict[str, Any] = {}
