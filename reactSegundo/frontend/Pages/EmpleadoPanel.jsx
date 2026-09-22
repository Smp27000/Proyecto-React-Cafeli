import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:3000/api/v1";

function BarChart({ data = [], height = 200, color = "#6F4E37" }) {
  if (!data.length) {
    return (
      <div className="h-[200px] flex items-center justify-center text-xs text-stone-400 italic bg-amber-50/50 rounded-2xl border border-dashed border-amber-200">
        Sin datos para mostrar.
      </div>
    );
  }
  const max = Math.max(...data.map((d) => Number(d.valor || 0)), 1);
  const barW = Math.max(20, 600 / data.length - 10);
  return (
    <svg viewBox={`0 0 ${(barW + 10) * data.length + 20} ${height + 40}`} className="w-full h-auto">
      {data.map((d, i) => {
        const h = (Number(d.valor || 0) / max) * height;
        const x = 10 + i * (barW + 10);
        const y = height - h + 10;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} fill={color} rx={6} opacity={0.9} />
            <text x={x + barW / 2} y={height + 28} fontSize="9" textAnchor="middle" fill="#78716c" fontWeight="500">{d.etiqueta}</text>
            <text x={x + barW / 2} y={y - 4} fontSize="8" textAnchor="middle" fill="#44403c" fontWeight="bold">
              {Number(d.valor || 0) > 1000 ? `$${(Number(d.valor || 0) / 1000).toFixed(1)}k` : Number(d.valor || 0)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
function KPICard({ titulo, valor, icono, color }) {
  return (
    <div className="relative bg-white rounded-3xl border border-amber-100 p-6 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group">
      <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-sm shadow-lg shadow-amber-900/20 shrink-0">
        <span className="drop-shadow-sm">{icono || "📊"}</span>
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-[11px] uppercase font-bold tracking-wider text-stone-500">{titulo}</p>
        <p className="text-3xl font-black text-stone-800 mt-1.5 truncate tracking-tight">{valor}</p>
      </div>
    </div>
  );
}

export function EmpleadoPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const token = localStorage.getItem("token");

  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [pqrList, setPqrList] = useState([]);
  const [kpis, setKpis] = useState({ kpis: [] });
  const [graficos, setGraficos] = useState({ ventas_por_dia: [], productos_mas_vendidos: [], ventas_por_metodo_pago: [], resumen: {} });

  const [filtrosVentas, setFiltrosVentas] = useState({ fecha_inicio: "", fecha_fin: "", estado: "" });
  const [filtrosPQR, setFiltrosPQR] = useState({ estado: "", tipo: "" });
  const [reporteFecha, setReporteFecha] = useState(new Date().toISOString().slice(0, 10));
  const [resumenReporte, setResumenReporte] = useState(null);

  const [productModal, setProductModal] = useState({ open: false, mode: "create", data: null });
  const [serviceModal, setServiceModal] = useState({ open: false, mode: "create", data: null });
  const [pqrModal, setPqrModal] = useState(null);

  const apiFetch = async (endpoint, options = {}) => {
    const headers = { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }), ...options.headers };
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
      if (options.rawResponse) return res;
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.detail || "Error en la petición.");
      return data;
    } catch (err) { alert(err.message); return null; }
  };

  const fetchAll = async () => {
    const promesas = [
      apiFetch("/productos?solo_activos=false").then(r => r && setProductos(r.productos || [])),
      apiFetch("/servicios?solo_activos=false").then(r => r && setServicios(r.servicios || [])),
      apiFetch("/pedidos").then(r => r && setPedidos(r.pedidos || [])),
      apiFetch("/ventas").then(r => r && setVentas(r.ventas || [])),
      apiFetch("/facturas").then(r => r && setFacturas(r.facturas || [])),
      apiFetch("/pqr").then(r => r && setPqrList(r.pqr || [])),
      apiFetch("/estadisticas/kpis").then(r => r && setKpis(r)),
      apiFetch("/estadisticas/ventas-graficos?periodo=mes").then(r => r && setGraficos(r)),
    ];
    await Promise.all(promesas);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.precio = parseFloat(data.precio); data.stock = parseInt(data.stock);
    const url = productModal.mode === "create" ? "/productos" : `/productos/${productModal.data.id}`;
    const method = productModal.mode === "create" ? "POST" : "PUT";
    const res = await apiFetch(url, { method, body: JSON.stringify(data) });
    if (res) { alert("Producto guardado."); setProductModal({ open: false, mode: "create", data: null }); fetchAll(); }
  };
  const handleDeleteProduct = async (id, nombre) => {
    if (confirm(`¿Eliminar producto '${nombre}'?`)) {
      const res = await apiFetch(`/productos/${id}`, { method: "DELETE" });
      if (res) { alert("Eliminado."); fetchAll(); }
    }
  };
  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.precio = parseFloat(data.precio);
    const url = serviceModal.mode === "create" ? "/servicios" : `/servicios/${serviceModal.data.id}`;
    const method = serviceModal.mode === "create" ? "POST" : "PUT";
    const res = await apiFetch(url, { method, body: JSON.stringify(data) });
    if (res) { alert("Servicio guardado."); setServiceModal({ open: false, mode: "create", data: null }); fetchAll(); }
  };
  const handleDeleteService = async (id, nombre) => {
    if (confirm(`¿Eliminar servicio '${nombre}'?`)) {
      const res = await apiFetch(`/servicios/${id}`, { method: "DELETE" });
      if (res) { alert("Eliminado."); fetchAll(); }
    }
  };
  const handleOrderStatusChange = async (pedidoId, nuevoEstado) => {
    const res = await apiFetch(`/pedidos/${pedidoId}/estado`, { method: "PATCH", body: JSON.stringify({ estado: nuevoEstado }) });
    if (res) { alert(`Pedido #${pedidoId}: ${nuevoEstado}`); fetchAll(); }
  };
  const handleCrearVentaDesdePedido = async (pedido) => {
    if (!pedido.detalles?.length) return alert("Pedido sin artículos");
    const items = pedido.detalles.map((d) => ({
      producto_id: d.producto_id, servicio_id: null,
      descripcion_item: d.producto?.nombre || `Producto #${d.producto_id}`,
      cantidad: d.cantidad, precio_unitario: Number(d.precio_unitario),
      descuento_unitario: 0, tipo_item: "Producto",
    }));
    const body = { cliente_id: pedido.usuario_id, pedido_id: pedido.id, metodo_pago: pedido.metodo_pago, descuento: 0, notas: `Desde pedido #${pedido.id}`, items };
    const res = await apiFetch("/ventas", { method: "POST", body: JSON.stringify(body) });
    if (res) { alert(`Venta #${res.venta.id} creada. Total: $${Number(res.venta.total).toLocaleString()}`); fetchAll(); }
  };
  const handleCambiarEstadoVenta = async (id, nuevoEstado) => {
    const res = await apiFetch(`/ventas/${id}/estado`, { method: "PATCH", body: JSON.stringify({ estado: nuevoEstado }) });
    if (res) fetchAll();
  };
  const handleGenerarFactura = async (ventaId) => {
    const res = await apiFetch("/facturas", { method: "POST", body: JSON.stringify({ venta_id: ventaId }) });
    if (res) { alert(`Factura ${res.factura.numero_factura} generada`); fetchAll(); }
  };
  const handleCambiarEstadoFactura = async (id, estado) => {
    await apiFetch(`/facturas/${id}/estado`, { method: "PATCH", body: JSON.stringify({ estado }) });
    fetchAll();
  };
  const descargarFacturaPdf = async (facturaId) => {
    const res = await apiFetch(`/facturas/${facturaId}/pdf`, { rawResponse: true });
    if (!res || !res.ok) return alert("Error al descargar");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `Factura_${facturaId}.pdf`; a.click();
    URL.revokeObjectURL(url);
  };
  const handleGestionarPQR = async (pqr, body) => {
    const res = await apiFetch(`/pqr/${pqr.id}/gestionar`, { method: "PATCH", body: JSON.stringify(body) });
    if (res) { setPqrModal(null); fetchAll(); }
  };
  const verResumenReporte = async () => {
    const r = await apiFetch(`/reportes/ventas-diario/resumen?fecha=${reporteFecha}`);
    if (r) setResumenReporte(r);
  };
  useEffect(() => { if (activeTab === "reportes") verResumenReporte(); /* eslint-disable-next-line */ }, [activeTab, reporteFecha]);

  const descargarReporte = async (formato) => {
    const res = await apiFetch(`/reportes/ventas-diario/${formato}?fecha=${reporteFecha}`, { rawResponse: true });
    if (!res || !res.ok) return alert("Error al generar reporte");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Reporte_Ventas_${reporteFecha}.${formato === "excel" ? "xlsx" : "pdf"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const aplicarFiltrosVentas = async () => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(filtrosVentas)) if (v) params.append(k, v);
    const res = await apiFetch(`/ventas?${params.toString()}`);
    if (res) setVentas(res.ventas || []);
  };
  const aplicarFiltrosPQR = async () => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(filtrosPQR)) if (v) params.append(k, v);
    const res = await apiFetch(`/pqr?${params.toString()}`);
    if (res) setPqrList(res.pqr || []);
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊", count: "-" },
    { id: "ventas", label: "Ventas", icon: "💰", count: ventas.length },
    { id: "facturas", label: "Facturas", icon: "🧾", count: facturas.length },
    { id: "pedidos", label: "Pedidos", icon: "📦", count: pedidos.length },
    { id: "productos", label: "Productos", icon: "☕", count: productos.length },
    { id: "servicios", label: "Servicios", icon: "✨", count: servicios.length },
    { id: "pqr", label: "PQR", icon: "📝", count: pqrList.length },
    { id: "reportes", label: "Reportes", icon: "📈", count: "-" },
  ];

  return (
    <div className="w-full p-6 md:p-8 max-w-7xl mx-auto min-h-screen text-left bg-stone-50/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-7 rounded-3xl shadow-xl mb-8 border border-amber-900/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.08),transparent_50%)] pointer-events-none" />
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full mb-2 border border-amber-400/20">Operaciones y Atención</span>
          <h1 className="text-3xl font-extrabold font-serif tracking-tight">Panel de Empleado CafeLi</h1>
          <p className="text-amber-100/70 text-xs mt-1.5">Ventas, Facturación, Inventario, PQR y Reportes.</p>
        </div>
        <button onClick={fetchAll} className="px-4 py-2.5 bg-gradient-to-r from-[#6F4E37] to-[#4D3220] hover:from-[#5c4030] hover:to-[#3d271a] text-white rounded-xl text-xs font-bold transition-all duration-200 shadow-lg shadow-amber-900/30 hover:shadow-xl relative z-10">🔄 Actualizar Datos</button>
      </div>

      <div className="mb-8 p-1.5 bg-stone-100 rounded-2xl flex flex-wrap gap-1.5 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`relative py-2.5 px-4 font-bold text-[11px] flex items-center space-x-2 rounded-xl whitespace-nowrap transition-all duration-300 ${activeTab === tab.id ? "bg-gradient-to-r from-[#6F4E37] to-[#4D3220] text-white shadow-lg shadow-amber-900/25 scale-[1.02]" : "text-stone-500 hover:text-stone-800 hover:bg-white/60"}`}>
            <span>{tab.icon}</span><span>{tab.label}</span>
            {typeof tab.count === "number" && <span className={`ml-0.5 text-[10px] px-2 py-0.5 rounded-full font-semibold ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-stone-200/80 text-stone-700"}`}>{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { titulo: "Facturación Total", valor: kpis.total_facturacion ? `$${Number(kpis.total_facturacion).toLocaleString()}` : "$0", icono: "💵", color: "#ef4444" },
              { titulo: "Ventas Pagadas", valor: kpis.total_ventas ?? ventas.length, icono: "💸", color: "#8b5cf6" },
              { titulo: "Total Pedidos", valor: kpis.total_pedidos ?? pedidos.length, icono: "📦", color: "#14b8a6" },
              { titulo: "PQR Pendientes", valor: kpis.pqr_pendientes ?? pqrList.filter(r => r.estado === "Pendiente").length, icono: "⏳", color: "#f97316" },
            ].map((k, i) => <KPICard key={i} {...k} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-white to-amber-50/40 p-6 rounded-3xl border border-amber-100 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-stone-800 mb-3 text-sm font-serif text-base">Ventas por Día (Barras)</h3>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Barras</span>
              </div>
              <BarChart data={graficos.ventas_por_dia} color="#6F4E37" />
            </div>
            <div className="bg-gradient-to-br from-white to-orange-50/40 p-6 rounded-3xl border border-orange-100 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-stone-800 mb-3 text-sm font-serif text-base">Productos más Vendidos</h3>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200">Top 8</span>
              </div>
              <BarChart data={graficos.productos_mas_vendidos?.slice(0, 8)} height={180} color="#f59e0b" />
            </div>
            <div className="lg:col-span-2 bg-gradient-to-br from-white to-emerald-50/30 p-6 rounded-3xl border border-emerald-100 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-stone-800 mb-3 text-sm font-serif text-base">💳 Ventas por Método de Pago</h3>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Distribución</span>
              </div>
              <div className="space-y-3 pt-2">
                {graficos.ventas_por_metodo_pago?.length ? graficos.ventas_por_metodo_pago.map((m, i) => {
                  const total = graficos.ventas_por_metodo_pago.reduce((s, x) => s + Number(x.valor || 0), 0) || 1;
                  const pct = (Number(m.valor || 0) / total) * 100;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1.5"><span className="font-semibold text-stone-700">{m.etiqueta}</span><span className="font-bold text-amber-900">${Number(m.valor || 0).toLocaleString()}</span></div>
                      <div className="h-3 bg-amber-50 rounded-full overflow-hidden border border-amber-100">
                        <div className="h-full bg-gradient-to-r from-amber-700 to-amber-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                }) : <p className="text-xs text-stone-400 italic">Sin datos.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VENTAS */}
      {activeTab === "ventas" && (
        <div className="space-y-5">
          <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white text-xl shadow-lg shadow-amber-900/20">💰</span>
              <div>
                <h2 className="font-bold text-xl text-stone-900 font-serif">Gestión de Ventas</h2>
                <p className="text-xs text-stone-500 mt-0.5">Registro y control de ventas</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
              <div><label className="block text-[11px] font-bold text-stone-600 mb-1.5">Fecha Inicio</label>
                <input type="date" value={filtrosVentas.fecha_inicio} onChange={(e) => setFiltrosVentas({ ...filtrosVentas, fecha_inicio: e.target.value })} className="w-full text-xs p-3 border border-stone-200 rounded-2xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" /></div>
              <div><label className="block text-[11px] font-bold text-stone-600 mb-1.5">Fecha Fin</label>
                <input type="date" value={filtrosVentas.fecha_fin} onChange={(e) => setFiltrosVentas({ ...filtrosVentas, fecha_fin: e.target.value })} className="w-full text-xs p-3 border border-stone-200 rounded-2xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" /></div>
              <div><label className="block text-[11px] font-bold text-stone-600 mb-1.5">Estado</label>
                <select value={filtrosVentas.estado} onChange={(e) => setFiltrosVentas({ ...filtrosVentas, estado: e.target.value })} className="w-full text-xs p-3 border border-stone-200 rounded-2xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all">
                  <option value="">Todos</option><option value="Pagada">Pagada</option><option value="Pendiente">Pendiente</option><option value="Anulada">Anulada</option><option value="Devuelta">Devuelta</option>
                </select></div>
              <div className="lg:col-span-2 flex space-x-2 pt-1">
                <button onClick={aplicarFiltrosVentas} className="flex-1 bg-gradient-to-r from-[#6F4E37] to-[#4D3220] hover:from-[#5c4030] hover:to-[#3d271a] text-white text-xs font-bold rounded-2xl px-3 py-3 shadow-md transition-all duration-200 shadow-amber-900/20">🔎 Filtrar</button>
                <button onClick={() => { setFiltrosVentas({ fecha_inicio: "", fecha_fin: "", estado: "" }); fetchAll(); }} className="flex-1 border border-stone-300 text-stone-600 hover:bg-stone-50 hover:border-stone-400 text-xs font-bold rounded-2xl px-3 py-3 transition-all duration-200">↻ Limpiar</button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-3xl border border-stone-100 bg-white">
              <table className="min-w-full text-xs">
                <thead className="bg-stone-900/5">
                  <tr><th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider text-stone-700 rounded-tl-2xl">N°</th><th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider text-stone-700">Fecha</th><th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider text-stone-700">Cliente</th><th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider text-stone-700">Método</th>
                    <th className="p-4 text-right font-bold uppercase text-[10px] tracking-wider text-stone-700">Total</th><th className="p-4 text-center font-bold uppercase text-[10px] tracking-wider text-stone-700">Estado</th><th className="p-4 text-center font-bold uppercase text-[10px] tracking-wider text-stone-700 rounded-tr-2xl">Factura</th></tr>
                </thead>
                <tbody>
                  {ventas.length ? ventas.map((v, idx) => (
                    <tr key={v.id} className={`transition-all duration-150 hover:bg-amber-100/40 ${idx % 2 === 1 ? "bg-amber-50/50" : ""}`}>
                      <td className="p-4 font-bold text-stone-900">#{v.id}</td>
                      <td className="p-4">{new Date(v.fecha_venta).toLocaleString()}</td>
                      <td className="p-4">{v.cliente ? `${v.cliente.nombres} ${v.cliente.apellidos}` : `#${v.cliente_id}`}</td>
                      <td className="p-4"><span className="inline-block px-2 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-medium">{v.metodo_pago}</span></td>
                      <td className="p-4 text-right font-black text-amber-900">${Number(v.total).toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <select value={v.estado} onChange={(e) => handleCambiarEstadoVenta(v.id, e.target.value)}
                          className={`text-[10px] font-bold p-2 rounded-xl border ${v.estado === "Pagada" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : v.estado === "Pendiente" ? "bg-yellow-50 text-yellow-800 border-yellow-200" : "bg-red-50 text-red-800 border-red-200"}`}>
                          <option>Pendiente</option><option>Pagada</option><option>Anulada</option><option>Devuelta</option>
                        </select>
                      </td>
                      <td className="p-4 text-center">
                        {facturas.find((f) => f.venta_id === v.id) ? (
                          <button onClick={() => descargarFacturaPdf(facturas.find(f => f.venta_id === v.id).id)} className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl shadow-sm transition-all hover:-translate-y-0.5">⬇ Descargar</button>
                        ) : (
                          <button onClick={() => handleGenerarFactura(v.id)} className="text-[10px] bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold px-3 py-2 rounded-full border border-sky-200 transition-all">+ Generar</button>
                        )}
                      </td>
                    </tr>
                  )) : <tr><td colSpan={7} className="p-10 text-center text-stone-400 italic text-xs">Sin ventas registradas.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FACTURAS */}
      {activeTab === "facturas" && (
        <div className="space-y-5">
          <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-5">
              <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-900/20">🧾</span>
              <div>
                <h2 className="font-bold text-xl text-stone-900 font-serif">Gestión de Facturas</h2>
                <p className="text-xs text-stone-500 mt-0.5">Consulta y descarga de facturas de venta</p>
              </div>
            </div>
            <div className="overflow-x-auto rounded-3xl border border-stone-100 bg-white">
              <table className="min-w-full text-xs">
                <thead className="bg-stone-900/5">
                  <tr><th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider text-stone-700 rounded-tl-2xl">N° Factura</th><th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider text-stone-700">Fecha</th><th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider text-stone-700">Cliente</th>
                    <th className="p-4 text-right font-bold uppercase text-[10px] tracking-wider text-stone-700">Subtotal</th><th className="p-4 text-right font-bold uppercase text-[10px] tracking-wider text-stone-700">Impuestos</th><th className="p-4 text-right font-bold uppercase text-[10px] tracking-wider text-stone-700">Total</th>
                    <th className="p-4 text-center font-bold uppercase text-[10px] tracking-wider text-stone-700">Estado</th><th className="p-4 text-center font-bold uppercase text-[10px] tracking-wider text-stone-700 rounded-tr-2xl">Acción</th></tr>
                </thead>
                <tbody>
                  {facturas.length ? facturas.map((f, idx) => (
                    <tr key={f.id} className={`transition-all duration-150 hover:bg-amber-100/40 ${idx % 2 === 1 ? "bg-amber-50/50" : ""}`}>
                      <td className="p-4 font-extrabold text-amber-900 text-sm">{f.numero_factura}</td>
                      <td className="p-4">{new Date(f.fecha_emision).toLocaleString()}</td>
                      <td className="p-4">{f.cliente ? `${f.cliente.nombres} ${f.cliente.apellidos}` : `#${f.cliente_id}`}</td>
                      <td className="p-4 text-right text-stone-600">${Number(f.subtotal).toLocaleString()}</td>
                      <td className="p-4 text-right text-stone-600">${Number(f.impuestos).toLocaleString()}</td>
                      <td className="p-4 text-right font-bold text-stone-900">${Number(f.total).toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <select value={f.estado} onChange={(e) => handleCambiarEstadoFactura(f.id, e.target.value)} className="text-[10px] font-bold p-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-900">
                          <option>Emitida</option><option>Pagada</option><option>Anulada</option><option>Vencida</option>
                        </select>
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => descargarFacturaPdf(f.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-xl px-4 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">⬇ Descargar PDF</button>
                      </td>
                    </tr>
                  )) : <tr><td colSpan={8} className="p-10 text-center text-stone-400 italic text-xs">Aún no hay facturas.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PEDIDOS */}
      {activeTab === "pedidos" && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-sm flex items-center space-x-3">
            <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center text-white text-xl shadow-lg shadow-sky-900/20">📦</span>
            <div>
              <h2 className="text-xl font-bold text-stone-900 font-serif">Despacho y Control de Pedidos</h2>
              <p className="text-xs text-stone-500 mt-0.5">Puedes convertir cada pedido en una venta y facturarla.</p>
            </div>
          </div>
          {pedidos.length ? pedidos.map((ped) => (
            <div key={ped.id} className="bg-white border border-amber-100 rounded-3xl shadow-sm hover:shadow-md p-6 space-y-5 transition-all duration-200">
              <div className="flex flex-wrap justify-between items-center gap-3 border-b border-amber-100/80 pb-4">
                <div><span className="font-extrabold text-stone-950 font-serif text-lg">Pedido #{ped.id}</span>
                  <span className="text-xs text-stone-500 ml-3">{new Date(ped.fecha_creacion).toLocaleString()}</span></div>
                <div className="flex items-center space-x-2 gap-2 flex-wrap">
                  <select value={ped.estado} onChange={(e) => handleOrderStatusChange(ped.id, e.target.value)}
                    className="text-xs font-bold p-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all">
                    <option>Pendiente</option><option>Pagado</option><option>Preparando</option><option>Enviado</option><option>Entregado</option><option>Cancelado</option>
                  </select>
                  {!ventas.find((v) => v.pedido_id === ped.id) && ped.estado !== "Cancelado" && (
                    <button onClick={() => handleCrearVentaDesdePedido(ped)} className="text-xs bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white font-bold px-4 py-2 rounded-xl shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">💰 Convertir en Venta</button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-amber-50/60 p-4 rounded-2xl border border-amber-100/60">
                <div><strong className="text-stone-700">Cliente:</strong> {ped.usuario?.nombres} {ped.usuario?.apellidos}</div>
                <div><strong className="text-stone-700">Dirección:</strong> {ped.direccion_envio}</div>
                <div><strong className="text-stone-700">Teléfono:</strong> {ped.telefono_contacto || "N/A"}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {ped.detalles?.map((det) => (
                  <div key={det.id} className="text-xs bg-stone-50 p-3 rounded-2xl border border-stone-100 flex justify-between items-center hover:bg-stone-100/60 transition-colors">
                    <span className="text-stone-700">{det.producto?.nombre} x {det.cantidad}</span>
                    <span className="font-bold text-stone-900">${Number(det.subtotal).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-stone-100 text-sm">
                <span className="text-xs text-stone-500">Método pago: <strong className="text-stone-700">{ped.metodo_pago}</strong></span>
                <span className="font-extrabold text-amber-950 text-lg">Total: ${Number(ped.total).toLocaleString()}</span>
              </div>
            </div>
          )) : <p className="p-8 text-center text-stone-400 italic text-xs bg-white rounded-3xl border border-dashed border-stone-200">Sin pedidos.</p>}
        </div>
      )}

      {/* PRODUCTOS */}
      {activeTab === "productos" && (
        <div className="space-y-5">
          <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-amber-100 shadow-sm">
            <div className="flex items-center space-x-3">
              <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white text-xl shadow-lg shadow-amber-900/20">☕</span>
              <div>
                <h2 className="text-xl font-bold text-stone-900 font-serif">Catálogo de Granos</h2>
                <p className="text-xs text-stone-500 mt-0.5">Administra productos y accesorios</p>
              </div>
            </div>
            <button onClick={() => setProductModal({ open: true, mode: "create", data: null })}
              className="bg-gradient-to-r from-[#6F4E37] to-[#4D3220] hover:from-[#5c4030] hover:to-[#3d271a] text-white font-bold py-3 px-5 rounded-xl text-xs shadow-lg shadow-amber-900/25 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5">➕ Nuevo Producto</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {productos.map((p) => (
              <div key={p.id} className="bg-white border border-amber-100 rounded-3xl shadow-md overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group">
                <div>
                  <div className="relative h-48 bg-gradient-to-br from-amber-900/10 via-amber-50/50 to-stone-100 overflow-hidden">
                    {p.imagen_url ? <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center text-5xl text-amber-800/80">☕</div>}
                    <span className="absolute top-3 right-3 backdrop-blur-md bg-stone-900/75 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-white/10">{p.tipo_tueste ? `Tueste ${p.tipo_tueste}` : p.categoria}</span>
                    {p.stock > 0 && p.stock <= 5 && (
                      <span className="absolute top-3 left-3 bg-red-500/90 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-red-400/30">🔥 Últimas</span>
                    )}
                    {p.stock === 0 && (
                      <span className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-stone-900 text-white font-black px-6 py-2 rounded-2xl text-sm shadow-xl border border-white/10">AGOTADO</span>
                      </span>
                    )}
                    <span className="absolute bottom-3 left-3 bg-gradient-to-r from-amber-700 to-amber-800 text-white text-[11px] font-bold px-3 py-1 rounded-xl shadow-md">📍 {p.origen || "Colombia"}</span>
                  </div>
                  <div className="p-5 space-y-2.5 text-left">
                    <h3 className="font-bold text-lg text-stone-900">{p.nombre}</h3>
                    <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">{p.descripcion}</p>
                    <div className="pt-3 flex justify-between items-center border-t border-amber-50">
                      <span className="font-black text-stone-900 text-xl tracking-tight">${Number(p.precio).toLocaleString()}</span>
                      <span className={`text-[11px] px-3 py-1 rounded-full font-bold ${p.stock > 0 ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-red-50 text-red-800 border border-red-100"}`}>Stock: {p.stock}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-b from-amber-50/60 to-stone-50 border-t border-amber-100 flex space-x-2">
                  <button onClick={() => setProductModal({ open: true, mode: "edit", data: p })} className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold py-2.5 rounded-xl text-xs transition-all border border-amber-200 hover:-translate-y-0.5">Editar</button>
                  <button onClick={() => handleDeleteProduct(p.id, p.nombre)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2.5 rounded-xl text-xs border border-red-200 transition-all hover:-translate-y-0.5">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SERVICIOS */}
      {activeTab === "servicios" && (
        <div className="space-y-5">
          <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-amber-100 shadow-sm">
            <div className="flex items-center space-x-3">
              <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white text-xl shadow-lg shadow-orange-900/20">✨</span>
              <div>
                <h2 className="text-xl font-bold text-stone-900 font-serif">Servicios de Barismo</h2>
                <p className="text-xs text-stone-500 mt-0.5">Talleres, catas y mantenimiento</p>
              </div>
            </div>
            <button onClick={() => setServiceModal({ open: true, mode: "create", data: null })}
              className="bg-gradient-to-r from-[#6F4E37] to-[#4D3220] hover:from-[#5c4030] hover:to-[#3d271a] text-white font-bold py-3 px-5 rounded-xl text-xs shadow-lg shadow-amber-900/25 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5">➕ Nuevo Servicio</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {servicios.map((s) => (
              <div key={s.id} className="bg-white border border-amber-100 rounded-3xl shadow-md p-6 flex flex-col justify-between hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group">
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700 flex items-center justify-center text-3xl shadow-lg shadow-orange-900/30">✨</div>
                    <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1.5 rounded-full border border-amber-200">⏱️ {s.duracion || "1h"}</span>
                  </div>
                  <h3 className="font-bold text-xl text-stone-900 font-serif leading-tight">{s.nombre}</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">{s.descripcion}</p>
                  <p className="text-2xl font-black text-amber-900 pt-2 tracking-tight">${Number(s.precio).toLocaleString()}</p>
                </div>
                <div className="flex space-x-2 mt-6 pt-5 border-t border-amber-100/80">
                  <button onClick={() => setServiceModal({ open: true, mode: "edit", data: s })} className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold py-2.5 rounded-xl transition-all border border-amber-200 hover:-translate-y-0.5">Editar</button>
                  <button onClick={() => handleDeleteService(s.id, s.nombre)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold py-2.5 rounded-xl border border-red-200 transition-all hover:-translate-y-0.5">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PQR */}
      {activeTab === "pqr" && (
        <div className="space-y-5">
          <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm">
            <div className="flex flex-wrap justify-between items-end gap-4 mb-5">
              <div className="flex items-center space-x-3">
                <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white text-xl shadow-lg shadow-rose-900/20">📝</span>
                <div>
                  <h2 className="font-bold text-xl text-stone-900 font-serif">Gestión de PQR</h2>
                  <p className="text-xs text-stone-500 mt-0.5">Atiende peticiones, quejas, reclamos y sugerencias</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div><label className="block text-[11px] font-bold text-stone-600 mb-1.5">Tipo</label>
                <select value={filtrosPQR.tipo} onChange={(e) => setFiltrosPQR({ ...filtrosPQR, tipo: e.target.value })} className="w-full text-xs p-3 border border-stone-200 rounded-2xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all">
                  <option value="">Todos</option><option>Peticion</option><option>Queja</option><option>Reclamo</option><option>Sugerencia</option>
                </select></div>
              <div><label className="block text-[11px] font-bold text-stone-600 mb-1.5">Estado</label>
                <select value={filtrosPQR.estado} onChange={(e) => setFiltrosPQR({ ...filtrosPQR, estado: e.target.value })} className="w-full text-xs p-3 border border-stone-200 rounded-2xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all">
                  <option value="">Todos</option><option>Pendiente</option><option>EnProceso</option><option>Respondida</option><option>Cerrada</option>
                </select></div>
              <div className="flex gap-2 pt-1">
                <button onClick={aplicarFiltrosPQR} className="flex-1 bg-gradient-to-r from-[#6F4E37] to-[#4D3220] hover:from-[#5c4030] hover:to-[#3d271a] text-white rounded-2xl text-xs font-bold px-3 py-3 shadow-md transition-all duration-200 shadow-amber-900/20">🔎 Filtrar</button>
                <button onClick={() => { setFiltrosPQR({ estado: "", tipo: "" }); fetchAll(); }} className="flex-1 border border-stone-300 text-stone-600 hover:bg-stone-50 hover:border-stone-400 rounded-2xl text-xs font-bold px-3 py-3 transition-all duration-200">↻ Limpiar</button>
              </div>
            </div>
            <div className="space-y-3.5">
              {pqrList.length ? pqrList.map((r) => (
                <div key={r.id} className={`p-5 rounded-3xl border transition-all hover:shadow-md ${r.estado === "Cerrada" ? "bg-stone-50 border-stone-200" : r.estado === "Pendiente" ? "bg-red-50/60 border-red-200" : r.estado === "Respondida" ? "bg-emerald-50/60 border-emerald-200" : "bg-amber-50/60 border-amber-200"}`}>
                  <div className="flex flex-wrap justify-between items-start gap-2.5 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold bg-white border border-stone-200 px-2.5 py-1 rounded-xl">#{r.id}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${r.tipo === "Peticion" ? "bg-blue-100 text-blue-800 border border-blue-200" : r.tipo === "Queja" ? "bg-red-100 text-red-800 border border-red-200" : r.tipo === "Reclamo" ? "bg-orange-100 text-orange-900 border border-orange-200" : "bg-purple-100 text-purple-900 border border-purple-200"}`}>{r.tipo}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${r.prioridad === "Alta" ? "bg-red-600 text-white shadow-sm shadow-red-500/30" : r.prioridad === "Media" ? "bg-yellow-400 text-yellow-900" : "bg-emerald-500 text-white"}`}>Prioridad: {r.prioridad}</span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white border">Estado: {r.estado}</span>
                    </div>
                    <button onClick={() => setPqrModal(r)} className="bg-gradient-to-r from-stone-800 to-stone-900 hover:from-black hover:to-stone-900 text-white text-[10px] font-bold px-4 py-2 rounded-xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">✍️ Gestionar</button>
                  </div>
                  <p className="font-bold text-sm text-stone-800 mb-1.5">{r.asunto}</p>
                  <p className="text-xs text-stone-600 mb-3 leading-relaxed">{r.descripcion}</p>
                  {r.respuesta && (
                    <div className="bg-white border-l-4 border-emerald-500 p-4 rounded-r-2xl text-xs shadow-sm">
                      <p className="text-[10px] font-bold text-emerald-800 mb-1.5 uppercase tracking-wide">💬 Respuesta:</p><p className="text-stone-700 leading-relaxed">{r.respuesta}</p>
                    </div>
                  )}
                  <div className="mt-3.5 text-[10px] text-stone-500 flex flex-wrap gap-x-5 gap-y-1.5">
                    <span>👤 Cliente: {r.cliente ? `${r.cliente.nombres} ${r.cliente.apellidos}` : `#${r.cliente_id}`}</span>
                    <span>📅 Creado: {new Date(r.fecha_creacion).toLocaleString()}</span>
                    {r.usuario_asignado && <span>🧑‍💼 Asignado: {r.usuario_asignado.nombres || `#${r.usuario_asignado_id}`}</span>}
                  </div>
                </div>
              )) : <p className="p-8 text-center text-stone-400 italic text-xs bg-white rounded-3xl border border-dashed border-stone-200">Sin PQR registradas.</p>}
            </div>
          </div>

          {pqrModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white/95 backdrop-blur-md rounded-3xl max-w-lg w-full shadow-2xl text-left max-h-[90vh] overflow-y-auto border border-white/40">
                <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-6 rounded-t-3xl">
                  <h2 className="text-xl font-bold mb-1 font-serif">Gestionar PQR #{pqrModal.id}</h2>
                  <p className="text-amber-200/70 text-xs">Atiende y resuelve esta solicitud</p>
                </div>
                <div className="p-6">
                  <div className="mb-5 p-4 bg-amber-50/60 rounded-2xl text-xs space-y-1.5 border border-amber-100">
                    <p><strong className="text-stone-700">Tipo:</strong> {pqrModal.tipo} | <strong className="text-stone-700">Prioridad:</strong> {pqrModal.prioridad}</p>
                    <p className="font-bold text-stone-800 text-sm">{pqrModal.asunto}</p>
                    <p className="text-stone-600 leading-relaxed">{pqrModal.descripcion}</p>
                  </div>
                  <GestionarPQRForm
                    key={pqrModal.id}
                    initial={{ estado: pqrModal.estado, respuesta: pqrModal.respuesta || "" }}
                    onSave={(body) => handleGestionarPQR(pqrModal, body)}
                    onCancel={() => setPqrModal(null)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REPORTES */}
      {activeTab === "reportes" && (
        <div className="space-y-6">
          <div className="bg-white p-7 rounded-3xl border border-amber-100 shadow-md">
            <div className="flex items-center space-x-3 mb-6">
              <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-900/20">📊</span>
              <div>
                <h2 className="font-bold text-2xl text-stone-900 font-serif">📊 Reportes de Ventas Diario</h2>
                <p className="text-xs text-stone-500 mt-0.5">Genera reportes diarios en PDF y Excel</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-7">
              <div className="flex-1">
                <label className="block text-xs font-bold text-stone-600 mb-2">Fecha</label>
                <input type="date" value={reporteFecha} onChange={(e) => setReporteFecha(e.target.value)} className="w-full text-sm p-3.5 border border-stone-200 rounded-2xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
              </div>
              <button onClick={verResumenReporte} className="bg-gradient-to-r from-stone-800 to-stone-900 hover:from-black hover:to-stone-800 text-white font-bold rounded-xl px-6 py-3.5 text-xs shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">🔎 Ver Resumen</button>
            </div>
            {resumenReporte && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <KPICard titulo="Total Ventas" valor={resumenReporte.total_ventas} icono="🧾" color="#6F4E37" />
                <KPICard titulo="Clientes Atendidos" valor={resumenReporte.total_clientes} icono="👥" color="#3b82f6" />
                <KPICard titulo="Items Vendidos" valor={resumenReporte.total_items_vendidos} icono="📦" color="#10b981" />
                <KPICard titulo="Facturado Día" valor={`$${Number(resumenReporte.total_facturado || 0).toLocaleString()}`} icono="💰" color="#8b5cf6" />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <button onClick={() => descargarReporte("pdf")} className="group bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:via-rose-700 hover:to-red-800 text-white p-6 rounded-3xl flex items-center justify-between shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01]">
                <div className="text-left"><div className="text-4xl mb-2 drop-shadow">📕</div><p className="font-black text-xl tracking-tight">Exportar PDF</p><p className="text-xs opacity-80 mt-0.5">Documento profesional imprimible</p></div>
                <span className="text-4xl opacity-30 group-hover:translate-x-2 transition-transform">→</span>
              </button>
              <button onClick={() => descargarReporte("excel")} className="group bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:via-teal-700 hover:to-emerald-800 text-white p-6 rounded-3xl flex items-center justify-between shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01]">
                <div className="text-left"><div className="text-4xl mb-2 drop-shadow">📗</div><p className="font-black text-xl tracking-tight">Exportar Excel</p><p className="text-xs opacity-80 mt-0.5">Hoja editable para análisis</p></div>
                <span className="text-4xl opacity-30 group-hover:translate-x-2 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALES */}
      {productModal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto text-left border border-white/40">
            <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-6 rounded-t-3xl flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold font-serif">{productModal.mode === "create" ? "Nuevo Producto" : "Editar Producto"}</h2>
                <p className="text-amber-200/70 text-xs mt-0.5">Información del grano o accesorio</p>
              </div>
              <button onClick={() => setProductModal({ open: false, mode: "create", data: null })} className="text-amber-200/80 hover:text-white text-2xl leading-none">×</button>
            </div>
            <div className="p-6">
              <form onSubmit={handleProductSubmit} className="space-y-3.5 text-xs font-semibold text-stone-700">
                <div><label className="block mb-1.5">Nombre *</label><input name="nombre" defaultValue={productModal.data?.nombre || ""} required className="w-full text-sm p-3 border border-stone-200 rounded-2xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" /></div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div><label className="block mb-1.5">Origen</label><input name="origen" defaultValue={productModal.data?.origen || "Colombia"} className="w-full text-sm p-3 border border-stone-200 rounded-2xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" /></div>
                  <div><label className="block mb-1.5">Tipo Tueste</label><select name="tipo_tueste" defaultValue={productModal.data?.tipo_tueste || "Medio"} className="w-full text-sm p-3 border border-stone-200 rounded-2xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"><option>Claro</option><option>Medio</option><option>Oscuro</option><option>N/A</option></select></div>
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div><label className="block mb-1.5">Categoría</label><select name="categoria" defaultValue={productModal.data?.categoria || "Café en Grano"} className="w-full text-sm p-3 border border-stone-200 rounded-2xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"><option>Café en Grano</option><option>Café Molido</option><option>Accesorios</option></select></div>
                  <div><label className="block mb-1.5">Estado</label><select name="estado" defaultValue={productModal.data?.estado || "Activo"} className="w-full text-sm p-3 border border-stone-200 rounded-2xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"><option>Activo</option><option>Inactivo</option></select></div>
                </div>
                <div><label className="block mb-1.5">Descripción</label><textarea name="descripcion" rows="2" defaultValue={productModal.data?.descripcion || ""} className="w-full text-sm p-3 border border-stone-200 rounded-2xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none" /></div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div><label className="block mb-1.5">Precio *</label><input name="precio" type="number" defaultValue={productModal.data?.precio || ""} required className="w-full text-sm p-3 border border-stone-200 rounded-2xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" /></div>
                  <div><label className="block mb-1.5">Stock *</label><input name="stock" type="number" defaultValue={productModal.data?.stock ?? 25} required className="w-full text-sm p-3 border border-stone-200 rounded-2xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" /></div>
                </div>
                <div><label className="block mb-1.5">Imagen URL</label><input name="imagen_url" defaultValue={productModal.data?.imagen_url || ""} className="w-full text-sm p-3 border border-stone-200 rounded-2xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" /></div>
                <div className="flex justify-end space-x-3 pt-5 border-t border-stone-100">
                  <button type="button" onClick={() => setProductModal({ open: false, mode: "create", data: null })} className="border border-stone-300 text-stone-600 hover:bg-stone-50 hover:border-stone-400 px-5 py-3 rounded-xl text-xs font-bold transition-all">Cancelar</button>
                  <button className="bg-gradient-to-r from-[#6F4E37] to-[#4D3220] hover:from-[#5c4030] hover:to-[#3d271a] text-white px-6 py-3 rounded-xl text-xs font-bold shadow-md transition-all duration-200 hover:shadow-lg">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {serviceModal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl max-w-md w-full shadow-2xl text-left border border-white/40">
            <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-6 rounded-t-3xl flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold font-serif">{serviceModal.mode === "create" ? "Nuevo Servicio" : "Editar Servicio"}</h2>
                <p className="text-amber-200/70 text-xs mt-0.5">Detalles del servicio de barismo</p>
              </div>
              <button onClick={() => setServiceModal({ open: false, mode: "create", data: null })} className="text-amber-200/80 hover:text-white text-2xl leading-none">×</button>
            </div>
            <div className="p-6">
              <form onSubmit={handleServiceSubmit} className="space-y-3.5 text-xs font-semibold text-stone-700">
                <div><label className="block mb-1.5">Nombre *</label><input name="nombre" defaultValue={serviceModal.data?.nombre || ""} required className="w-full text-sm p-3 border border-stone-200 rounded-2xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" /></div>
                <div><label className="block mb-1.5">Descripción</label><textarea name="descripcion" rows="2" defaultValue={serviceModal.data?.descripcion || ""} className="w-full text-sm p-3 border border-stone-200 rounded-2xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none" /></div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div><label className="block mb-1.5">Precio *</label><input name="precio" type="number" defaultValue={serviceModal.data?.precio || ""} required className="w-full text-sm p-3 border border-stone-200 rounded-2xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" /></div>
                  <div><label className="block mb-1.5">Duración</label><input name="duracion" defaultValue={serviceModal.data?.duracion || "1 hora"} className="w-full text-sm p-3 border border-stone-200 rounded-2xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" /></div>
                </div>
                <div className="flex justify-end space-x-3 pt-5 border-t border-stone-100">
                  <button type="button" onClick={() => setServiceModal({ open: false, mode: "create", data: null })} className="border border-stone-300 text-stone-600 hover:bg-stone-50 hover:border-stone-400 px-5 py-3 rounded-xl text-xs font-bold transition-all">Cancelar</button>
                  <button className="bg-gradient-to-r from-[#6F4E37] to-[#4D3220] hover:from-[#5c4030] hover:to-[#3d271a] text-white px-6 py-3 rounded-xl text-xs font-bold shadow-md transition-all duration-200 hover:shadow-lg">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GestionarPQRForm({ initial, onSave, onCancel }) {
  const [estado, setEstado] = useState(initial.estado || "Pendiente");
  const [respuesta, setRespuesta] = useState(initial.respuesta || "");
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ estado, respuesta: respuesta || undefined }); }} className="space-y-3.5 text-xs font-semibold text-stone-700">
      <div><label className="block mb-1.5">Nuevo Estado *</label>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className="w-full text-sm p-3 border border-stone-200 rounded-2xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all">
          <option>Pendiente</option><option>EnProceso</option><option>Respondida</option><option>Cerrada</option>
        </select>
      </div>
      <div><label className="block mb-1.5">Respuesta / Notas:</label>
        <textarea rows="4" value={respuesta} onChange={(e) => setRespuesta(e.target.value)} placeholder="Escribe la respuesta al cliente..." className="w-full text-sm p-3 border border-stone-200 rounded-2xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none" />
      </div>
      <div className="flex justify-end space-x-3 pt-4 border-t border-stone-100">
        <button type="button" onClick={onCancel} className="border border-stone-300 text-stone-600 hover:bg-stone-50 hover:border-stone-400 px-5 py-2.5 rounded-xl text-xs font-bold transition-all">Cancelar</button>
        <button className="bg-gradient-to-r from-[#6F4E37] to-[#4D3220] hover:from-[#5c4030] hover:to-[#3d271a] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all duration-200 hover:shadow-lg">Guardar</button>
      </div>
    </form>
  );
}
