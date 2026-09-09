import React, { useState, useEffect } from "react";

export function AdminPanel({ activeTabFromSidebar }) {
  const [activeTab, setActiveTab] = useState(activeTabFromSidebar || "usuarios");
  const token = localStorage.getItem("token");

  // State lists
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [pedidos, setPedidos] = useState([]);

  // Modals state
  const [userModal, setUserModal] = useState({ open: false, mode: "create", data: null });
  const [productModal, setProductModal] = useState({ open: false, mode: "create", data: null });
  const [serviceModal, setServiceModal] = useState({ open: false, mode: "create", data: null });

  // Errors state
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (activeTabFromSidebar) {
      setActiveTab(activeTabFromSidebar);
    }
  }, [activeTabFromSidebar]);

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
    const resUsers = await apiFetch("/usuarios");
    if (resUsers) setUsuarios(resUsers.usuarios || []);

    const resProd = await apiFetch("/productos?solo_activos=false");
    if (resProd) setProductos(resProd.productos || []);

    const resServ = await apiFetch("/servicios?solo_activos=false");
    if (resServ) setServicios(resServ.servicios || []);

    const resPed = await apiFetch("/pedidos");
    if (resPed) setPedidos(resPed.pedidos || []);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // --- VALIDACIONES USUARIO ---
  const validateUser = (data) => {
    const err = {};
    if (!data.nombres || data.nombres.trim().length < 2) err.nombres = "Mínimo 2 caracteres.";
    if (!data.apellidos || data.apellidos.trim().length < 2) err.apellidos = "Mínimo 2 caracteres.";
    if (!data.numero_documento || isNaN(data.numero_documento) || data.numero_documento.length < 5 || data.numero_documento.length > 15) {
      err.numero_documento = "Documento numérico entre 5 y 15 dígitos.";
    }
    if (data.telefono && (isNaN(data.telefono) || data.telefono.length < 7 || data.telefono.length > 15)) {
      err.telefono = "Teléfono numérico entre 7 y 15 dígitos.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) err.email = "Formato de correo inválido.";
    if (userModal.mode === "create" && (!data.password || data.password.length < 8)) {
      err.password = "Mínimo 8 caracteres.";
    }
    return err;
  };

  // --- CRUD USUARIOS ---
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.rol_id = parseInt(data.rol_id);

    const errs = validateUser(data);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    if (userModal.mode === "create") {
      const res = await apiFetch("/usuarios", { method: "POST", body: JSON.stringify(data) });
      if (res) {
        alert("Usuario creado correctamente.");
        setUserModal({ open: false, mode: "create", data: null });
        fetchAll();
      }
    } else {
      const res = await apiFetch(`/usuarios/${userModal.data.id}`, { method: "PUT", body: JSON.stringify(data) });
      if (res) {
        alert("Usuario actualizado correctamente.");
        setUserModal({ open: false, mode: "create", data: null });
        fetchAll();
      }
    }
  };

  const handleToggleEstado = async (id, currentEstado) => {
    const nuevoEstado = currentEstado === "Activo" ? "Inactivo" : "Activo";
    const res = await apiFetch(`/usuarios/${id}/estado`, {
      method: "PATCH",
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    if (res) fetchAll();
  };

  const handleDeleteUser = async (id, nombre) => {
    if (confirm(`¿Estás seguro de eliminar permanentemente a ${nombre}?`)) {
      const res = await apiFetch(`/usuarios/${id}`, { method: "DELETE" });
      if (res) {
        alert("Usuario eliminado.");
        fetchAll();
      }
    }
  };

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
        alert("Producto de café creado.");
        setProductModal({ open: false, mode: "create", data: null });
        fetchAll();
      }
    } else {
      const res = await apiFetch(`/productos/${productModal.data.id}`, { method: "PUT", body: JSON.stringify(data) });
      if (res) {
        alert("Producto de café actualizado.");
        setProductModal({ open: false, mode: "create", data: null });
        fetchAll();
      }
    }
  };

  const handleDeleteProduct = async (id, nombre) => {
    if (confirm(`¿Eliminar permanentemente el producto '${nombre}'?`)) {
      const res = await apiFetch(`/productos/${id}`, { method: "DELETE" });
      if (res) {
        alert("Producto eliminado.");
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
        alert("Servicio creado.");
        setServiceModal({ open: false, mode: "create", data: null });
        fetchAll();
      }
    } else {
      const res = await apiFetch(`/servicios/${serviceModal.data.id}`, { method: "PUT", body: JSON.stringify(data) });
      if (res) {
        alert("Servicio actualizado.");
        setServiceModal({ open: false, mode: "create", data: null });
        fetchAll();
      }
    }
  };

  const handleDeleteService = async (id, nombre) => {
    if (confirm(`¿Eliminar el servicio '${nombre}'?`)) {
      const res = await apiFetch(`/servicios/${id}`, { method: "DELETE" });
      if (res) {
        alert("Servicio eliminado.");
        fetchAll();
      }
    }
  };

  // --- PEDIDOS ---
  const handleOrderStatusChange = async (pedidoId, nuevoEstado) => {
    const res = await apiFetch(`/pedidos/${pedidoId}/estado`, {
      method: "PATCH",
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    if (res) {
      alert(`Pedido #${pedidoId} actualizado a '${nuevoEstado}'`);
      fetchAll();
    }
  };

  return (
    <div className="w-full p-6 md:p-8 max-w-7xl mx-auto min-h-screen text-left">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-6 rounded-3xl shadow-xl mb-8 border border-amber-900/30">
        <div>
          <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full mb-1">
            Administración Global
          </span>
          <h1 className="text-3xl font-extrabold font-serif">Panel de Control CafeLi</h1>
          <p className="text-amber-100/70 text-xs mt-1">
            Gestión integral de usuarios, catálogo de granos, servicios y pedidos de café.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchAll}
            className="px-4 py-2 bg-amber-800/80 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            🔄 Actualizar Datos
          </button>
        </div>
      </div>

      {/* Internal Tabs (as well as sidebar sync) */}
      <div className="flex border-b border-amber-200 mb-8 space-x-3 overflow-x-auto">
        {[
          { id: "usuarios", label: "Usuarios", icon: "👥", count: usuarios.length },
          { id: "productos", label: "Granos de Café", icon: "☕", count: productos.length },
          { id: "servicios", label: "Servicios", icon: "✨", count: servicios.length },
          { id: "pedidos", label: "Pedidos", icon: "📦", count: pedidos.length },
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

      {/* ======================= TAB USUARIOS ======================= */}
      {activeTab === "usuarios" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-amber-100 shadow-xs">
            <div>
              <h2 className="text-xl font-bold text-amber-950 font-serif">Gestión de Usuarios</h2>
              <p className="text-xs text-gray-500">Control de clientes, empleados y administradores</p>
            </div>
            <button
              onClick={() => {
                setErrors({});
                setUserModal({ open: true, mode: "create", data: null });
              }}
              className="bg-amber-700 hover:bg-amber-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center space-x-1"
            >
              <span>➕</span>
              <span>Agregar Usuario</span>
            </button>
          </div>

          <div className="overflow-x-auto bg-white rounded-3xl shadow-sm border border-amber-100">
            <table className="min-w-full divide-y divide-amber-100 text-left text-xs text-gray-700">
              <thead className="bg-amber-50/70 text-amber-950 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Usuario</th>
                  <th className="p-4">Documento</th>
                  <th className="p-4">Contacto</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="p-4 font-bold text-gray-900">
                      {u.nombres} {u.apellidos}
                    </td>
                    <td className="p-4 text-gray-600">{u.tipo_documento} {u.numero_documento}</td>
                    <td className="p-4 text-gray-600">{u.telefono || "-"}</td>
                    <td className="p-4 text-amber-900 font-medium">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.rol_nombre === "Administrador"
                          ? "bg-purple-100 text-purple-900"
                          : u.rol_nombre === "Empleado"
                          ? "bg-blue-100 text-blue-900"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {u.rol_nombre}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleEstado(u.id, u.estado)}
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-colors ${
                          u.estado === "Activo"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        ● {u.estado}
                      </button>
                    </td>
                    <td className="p-4 flex space-x-2 justify-center">
                      <button
                        onClick={() => {
                          setErrors({});
                          setUserModal({ open: true, mode: "edit", data: u });
                        }}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id, `${u.nombres} ${u.apellidos}`)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= TAB PRODUCTOS ======================= */}
      {activeTab === "productos" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-amber-100 shadow-xs">
            <div>
              <h2 className="text-xl font-bold text-amber-950 font-serif">Catálogo de Granos de Café</h2>
              <p className="text-xs text-gray-500">Administra los productos de café de especialidad</p>
            </div>
            <button
              onClick={() => setProductModal({ open: true, mode: "create", data: null })}
              className="bg-amber-700 hover:bg-amber-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center space-x-1"
            >
              <span>➕</span>
              <span>Nuevo Grano de Café</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {productos.map((p) => (
              <div key={p.id} className="bg-white border border-amber-100 rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="relative h-44 bg-amber-900/10 overflow-hidden">
                    {p.imagen_url ? (
                      <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-amber-800">☕</div>
                    )}
                    <span className="absolute top-3 right-3 bg-stone-900/85 text-amber-300 text-xs font-bold px-2 py-0.5 rounded-md">
                      {p.tipo_tueste ? `Tueste ${p.tipo_tueste}` : p.categoria}
                    </span>
                    <span className="absolute bottom-3 left-3 bg-amber-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      📍 {p.origen || "Colombia"}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-base text-amber-950">{p.nombre}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{p.descripcion}</p>
                    <div className="pt-2 flex justify-between items-center">
                      <span className="font-extrabold text-amber-950 text-base">
                        ${Number(p.precio).toLocaleString()} COP
                      </span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        p.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        Stock: {p.stock}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/40 border-t border-amber-100 flex space-x-2">
                  <button
                    onClick={() => setProductModal({ open: true, mode: "edit", data: p })}
                    className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold py-2 rounded-lg text-xs transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.id, p.nombre)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2 rounded-lg text-xs border border-red-200 transition-colors"
                  >
                    Eliminar
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
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-amber-100 shadow-xs">
            <div>
              <h2 className="text-xl font-bold text-amber-950 font-serif">Servicios de Barismo</h2>
              <p className="text-xs text-gray-500">Talleres, catas sensoriales y mantenimiento</p>
            </div>
            <button
              onClick={() => setServiceModal({ open: true, mode: "create", data: null })}
              className="bg-amber-700 hover:bg-amber-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center space-x-1"
            >
              <span>➕</span>
              <span>Nuevo Servicio</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {servicios.map((s) => (
              <div key={s.id} className="bg-white border border-amber-100 rounded-3xl shadow-sm p-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-3xl">✨</span>
                    <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
                      ⏱️ {s.duracion || "1 hora"}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-amber-950 font-serif">{s.nombre}</h3>
                  <p className="text-xs text-gray-500">{s.descripcion}</p>
                  <p className="text-xl font-black text-amber-900 pt-2">
                    ${Number(s.precio).toLocaleString()} COP
                  </p>
                </div>

                <div className="flex space-x-2 mt-5 pt-4 border-t border-amber-100">
                  <button
                    onClick={() => setServiceModal({ open: true, mode: "edit", data: s })}
                    className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold py-2 rounded-lg transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteService(s.id, s.nombre)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold py-2 rounded-lg border border-red-200 transition-colors"
                  >
                    Eliminar
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
          <div className="bg-white p-4 rounded-2xl border border-amber-100">
            <h2 className="text-xl font-bold text-amber-950 font-serif">Control Maestro de Pedidos</h2>
            <p className="text-xs text-gray-500">Historial de todas las compras de café en la plataforma</p>
          </div>

          <div className="space-y-4">
            {pedidos.map((ped) => (
              <div key={ped.id} className="bg-white border border-amber-100 rounded-3xl shadow-sm p-5 space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-amber-100 pb-3">
                  <div>
                    <span className="font-extrabold text-amber-950 text-base font-serif">
                      Pedido #{ped.id}
                    </span>
                    <span className="text-xs text-gray-500 ml-3">
                      {new Date(ped.fecha_creacion).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-600">Estado:</span>
                    <select
                      value={ped.estado}
                      onChange={(e) => handleOrderStatusChange(ped.id, e.target.value)}
                      className="text-xs font-bold p-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900"
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-amber-50/40 p-3 rounded-2xl">
                  <div><strong>Cliente:</strong> {ped.usuario?.nombres} {ped.usuario?.apellidos} ({ped.usuario?.email})</div>
                  <div><strong>Dirección:</strong> {ped.direccion_envio}</div>
                  <div><strong>Teléfono:</strong> {ped.telefono_contacto || "N/A"}</div>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-amber-950 uppercase">Artículos:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {ped.detalles?.map((det) => (
                      <div key={det.id} className="text-xs bg-gray-50 p-2 rounded-xl border border-gray-100 flex justify-between">
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
            ))}
          </div>
        </div>
      )}

      {/* ======================= MODALES ADMIN ======================= */}
      {/* Modal Usuario */}
      {userModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold text-amber-950 mb-4 font-serif">
              {userModal.mode === "create" ? "Agregar Nuevo Usuario" : "Editar Usuario"}
            </h2>
            <form onSubmit={handleUserSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-700">Nombres *</label>
                  <input
                    name="nombres"
                    defaultValue={userModal.data?.nombres || ""}
                    required
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                  {errors.nombres && <p className="text-red-600 text-[10px] mt-1">{errors.nombres}</p>}
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">Apellidos *</label>
                  <input
                    name="apellidos"
                    defaultValue={userModal.data?.apellidos || ""}
                    required
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                  {errors.apellidos && <p className="text-red-600 text-[10px] mt-1">{errors.apellidos}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-700">Tipo Documento</label>
                  <select name="tipo_documento" defaultValue={userModal.data?.tipo_documento || "CC"} className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none">
                    <option>CC</option>
                    <option>TI</option>
                    <option>CE</option>
                    <option>PEP</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">Nro. Documento *</label>
                  <input
                    name="numero_documento"
                    defaultValue={userModal.data?.numero_documento || ""}
                    required
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                  {errors.numero_documento && <p className="text-red-600 text-[10px] mt-1">{errors.numero_documento}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-700">Dirección</label>
                  <input name="direccion" defaultValue={userModal.data?.direccion || ""} className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">Teléfono</label>
                  <input
                    name="telefono"
                    defaultValue={userModal.data?.telefono || ""}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                  {errors.telefono && <p className="text-red-600 text-[10px] mt-1">{errors.telefono}</p>}
                </div>
              </div>

              <div>
                <label className="block mb-1 text-gray-700">Email *</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={userModal.data?.email || ""}
                  required
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                />
                {errors.email && <p className="text-red-600 text-[10px] mt-1">{errors.email}</p>}
              </div>

              {userModal.mode === "create" && (
                <div>
                  <label className="block mb-1 text-gray-700">Contraseña *</label>
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                  {errors.password && <p className="text-red-600 text-[10px] mt-1">{errors.password}</p>}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-700">Rol</label>
                  <select name="rol_id" defaultValue={userModal.data?.rol_id || "2"} className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none">
                    <option value="1">Administrador</option>
                    <option value="2">Cliente</option>
                    <option value="3">Empleado</option>
                  </select>
                </div>
                {userModal.mode === "create" && (
                  <div>
                    <label className="block mb-1 text-gray-700">Estado</label>
                    <select name="estado" defaultValue="Activo" className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none">
                      <option>Activo</option>
                      <option>Inactivo</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setUserModal({ open: false, mode: "create", data: null })}
                  className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button type="submit" className="bg-amber-700 hover:bg-amber-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md">
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Producto */}
      {productModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl text-left max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-amber-950 mb-4 font-serif">
              {productModal.mode === "create" ? "Nuevo Producto de Café" : "Editar Producto de Café"}
            </h2>
            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block mb-1 text-gray-700">Nombre del Café *</label>
                <input
                  name="nombre"
                  defaultValue={productModal.data?.nombre || ""}
                  required
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-700">Origen / Finca</label>
                  <input
                    name="origen"
                    defaultValue={productModal.data?.origen || "Colombia"}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">Tipo de Tueste</label>
                  <select name="tipo_tueste" defaultValue={productModal.data?.tipo_tueste || "Medio"} className="w-full text-sm p-2.5 border border-gray-300 rounded-xl">
                    <option value="Claro">Claro</option>
                    <option value="Medio">Medio</option>
                    <option value="Oscuro">Oscuro</option>
                    <option value="N/A">N/A</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-700">Categoría</label>
                  <select name="categoria" defaultValue={productModal.data?.categoria || "Café en Grano"} className="w-full text-sm p-2.5 border border-gray-300 rounded-xl">
                    <option value="Café en Grano">Café en Grano</option>
                    <option value="Café Molido">Café Molido</option>
                    <option value="Accesorios">Accesorios</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">Estado</label>
                  <select name="estado" defaultValue={productModal.data?.estado || "Activo"} className="w-full text-sm p-2.5 border border-gray-300 rounded-xl">
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
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-700">Precio (COP) *</label>
                  <input
                    name="precio"
                    type="number"
                    defaultValue={productModal.data?.precio || ""}
                    required
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">Stock *</label>
                  <input
                    name="stock"
                    type="number"
                    defaultValue={productModal.data?.stock ?? 25}
                    required
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-gray-700">URL Imagen</label>
                <input
                  name="imagen_url"
                  defaultValue={productModal.data?.imagen_url || ""}
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-xl"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setProductModal({ open: false, mode: "create", data: null })}
                  className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button type="submit" className="bg-amber-700 hover:bg-amber-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Servicio */}
      {serviceModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-left">
            <h2 className="text-2xl font-bold text-amber-950 mb-4 font-serif">
              {serviceModal.mode === "create" ? "Nuevo Servicio" : "Editar Servicio"}
            </h2>
            <form onSubmit={handleServiceSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block mb-1 text-gray-700">Nombre del Servicio *</label>
                <input
                  name="nombre"
                  defaultValue={serviceModal.data?.nombre || ""}
                  required
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-700">Descripción</label>
                <textarea
                  name="descripcion"
                  rows="2"
                  defaultValue={serviceModal.data?.descripcion || ""}
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-700">Precio (COP) *</label>
                  <input
                    name="precio"
                    type="number"
                    defaultValue={serviceModal.data?.precio || ""}
                    required
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">Duración</label>
                  <input
                    name="duracion"
                    defaultValue={serviceModal.data?.duracion || "1 hora"}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setServiceModal({ open: false, mode: "create", data: null })}
                  className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button type="submit" className="bg-amber-700 hover:bg-amber-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
