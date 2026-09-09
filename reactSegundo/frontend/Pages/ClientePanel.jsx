import React, { useState, useEffect } from "react";

export function ClientePanel({ onOpenCart, onProductAdded }) {
  const [activeTab, setActiveTab] = useState("catalogo");
  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [misPedidos, setMisPedidos] = useState([]);
  const [user, setUser] = useState(null);
  const [filtroTueste, setFiltroTueste] = useState("Todos");
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    setLoading(true);
    try {
      const resProd = await fetch("http://localhost:3000/api/v1/productos?solo_activos=true");
      const dataProd = await resProd.json();
      if (dataProd.success) setProductos(dataProd.productos || []);

      const resServ = await fetch("http://localhost:3000/api/v1/servicios?solo_activos=true");
      const dataServ = await resServ.json();
      if (dataServ.success) setServicios(dataServ.servicios || []);

      if (token) {
        const resPed = await fetch("http://localhost:3000/api/v1/pedidos/mis-pedidos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataPed = await resPed.json();
        if (dataPed.success) setMisPedidos(dataPed.pedidos || []);
      }
    } catch (err) {
      console.error("Error cargando catálogo:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("usuario");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    fetchData();
  }, []);

  const handleAddToCart = async (producto) => {
    if (!token) {
      alert("Por favor inicia sesión para agregar productos a tu carrito.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/v1/carrito", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          producto_id: producto.id,
          cantidad: 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.detail || "Error al agregar al carrito");

      alert(`☕ ¡'${producto.nombre}' se añadió a tu carrito!`);
      if (onProductAdded) onProductAdded();
    } catch (err) {
      alert(err.message);
    }
  };

  // Filtrado
  const productosFiltrados = productos.filter((p) => {
    const matchesTueste = filtroTueste === "Todos" || p.tipo_tueste === filtroTueste;
    const matchesCat = filtroCategoria === "Todos" || p.categoria === filtroCategoria;
    return matchesTueste && matchesCat;
  });

  return (
    <div className="container mx-auto p-6 max-w-7xl min-h-screen">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 rounded-3xl shadow-2xl p-8 text-white mb-8 text-left border border-amber-900/30">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            Café de Finca Seleccionado
          </span>
          <h1 className="text-3xl md:text-5xl font-black font-serif tracking-tight mb-3">
            ¡Hola, {user ? user.nombres : "Amante del Café"}!
          </h1>
          <p className="text-amber-100/90 text-sm md:text-base leading-relaxed mb-6">
            Bienvenido a tu tienda virtual de granos de café de especialidad. Descubre cosechas frescas de las cordilleras colombianas y reserva catas exclusivas.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("catalogo")}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              <span>🛒</span>
              <span>Explorar Granos de Café</span>
            </button>
            <button
              onClick={() => setActiveTab("pedidos")}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-amber-200 border border-amber-300/30 text-xs font-bold rounded-xl transition-all flex items-center space-x-2"
            >
              <span>📦</span>
              <span>Mis Pedidos ({misPedidos.length})</span>
            </button>
          </div>
        </div>
        <div className="absolute right-4 -bottom-6 text-9xl opacity-10 pointer-events-none select-none">
          ☕
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-amber-200 mb-8 space-x-3">
        {[
          { id: "catalogo", label: "Granos de Café", icon: "🫘", count: productos.length },
          { id: "servicios", label: "Servicios y Catas", icon: "✨", count: servicios.length },
          { id: "pedidos", label: "Historial de Pedidos", icon: "📦", count: misPedidos.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-5 font-bold text-sm flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? "border-amber-700 text-amber-900 bg-amber-50/60 rounded-t-xl"
                : "border-transparent text-gray-500 hover:text-amber-800"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <span className="ml-2 text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ======================= TAB 1: CATÁLOGO DE CAFÉ ======================= */}
      {activeTab === "catalogo" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-left">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                  Tipo de Tueste
                </label>
                <select
                  value={filtroTueste}
                  onChange={(e) => setFiltroTueste(e.target.value)}
                  className="text-xs p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:outline-none"
                >
                  <option value="Todos">Todos los Tuestes</option>
                  <option value="Claro">Tueste Claro (Frutal)</option>
                  <option value="Medio">Tueste Medio (Balanceado)</option>
                  <option value="Oscuro">Tueste Oscuro (Intenso)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                  Categoría
                </label>
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="text-xs p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:outline-none"
                >
                  <option value="Todos">Todas las Categorías</option>
                  <option value="Café en Grano">Café en Grano</option>
                  <option value="Café Molido">Café Molido</option>
                  <option value="Accesorios">Accesorios y Cafeteras</option>
                </select>
              </div>
            </div>

            <button
              onClick={onOpenCart}
              className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl transition-colors flex items-center space-x-2"
            >
              <span>🛒</span>
              <span>Abrir Carrito</span>
            </button>
          </div>

          {/* Grid de Productos de Café */}
          {loading ? (
            <div className="py-20 text-center text-amber-900 font-semibold">Cargando granos de café...</div>
          ) : productosFiltrados.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-amber-100">
              <span className="text-5xl">☕</span>
              <p className="text-gray-500 mt-2 font-medium">No se encontraron productos con estos filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {productosFiltrados.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-amber-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Container */}
                    <div className="relative h-48 bg-amber-950/10 overflow-hidden">
                      {p.imagen_url ? (
                        <img
                          src={p.imagen_url}
                          alt={p.nombre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl text-amber-800">
                          ☕
                        </div>
                      )}
                      <span className="absolute top-3 right-3 bg-stone-900/85 backdrop-blur-xs text-amber-300 text-xs font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
                        {p.tipo_tueste ? `Tueste ${p.tipo_tueste}` : p.categoria}
                      </span>
                      <span className="absolute bottom-3 left-3 bg-amber-700/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-xs">
                        📍 {p.origen || "Colombia"}
                      </span>
                    </div>

                    {/* Content info */}
                    <div className="p-5 text-left space-y-2">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-amber-700">
                        {p.categoria}
                      </span>
                      <h3 className="font-bold text-lg text-amber-950 group-hover:text-amber-800 transition-colors leading-snug">
                        {p.nombre}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {p.descripcion}
                      </p>

                      <div className="pt-3 border-t border-amber-50 flex items-center justify-between">
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-gray-400">Precio</span>
                          <span className="text-xl font-black text-amber-950">
                            ${Number(p.precio).toLocaleString()} COP
                          </span>
                        </div>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                          p.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {p.stock > 0 ? `${p.stock} en stock` : "Agotado"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <div className="p-4 bg-amber-50/40 border-t border-amber-100">
                    <button
                      onClick={() => handleAddToCart(p)}
                      disabled={p.stock <= 0}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>🛒</span>
                      <span>{p.stock > 0 ? "Añadir al Carrito" : "Sin Stock"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 2: SERVICIOS Y CATAS ======================= */}
      {activeTab === "servicios" && (
        <div className="space-y-6">
          <div className="text-left bg-white p-6 rounded-3xl border border-amber-100">
            <h2 className="text-2xl font-bold text-amber-950 font-serif">Servicios de Barismo & Catas de Café</h2>
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">
              Vive experiencias sensoriales inolvidables con nuestros baristas certificados o solicita asesoría para tu cafetería.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {servicios.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-amber-100 rounded-3xl shadow-sm hover:shadow-xl transition-all p-6 text-left flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-3xl">✨</span>
                    <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                      ⏱️ {s.duracion || "1 hora"}
                    </span>
                  </div>
                  <h3 className="font-bold text-xl text-amber-950 font-serif">{s.nombre}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{s.descripcion}</p>
                  <p className="text-2xl font-black text-amber-900 pt-3">
                    ${Number(s.precio).toLocaleString()} COP
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-amber-100">
                  <a
                    href="https://wa.me/573000000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl transition-colors"
                  >
                    💬 Reservar por WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= TAB 3: MIS PEDIDOS ======================= */}
      {activeTab === "pedidos" && (
        <div className="space-y-6">
          <div className="text-left bg-white p-6 rounded-3xl border border-amber-100">
            <h2 className="text-2xl font-bold text-amber-950 font-serif">Historial de Tus Pedidos</h2>
            <p className="text-sm text-gray-600 mt-1">
              Monitorea el estado y detalle de tus compras de café en tiempo real.
            </p>
          </div>

          {misPedidos.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-amber-100 space-y-3">
              <span className="text-6xl">📦</span>
              <h3 className="text-lg font-bold text-amber-950">Aún no has realizado pedidos</h3>
              <p className="text-sm text-gray-500">Agrega granos de café a tu carrito y confirma tu primera compra.</p>
              <button
                onClick={() => setActiveTab("catalogo")}
                className="mt-2 px-5 py-2.5 bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Ir al Catálogo
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {misPedidos.map((ped) => (
                <div
                  key={ped.id}
                  className="bg-white border border-amber-100 rounded-3xl shadow-sm p-6 text-left space-y-4"
                >
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b border-amber-100 pb-3">
                    <div>
                      <span className="font-extrabold text-amber-950 text-lg font-serif">
                        Pedido #{ped.id}
                      </span>
                      <span className="text-xs text-gray-500 ml-3">
                        {new Date(ped.fecha_creacion).toLocaleDateString()} a las {new Date(ped.fecha_creacion).toLocaleTimeString()}
                      </span>
                    </div>

                    <span className={`text-xs px-3 py-1 rounded-full font-extrabold ${
                      ped.estado === "Entregado"
                        ? "bg-green-100 text-green-800"
                        : ped.estado === "Preparando" || ped.estado === "Enviado"
                        ? "bg-blue-100 text-blue-800"
                        : ped.estado === "Cancelado"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-900"
                    }`}>
                      ● Estado: {ped.estado}
                    </span>
                  </div>

                  {/* Info Entrega */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-amber-50/40 p-3 rounded-2xl">
                    <div>
                      <strong>Dirección:</strong> {ped.direccion_envio}
                    </div>
                    <div>
                      <strong>Teléfono:</strong> {ped.telefono_contacto || "N/A"}
                    </div>
                    <div>
                      <strong>Pago:</strong> {ped.metodo_pago}
                    </div>
                  </div>

                  {/* Artículos comprados */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-amber-950 uppercase">Artículos del Pedido:</p>
                    <div className="space-y-2">
                      {ped.detalles?.map((det) => (
                        <div
                          key={det.id}
                          className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded-xl border border-gray-100"
                        >
                          <div className="flex items-center space-x-2">
                            <span>☕</span>
                            <span className="font-semibold text-gray-800">
                              {det.producto?.nombre}
                            </span>
                            <span className="text-gray-500">x {det.cantidad}</span>
                          </div>
                          <span className="font-bold text-amber-950">
                            ${Number(det.subtotal).toLocaleString()} COP
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {ped.notas ? `Nota: ${ped.notas}` : "Sin instrucciones adicionales"}
                    </span>
                    <span className="text-xl font-black text-amber-950">
                      Total: ${Number(ped.total).toLocaleString()} COP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
