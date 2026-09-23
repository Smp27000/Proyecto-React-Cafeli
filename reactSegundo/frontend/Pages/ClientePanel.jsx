import React, { useState, useEffect } from "react";
import { API_BASE } from "../src/config";

export function ClientePanel({ onOpenCart, onProductAdded }) {
  const [activeTab, setActiveTab] = useState("catalogo");
  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [misPedidos, setMisPedidos] = useState([]);
  const [misVentas, setMisVentas] = useState([]);
  const [misFacturas, setMisFacturas] = useState([]);
  const [misPQR, setMisPQR] = useState([]);
  const [user, setUser] = useState(null);
  const [filtroTueste, setFiltroTueste] = useState("Todos");
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");
  const [loading, setLoading] = useState(false);
  const [nuevoPQR, setNuevoPQR] = useState(false);

  const token = localStorage.getItem("token");

  const apiFetch = async (endpoint, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
      if (options.rawResponse) return res;
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.detail || "Error en la petición.");
      return data;
    } catch (err) {
      alert(err.message);
      return null;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const resProd = await fetch(`${API_BASE}/productos?solo_activos=true`);
      const dataProd = await resProd.json();
      if (dataProd.success) setProductos(dataProd.productos || []);

      const resServ = await fetch(`${API_BASE}/servicios?solo_activos=true`);
      const dataServ = await resServ.json();
      if (dataServ.success) setServicios(dataServ.servicios || []);

      if (token) {
        Promise.all([
          apiFetch("/pedidos/mis-pedidos").then(r => r && setMisPedidos(r.pedidos || [])),
          apiFetch("/ventas/mis-ventas").then(r => r && setMisVentas(r.ventas || [])),
          apiFetch("/facturas").then(r => r && setMisFacturas(r.facturas || [])),
          apiFetch("/pqr/mis-pqr").then(r => r && setMisPQR(r.pqr || [])),
        ]);
      }
    } catch (err) {
      console.error("Error cargando cliente:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("usuario");
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchData();
  }, []);

  const handleAddToCart = async (producto) => {
    if (!token) return alert("Por favor inicia sesión para agregar productos a tu carrito.");
    const res = await apiFetch("/carrito", { method: "POST", body: JSON.stringify({ producto_id: producto.id, cantidad: 1 }) });
    if (res) {
      alert(`☕ ¡'${producto.nombre}' se añadió a tu carrito!`);
      if (onProductAdded) onProductAdded();
    }
  };

  const productosFiltrados = productos.filter((p) => {
    const matchesTueste = filtroTueste === "Todos" || p.tipo_tueste === filtroTueste;
    const matchesCat = filtroCategoria === "Todos" || p.categoria === filtroCategoria;
    return matchesTueste && matchesCat;
  });

  const descargarFacturaPdf = async (facturaId) => {
    const res = await apiFetch(`/facturas/${facturaId}/pdf`, { rawResponse: true });
    if (!res || !res.ok) return alert("Error al descargar factura");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Factura_${facturaId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const crearPQR = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd.entries());
    if (body.pedido_asociado_id) body.pedido_asociado_id = parseInt(body.pedido_asociado_id);
    const res = await apiFetch("/pqr", { method: "POST", body: JSON.stringify(body) });
    if (res) {
      alert(`PQR #${res.pqr.id} creada. Estado: ${res.pqr.estado}`);
      setNuevoPQR(false);
      fetchData();
    }
  };

  const tabs = [
    { id: "catalogo", label: "Granos de Café", icon: "🫘", count: productos.length },
    { id: "servicios", label: "Servicios y Catas", icon: "✨", count: servicios.length },
    { id: "pedidos", label: "Mis Pedidos", icon: "📦", count: misPedidos.length },
    { id: "ventas", label: "Mis Compras", icon: "💳", count: misVentas.length },
    { id: "facturas", label: "Mis Facturas", icon: "🧾", count: misFacturas.length },
    { id: "pqr", label: "Mis PQR", icon: "📝", count: misPQR.length },
  ];

  return (
    <div className="container mx-auto p-6 max-w-7xl min-h-screen">
      <div className="relative overflow-hidden bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 rounded-3xl shadow-2xl p-8 text-white mb-8 text-left border border-amber-900/30">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            Café de Finca Seleccionado
          </span>
          <h1 className="text-3xl md:text-5xl font-black font-serif tracking-tight mb-3">
            ¡Hola, {user ? user.nombres : "Amante del Café"}!
          </h1>
          <p className="text-amber-100/90 text-sm md:text-base leading-relaxed mb-6">
            Bienvenido a tu tienda virtual de granos de café de especialidad. Explora el catálogo, consulta tus compras y tus facturas.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setActiveTab("catalogo")} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2">
              <span>🛒</span><span>Explorar Granos</span>
            </button>
            <button onClick={() => setActiveTab("ventas")} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-amber-200 border border-amber-300/30 text-xs font-bold rounded-xl transition-all flex items-center space-x-2">
              <span>💳</span><span>Mis Compras</span>
            </button>
            <button onClick={() => setNuevoPQR(true)} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-amber-200 border border-amber-300/30 text-xs font-bold rounded-xl transition-all flex items-center space-x-2">
              <span>📝</span><span>+ Nueva PQR</span>
            </button>
          </div>
        </div>
        <div className="absolute right-4 -bottom-6 text-9xl opacity-10 pointer-events-none select-none">☕</div>
      </div>

      <div className="flex border-b border-amber-200 mb-8 space-x-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-4 font-bold text-xs flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "border-amber-700 text-amber-900 bg-amber-50/60 rounded-t-xl"
                : "border-transparent text-gray-500 hover:text-amber-800"
            }`}
          >
            <span>{tab.icon}</span><span>{tab.label}</span>
            <span className="ml-1 text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-semibold">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* CATÁLOGO */}
      {activeTab === "catalogo" && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-amber-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-left">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Tipo de Tueste</label>
                <select value={filtroTueste} onChange={(e) => setFiltroTueste(e.target.value)} className="text-xs p-2 border border-gray-300 rounded-lg">
                  <option value="Todos">Todos</option>
                  <option value="Claro">Tueste Claro</option>
                  <option value="Medio">Tueste Medio</option>
                  <option value="Oscuro">Tueste Oscuro</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Categoría</label>
                <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="text-xs p-2 border border-gray-300 rounded-lg">
                  <option value="Todos">Todas</option>
                  <option>Café en Grano</option><option>Café Molido</option><option>Accesorios</option>
                </select>
              </div>
            </div>
            <button onClick={onOpenCart} className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl flex items-center space-x-2">
              <span>🛒</span><span>Abrir Carrito</span>
            </button>
          </div>

          {loading ? <div className="py-20 text-center text-amber-900 font-semibold">Cargando...</div> :
            productosFiltrados.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-amber-100">
                <span className="text-5xl">☕</span><p className="text-gray-500 mt-2 font-medium">No hay productos con estos filtros.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productosFiltrados.map((p) => (
                  <div key={p.id} className="bg-white border border-amber-100 rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group">
                    <div>
                      <div className="relative h-48 bg-amber-950/10 overflow-hidden">
                        {p.imagen_url ? <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          : <div className="w-full h-full flex items-center justify-center text-5xl text-amber-800">☕</div>}
                        <span className="absolute top-3 right-3 bg-stone-900/85 text-amber-300 text-xs font-extrabold px-2.5 py-1 rounded-lg">{p.tipo_tueste ? `Tueste ${p.tipo_tueste}` : p.categoria}</span>
                        <span className="absolute bottom-3 left-3 bg-amber-700/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md">📍 {p.origen || "Colombia"}</span>
                      </div>
                      <div className="p-5 text-left space-y-2">
                        <h3 className="font-bold text-lg text-amber-950">{p.nombre}</h3>
                        <p className="text-xs text-gray-600 line-clamp-2">{p.descripcion}</p>
                        <div className="pt-3 border-t border-amber-50 flex items-center justify-between">
                          <span className="text-xl font-black text-amber-950">${Number(p.precio).toLocaleString()}</span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${p.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{p.stock > 0 ? `${p.stock} en stock` : "Agotado"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50/40 border-t border-amber-100">
                      <button onClick={() => handleAddToCart(p)} disabled={p.stock <= 0}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                        🛒 {p.stock > 0 ? "Añadir al Carrito" : "Sin Stock"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      )}

      {/* SERVICIOS */}
      {activeTab === "servicios" && (
        <div className="space-y-6">
          <div className="text-left bg-white p-6 rounded-3xl border border-amber-100">
            <h2 className="text-2xl font-bold text-amber-950 font-serif">Servicios de Barismo & Catas</h2>
            <p className="text-sm text-gray-600 mt-1">Vive experiencias sensoriales inolvidables con baristas certificados.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {servicios.map((s) => (
              <div key={s.id} className="bg-white border border-amber-100 rounded-3xl shadow-sm hover:shadow-xl transition-all p-6 text-left flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-3xl">✨</span>
                    <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">⏱️ {s.duracion || "1 hora"}</span>
                  </div>
                  <h3 className="font-bold text-xl text-amber-950 font-serif">{s.nombre}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{s.descripcion}</p>
                  <p className="text-2xl font-black text-amber-900 pt-3">${Number(s.precio).toLocaleString()}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-amber-100">
                  <a href="https://wa.me/573000000000" target="_blank" rel="noopener noreferrer"
                    className="block text-center py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl">💬 Reservar por WhatsApp</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MIS PEDIDOS */}
      {activeTab === "pedidos" && (
        <div className="space-y-6">
          <div className="text-left bg-white p-6 rounded-3xl border border-amber-100">
            <h2 className="text-2xl font-bold text-amber-950 font-serif">Historial de Tus Pedidos</h2>
            <p className="text-sm text-gray-600 mt-1">Monitorea el estado en tiempo real.</p>
          </div>
          {misPedidos.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-amber-100 space-y-3">
              <span className="text-6xl">📦</span>
              <h3 className="text-lg font-bold text-amber-950">Aún no has realizado pedidos</h3>
              <button onClick={() => setActiveTab("catalogo")} className="mt-2 px-5 py-2.5 bg-amber-700 text-white font-bold text-xs rounded-xl">Ir al Catálogo</button>
            </div>
          ) : misPedidos.map((ped) => (
            <div key={ped.id} className="bg-white border border-amber-100 rounded-3xl shadow-sm p-6 text-left space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-2 border-b border-amber-100 pb-3">
                <div>
                  <span className="font-extrabold text-amber-950 text-lg font-serif">Pedido #{ped.id}</span>
                  <span className="text-xs text-gray-500 ml-3">{new Date(ped.fecha_creacion).toLocaleString()}</span>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-extrabold ${
                  ped.estado === "Entregado" ? "bg-green-100 text-green-800" :
                    ped.estado === "Preparando" || ped.estado === "Enviado" ? "bg-blue-100 text-blue-800" :
                      ped.estado === "Cancelado" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-900"
                }`}>● {ped.estado}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-amber-50/40 p-3 rounded-2xl">
                <div><strong>Dirección:</strong> {ped.direccion_envio}</div>
                <div><strong>Teléfono:</strong> {ped.telefono_contacto || "N/A"}</div>
                <div><strong>Pago:</strong> {ped.metodo_pago}</div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-amber-950 uppercase">Artículos:</p>
                {ped.detalles?.map((det) => (
                  <div key={det.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <div><span className="font-semibold">{det.producto?.nombre}</span> x {det.cantidad}</div>
                    <span className="font-bold text-amber-950">${Number(det.subtotal).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">{ped.notas ? `Nota: ${ped.notas}` : "Sin instrucciones"}</span>
                <span className="text-xl font-black text-amber-950">Total: ${Number(ped.total).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MIS VENTAS (Compras del cliente) */}
      {activeTab === "ventas" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-amber-100">
            <h2 className="font-bold text-xl text-amber-950 font-serif mb-1">💳 Mis Compras (Historial de Ventas)</h2>
            <p className="text-xs text-gray-500 mb-4">Todas tus transacciones completadas en CafeLi</p>
            <div className="overflow-x-auto rounded-2xl border border-amber-100">
              <table className="min-w-full text-xs">
                <thead className="bg-amber-50 text-amber-950 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3 text-left">N°</th>
                    <th className="p-3 text-left">Fecha</th>
                    <th className="p-3 text-left">Método Pago</th>
                    <th className="p-3 text-right">Total</th>
                    <th className="p-3 text-center">Estado</th>
                    <th className="p-3 text-center">Factura</th>
                    <th className="p-3 text-center">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {misVentas.length ? misVentas.map((v) => (
                    <tr key={v.id} className="hover:bg-amber-50/30">
                      <td className="p-3 font-bold">#{v.id}</td>
                      <td className="p-3">{new Date(v.fecha_venta).toLocaleString()}</td>
                      <td className="p-3">{v.metodo_pago}</td>
                      <td className="p-3 text-right font-bold text-amber-900">${Number(v.total).toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          v.estado === "Pagada" ? "bg-green-100 text-green-800" :
                            v.estado === "Pendiente" ? "bg-yellow-100 text-yellow-800" :
                              v.estado === "Anulada" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-700"
                        }`}>{v.estado}</span>
                      </td>
                      <td className="p-3 text-center">
                        {(() => {
                          const f = misFacturas.find((x) => x.venta_id === v.id);
                          return f ? (
                            <button onClick={() => descargarFacturaPdf(f.id)} className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-1 rounded-lg">⬇ {f.numero_factura}</button>
                          ) : <span className="text-[10px] text-gray-400 italic">Sin factura</span>;
                        })()}
                      </td>
                      <td className="p-3 text-center">
                        <details><summary className="cursor-pointer text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-lg">📦 Ver</summary>
                          <div className="bg-white border border-amber-100 rounded-lg p-3 mt-1 text-left shadow z-10 absolute">
                            {v.detalles?.map((d, i) => (
                              <div key={i} className="flex justify-between py-0.5 text-[11px] border-b last:border-0">
                                <span>{d.descripcion_item} x {d.cantidad}</span>
                                <span className="font-bold">${Number(d.subtotal).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} className="p-8 text-center text-gray-400 italic text-xs">Aún no tienes compras registradas.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MIS FACTURAS */}
      {activeTab === "facturas" && (
        <div className="bg-white p-5 rounded-2xl border border-amber-100">
          <h2 className="font-bold text-xl text-amber-950 font-serif mb-1">🧾 Mis Facturas</h2>
          <p className="text-xs text-gray-500 mb-4">Descarga tus documentos fiscales en PDF</p>
          <div className="overflow-x-auto rounded-2xl border border-amber-100">
            <table className="min-w-full text-xs">
              <thead className="bg-amber-50 text-amber-950 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3 text-left">N° Factura</th>
                  <th className="p-3 text-left">Fecha Emisión</th>
                  <th className="p-3 text-right">Subtotal</th>
                  <th className="p-3 text-right">Impuestos</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-center">Estado</th>
                  <th className="p-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {misFacturas.length ? misFacturas.map((f) => (
                  <tr key={f.id} className="hover:bg-amber-50/30">
                    <td className="p-3 font-extrabold text-amber-900">{f.numero_factura}</td>
                    <td className="p-3">{new Date(f.fecha_emision).toLocaleString()}</td>
                    <td className="p-3 text-right">${Number(f.subtotal).toLocaleString()}</td>
                    <td className="p-3 text-right">${Number(f.impuestos).toLocaleString()}</td>
                    <td className="p-3 text-right font-bold">${Number(f.total).toLocaleString()}</td>
                    <td className="p-3 text-center"><span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-900">{f.estado}</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => descargarFacturaPdf(f.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg px-3 py-1.5 shadow-sm">⬇ Descargar PDF</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="p-8 text-center text-gray-400 italic text-xs">Aún no tienes facturas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MIS PQR */}
      {activeTab === "pqr" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-amber-100 flex flex-wrap items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-xl text-amber-950 font-serif">📝 Mis Peticiones, Quejas, Reclamos y Sugerencias</h2>
              <p className="text-xs text-gray-500 mt-1">Crea y consulta el estado de tus PQR</p>
            </div>
            <button onClick={() => setNuevoPQR(true)} className="bg-amber-700 hover:bg-amber-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm">+ Crear nueva PQR</button>
          </div>
          <div className="space-y-3">
            {misPQR.length ? misPQR.map((r) => (
              <div key={r.id} className={`p-4 rounded-2xl border ${
                r.estado === "Cerrada" ? "bg-gray-50 border-gray-200" :
                  r.estado === "Pendiente" ? "bg-red-50/50 border-red-200" :
                    r.estado === "Respondida" ? "bg-emerald-50/50 border-emerald-200" : "bg-amber-50/50 border-amber-200"
              }`}>
                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold bg-white border px-2 py-0.5 rounded-md mr-2">#{r.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      r.tipo === "Peticion" ? "bg-blue-100 text-blue-800" :
                        r.tipo === "Queja" ? "bg-red-100 text-red-800" :
                          r.tipo === "Reclamo" ? "bg-orange-100 text-orange-900" : "bg-purple-100 text-purple-900"
                    }`}>{r.tipo}</span>
                    <span className={`text-[10px] font-bold ml-2 px-2 py-0.5 rounded-full ${
                      r.prioridad === "Alta" ? "bg-red-600 text-white" :
                        r.prioridad === "Media" ? "bg-yellow-400 text-yellow-900" : "bg-green-500 text-white"
                    }`}>Prioridad: {r.prioridad}</span>
                    <span className="text-[10px] font-bold ml-2 px-2 py-0.5 rounded-full bg-white border">Estado: {r.estado}</span>
                  </div>
                  <span className="text-[10px] text-gray-500">{new Date(r.fecha_creacion).toLocaleString()}</span>
                </div>
                <p className="font-bold text-sm text-stone-800 mb-1">{r.asunto}</p>
                <p className="text-xs text-gray-600 mb-2">{r.descripcion}</p>
                {r.respuesta && (
                  <div className="bg-white border-l-4 border-emerald-500 p-3 rounded-r-lg text-xs">
                    <p className="text-[10px] font-bold text-emerald-800 mb-1">💬 Respuesta del equipo:</p>
                    <p className="text-gray-700">{r.respuesta}</p>
                  </div>
                )}
                {r.usuario_asignado && <p className="mt-2 text-[10px] text-gray-500">🧑‍💼 Asignado a: {r.usuario_asignado.nombres || `#${r.usuario_asignado_id}`}</p>}
              </div>
            )) : (
              <p className="p-8 text-center text-gray-400 italic text-xs bg-white rounded-2xl border border-dashed">Sin PQR registradas.</p>
            )}
          </div>
        </div>
      )}

      {/* MODAL CREAR PQR */}
      {nuevoPQR && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-left">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-amber-950 font-serif">📝 Nueva PQR</h2>
              <button onClick={() => setNuevoPQR(false)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={crearPQR} className="space-y-3 text-xs font-semibold">
              <div><label className="block mb-1">Tipo *</label>
                <select name="tipo" required defaultValue="Peticion" className="w-full text-sm p-2.5 border rounded-xl">
                  <option>Peticion</option><option>Queja</option><option>Reclamo</option><option>Sugerencia</option>
                </select>
              </div>
              <div><label className="block mb-1">Prioridad *</label>
                <select name="prioridad" required defaultValue="Media" className="w-full text-sm p-2.5 border rounded-xl">
                  <option>Baja</option><option>Media</option><option>Alta</option>
                </select>
              </div>
              <div><label className="block mb-1">Asunto *</label>
                <input name="asunto" required placeholder="Ej: Cafe llegó dañado" className="w-full text-sm p-2.5 border rounded-xl" />
              </div>
              <div><label className="block mb-1">Descripción *</label>
                <textarea name="descripcion" rows="4" required placeholder="Explica detalladamente tu petición..." className="w-full text-sm p-2.5 border rounded-xl" />
              </div>
              <div><label className="block mb-1">Pedido asociado (Opcional)</label>
                <select name="pedido_asociado_id" className="w-full text-sm p-2.5 border rounded-xl">
                  <option value="">-- Ninguno --</option>
                  {misPedidos.map(p => <option key={p.id} value={p.id}>Pedido #{p.id} — ${Number(p.total).toLocaleString()}</option>)}
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button type="button" onClick={() => setNuevoPQR(false)} className="bg-gray-100 px-4 py-2 rounded-xl text-xs font-bold">Cancelar</button>
                <button className="bg-amber-700 hover:bg-amber-800 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm">Enviar PQR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

