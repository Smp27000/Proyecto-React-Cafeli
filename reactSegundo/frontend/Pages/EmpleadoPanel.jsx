import React, { useState, useEffect } from "react";

export function EmpleadoPanel() {
  const [activeTab, setActiveTab] = useState("productos");
  const token = localStorage.getItem("token");

  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [productModal, setProductModal] = useState({ open: false, mode: "create", data: null });
  const [serviceModal, setServiceModal] = useState({ open: false, mode: "create", data: null });

  // API Call helper
  const apiFetch = async (endpoint, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };
    try {
      const res = await fetch(`http://localhost:3000/api/v1${endpoint}`, { ...options, headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.detail || "Error en la petición.");
      return data;
    } catch (err) {
      alert(err.message);
      return null;
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    const resProd = await apiFetch("/productos?solo_activos=false");
    if (resProd) setProductos(resProd.productos || []);

    const resServ = await apiFetch("/servicios?solo_activos=false");
    if (resServ) setServicios(resServ.servicios || []);

    const resPed = await apiFetch("/pedidos");
    if (resPed) setPedidos(resPed.pedidos || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // --- CRUD PRODUCTOS ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.precio = parseFloat(data.precio);
    data.stock = parseInt(data.stock);

    if (productModal.mode === "create") {
      const res = await apiFetch("/productos", { method: "POST", body: JSON.stringify(data) });
      if (res) {
        alert("¡Producto de café registrado exitosamente!");
        setProductModal({ open: false, mode: "create", data: null });
        fetchAll();
      }
    } else {
      const res = await apiFetch(`/productos/${productModal.data.id}`, { method: "PUT", body: JSON.stringify(data) });
      if (res) {
        alert("Producto de café actualizado correctamente.");
        setProductModal({ open: false, mode: "create", data: null });
        fetchAll();
      }
    }
  };

  const handleDeleteProduct = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el producto '${nombre}'?`)) {
      const res = await apiFetch(`/productos/${id}`, { method: "DELETE" });
      if (res) {
        alert("Producto eliminado del catálogo.");
        fetchAll();
      }
    }
  };

  // --- CRUD SERVICIOS ---
  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.precio = parseFloat(data.precio);

    if (serviceModal.mode === "create") {
      const res = await apiFetch("/servicios", { method: "POST", body: JSON.stringify(data) });
      if (res) {
        alert("Servicio registrado exitosamente.");
        setServiceModal({ open: false, mode: "create", data: null });
        fetchAll();
      }
    } else {
      const res = await apiFetch(`/servicios/${serviceModal.data.id}`, { method: "PUT", body: JSON.stringify(data) });
      if (res) {
        alert("Servicio actualizado correctamente.");
        setServiceModal({ open: false, mode: "create", data: null });
        fetchAll();
      }
    }
  };

  const handleDeleteService = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el servicio '${nombre}'?`)) {
      const res = await apiFetch(`/servicios/${id}`, { method: "DELETE" });
      if (res) {
        alert("Servicio eliminado con éxito.");
        fetchAll();
      }
    }
  };

  // --- ACTUALIZACIÓN DE ESTADO DE PEDIDOS ---
  const handleOrderStatusChange = async (pedidoId, nuevoEstado) => {
    const res = await apiFetch(`/pedidos/${pedidoId}/estado`, {
      method: "PATCH",
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    if (res) {
      alert(`Estado del pedido #${pedidoId} actualizado a '${nuevoEstado}'`);
      fetchAll();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 rounded-3xl p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left border border-amber-900/40">
        <div>
          <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full mb-2 uppercase tracking-wider">
            Operaciones y Catálogo
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold font-serif">Panel de Empleado</h1>
          <p className="text-amber-100/80 text-sm mt-1 max-w-xl">
            Gestiona el inventario de granos de café, servicios de barismo y la preparación de pedidos.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchAll}
            className="px-4 py-2.5 bg-amber-800/80 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            🔄 Refrescar Datos
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-amber-200 mb-8 space-x-3 overflow-x-auto">
        {[
          { id: "productos", label: "Granos y Café", icon: "☕", count: productos.length },
          { id: "servicios", label: "Servicios", icon: "✨", count: servicios.length },
          { id: "pedidos", label: "Pedidos Clientes", icon: "📦", count: pedidos.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-5 font-bold text-sm flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
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

      {/* ======================= TAB PRODUCTOS ======================= */}
      {activeTab === "productos" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-amber-100 shadow-xs">
            <div className="text-left">
              <h2 className="text-xl font-bold text-amber-950 font-serif">Catálogo de Granos de Café</h2>
              <p className="text-xs text-gray-500">Crea nuevos lotes de café o elimina productos obsoletos</p>
            </div>
            <button
              onClick={() => setProductModal({ open: true, mode: "create", data: null })}
              className="bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all text-sm flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Nuevo Producto de Café</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productos.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-amber-100 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 bg-amber-900/10 overflow-hidden">
                    {p.imagen_url ? (
                      <img
                        src={p.imagen_url}
                        alt={p.nombre}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-amber-800">
                        ☕
                      </div>
                    )}
                    <span className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-xs text-amber-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                      {p.tipo_tueste ? `Tueste ${p.tipo_tueste}` : p.categoria}
                    </span>
                    <span className="absolute bottom-3 left-3 bg-amber-600/90 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-0.5 rounded-md">
                      📍 {p.origen || "Colombia"}
                    </span>
                  </div>

                  <div className="p-5 text-left space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg text-amber-950 leading-snug">{p.nombre}</h3>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{p.descripcion}</p>

                    <div className="pt-3 border-t border-amber-50 flex justify-between items-center text-sm">
                      <span className="font-extrabold text-amber-900 text-lg">
                        ${Number(p.precio).toLocaleString()} COP
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        p.stock > 10
                          ? "bg-green-100 text-green-800"
                          : p.stock > 0
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        Stock: {p.stock}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acciones del Empleado: Editar y Eliminar */}
                <div className="p-4 bg-amber-50/40 border-t border-amber-100 flex space-x-2">
                  <button
                    onClick={() => setProductModal({ open: true, mode: "edit", data: p })}
                    className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>✏️</span>
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.id, p.nombre)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold py-2 rounded-lg transition-colors border border-red-200 flex items-center justify-center space-x-1"
                  >
                    <span>🗑️</span>
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= TAB SERVICIOS ======================= */}
      {activeTab === "servicios" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-amber-100 shadow-xs">
            <div className="text-left">
              <h2 className="text-xl font-bold text-amber-950 font-serif">Servicios de Barismo y Talleres</h2>
              <p className="text-xs text-gray-500">Agrega o retira experiencias de café y soporte</p>
            </div>
            <button
              onClick={() => setServiceModal({ open: true, mode: "create", data: null })}
              className="bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all text-sm flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Nuevo Servicio</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicios.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-amber-100 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between text-left"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-3xl">✨</span>
                    <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
                      ⏱️ {s.duracion || "1 hora"}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-amber-950">{s.nombre}</h3>
                  <p className="text-xs text-gray-500">{s.descripcion}</p>
                  <p className="text-xl font-extrabold text-amber-900 pt-2">
                    ${Number(s.precio).toLocaleString()} COP
                  </p>
                </div>

                {/* Acciones Empleado: Editar y Eliminar */}
                <div className="flex space-x-2 mt-5 pt-4 border-t border-amber-100">
                  <button
                    onClick={() => setServiceModal({ open: true, mode: "edit", data: s })}
                    className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>✏️</span>
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDeleteService(s.id, s.nombre)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold py-2 rounded-lg transition-colors border border-red-200 flex items-center justify-center space-x-1"
                  >
                    <span>🗑️</span>
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= TAB PEDIDOS ======================= */}
      {activeTab === "pedidos" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-amber-100 text-left">
            <h2 className="text-xl font-bold text-amber-950 font-serif">Despacho y Control de Pedidos</h2>
            <p className="text-xs text-gray-500">Actualiza el estado de las órdenes para informar a los clientes</p>
          </div>

          <div className="space-y-4">
            {pedidos.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No hay pedidos registrados.</p>
            ) : (
              pedidos.map((ped) => (
                <div
                  key={ped.id}
                  className="bg-white border border-amber-100 rounded-2xl shadow-sm p-5 text-left space-y-4"
                >
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b border-amber-100 pb-3">
                    <div>
                      <span className="font-extrabold text-amber-950 text-base">Pedido #{ped.id}</span>
                      <span className="text-xs text-gray-500 ml-3">
                        {new Date(ped.fecha_creacion).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-gray-600">Estado:</span>
                      <select
                        value={ped.estado}
                        onChange={(e) => handleOrderStatusChange(ped.id, e.target.value)}
                        className="text-xs font-bold p-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 focus:outline-none"
                      >
                        <option value="Pendiente">⏳ Pendiente</option>
                        <option value="Pagado">💳 Pagado</option>
                        <option value="Preparando">☕ Preparando</option>
                        <option value="Enviado">🚚 Enviado</option>
                        <option value="Entregado">✅ Entregado</option>
                        <option value="Cancelado">❌ Cancelado</option>
                      </select>
                    </div>
                  </div>

                  {/* Detalles del Cliente */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-amber-50/40 p-3 rounded-xl">
                    <div>
                      <strong>Cliente:</strong> {ped.usuario?.nombres} {ped.usuario?.apellidos}
                    </div>
                    <div>
                      <strong>Dirección:</strong> {ped.direccion_envio}
                    </div>
                    <div>
                      <strong>Teléfono:</strong> {ped.telefono_contacto || "N/A"}
                    </div>
                  </div>

                  {/* Lista de Ítems del Pedido */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-amber-950 uppercase">Artículos de café solicitados:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {ped.detalles?.map((det) => (
                        <div key={det.id} className="text-xs bg-gray-50 p-2 rounded-lg border border-gray-200 flex justify-between">
                          <span>{det.producto?.nombre} x {det.cantidad}</span>
                          <span className="font-bold">${Number(det.subtotal).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-sm">
                    <span className="text-xs text-gray-500">Método de pago: <strong>{ped.metodo_pago}</strong></span>
                    <span className="font-extrabold text-amber-950 text-base">Total: ${Number(ped.total).toLocaleString()} COP</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================= MODAL CREAR/EDITAR PRODUCTO ======================= */}
      {productModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-amber-100">
              <h2 className="text-2xl font-bold text-amber-950 font-serif">
                {productModal.mode === "create" ? "Nuevo Producto de Café" : "Editar Producto de Café"}
              </h2>
              <button
                onClick={() => setProductModal({ open: false, mode: "create", data: null })}
                className="text-gray-400 hover:text-gray-700 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block mb-1 text-gray-700">Nombre del Café / Artículo *</label>
                <input
                  name="nombre"
                  defaultValue={productModal.data?.nombre || ""}
                  placeholder="Ej. Café Geisha Especial - Finca La Palma"
                  required
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-700">Origen / Región</label>
                  <input
                    name="origen"
                    defaultValue={productModal.data?.origen || "Huila, Colombia"}
                    placeholder="Ej. Nariño, Colombia"
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">Tipo de Tueste</label>
                  <select
                    name="tipo_tueste"
                    defaultValue={productModal.data?.tipo_tueste || "Medio"}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  >
                    <option value="Claro">Claro (Floral/Frutal)</option>
                    <option value="Medio">Medio (Balanceado/Caramelo)</option>
                    <option value="Oscuro">Oscuro (Intenso/Chocolate)</option>
                    <option value="N/A">N/A (Accesorio)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-700">Categoría</label>
                  <select
                    name="categoria"
                    defaultValue={productModal.data?.categoria || "Café en Grano"}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  >
                    <option value="Café en Grano">Café en Grano</option>
                    <option value="Café Molido">Café Molido</option>
                    <option value="Accesorios">Accesorios y Cafeteras</option>
                    <option value="Edición Especial">Edición Especial</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">Estado</label>
                  <select
                    name="estado"
                    defaultValue={productModal.data?.estado || "Activo"}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-gray-700">Descripción / Notas de Cata</label>
                <textarea
                  name="descripcion"
                  rows="2"
                  defaultValue={productModal.data?.descripcion || ""}
                  placeholder="Ej. Notas a jazmín, miel de abejas y durazno maduro."
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-700">Precio (COP) *</label>
                  <input
                    name="precio"
                    type="number"
                    step="500"
                    defaultValue={productModal.data?.precio || ""}
                    placeholder="Ej. 35000"
                    required
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">Stock Disponible *</label>
                  <input
                    name="stock"
                    type="number"
                    defaultValue={productModal.data?.stock ?? 20}
                    required
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-gray-700">URL de Imagen (Opcional)</label>
                <input
                  name="imagen_url"
                  defaultValue={productModal.data?.imagen_url || ""}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setProductModal({ open: false, mode: "create", data: null })}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-700 hover:bg-amber-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL CREAR/EDITAR SERVICIO ======================= */}
      {serviceModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-left">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-amber-100">
              <h2 className="text-2xl font-bold text-amber-950 font-serif">
                {serviceModal.mode === "create" ? "Nuevo Servicio de Café" : "Editar Servicio"}
              </h2>
              <button
                onClick={() => setServiceModal({ open: false, mode: "create", data: null })}
                className="text-gray-400 hover:text-gray-700 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleServiceSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block mb-1 text-gray-700">Nombre del Servicio *</label>
                <input
                  name="nombre"
                  defaultValue={serviceModal.data?.nombre || ""}
                  placeholder="Ej. Taller de Filtrados V60 y Chemex"
                  required
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-700">Descripción</label>
                <textarea
                  name="descripcion"
                  rows="2"
                  defaultValue={serviceModal.data?.descripcion || ""}
                  placeholder="Ej. Sesión práctica con barista certificado."
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-700">Precio (COP) *</label>
                  <input
                    name="precio"
                    type="number"
                    step="1000"
                    defaultValue={serviceModal.data?.precio || ""}
                    placeholder="Ej. 65000"
                    required
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">Duración Estimada</label>
                  <input
                    name="duracion"
                    defaultValue={serviceModal.data?.duracion || "2 horas"}
                    placeholder="Ej. 2 horas"
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setServiceModal({ open: false, mode: "create", data: null })}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-700 hover:bg-amber-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md"
                >
                  Guardar Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
