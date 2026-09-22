import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../img/cafeli_logo_2.png";

export function AdminSidebar({ user, onLogout, activeTab, onTabChange }) {
  const navigate = useNavigate();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const handleTabSelect = (tabId) => {
    if (onTabChange) onTabChange(tabId);
    navigate("/admin");
    setIsOpenMobile(false);
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard & KPIs", icon: "📊" },
    { id: "ventas", label: "Gestión de Ventas", icon: "💰" },
    { id: "facturas", label: "Facturación", icon: "🧾" },
    { id: "pedidos", label: "Control de Pedidos", icon: "📦" },
    { id: "usuarios", label: "Gestión de Usuarios", icon: "👥" },
    { id: "productos", label: "Granos y Productos", icon: "☕" },
    { id: "servicios", label: "Servicios de Barismo", icon: "✨" },
    { id: "pqr", label: "Gestión PQR", icon: "📝" },
    { id: "reportes", label: "Reportes (PDF/Excel)", icon: "📈" },
    { id: "conversaciones", label: "Chatbot & Soporte", icon: "💬" },
  ];

  return (
    <>
      {/* Botón flotante móvil para desplegar Sidebar */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="p-2.5 rounded-2xl bg-stone-900 text-amber-300 border border-amber-500/30 shadow-xl flex items-center gap-2 text-xs font-bold"
          aria-label="Abrir panel admin"
        >
          {isOpenMobile ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
          <span>Menú Admin</span>
        </button>
      </div>

      {/* Overlay para móviles */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      <aside className={`w-64 bg-gradient-to-b from-stone-950 via-stone-950 to-amber-950 text-amber-50 h-screen sticky top-0 flex flex-col justify-between border-r border-white/5 shadow-2xl z-40 shrink-0 fixed md:sticky transition-transform duration-300 ${
        isOpenMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}>
        <div className="overflow-y-auto">
          <div className="p-6 border-b border-white/5 flex items-center space-x-3 bg-gradient-to-b from-white/5 to-transparent">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 via-amber-700 to-stone-800 flex items-center justify-center shadow-lg shrink-0">
              <img src={logo} alt="CafeLi Logo" className="h-7 w-auto object-contain" />
            </div>
            <div className="text-left min-w-0">
              <h1 className="text-lg font-extrabold tracking-wider text-amber-300 font-serif">
                CafeLi Admin
              </h1>
              <p className="text-[11px] uppercase tracking-widest text-amber-200/50 font-semibold">
                Panel Maestro
              </p>
            </div>
          </div>

          {user && (
            <div className="m-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-left">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0 ring-2 ring-amber-300/20">
                  {user.nombres?.charAt(0) || "A"}
                </div>
                <div className="overflow-hidden min-w-0 flex-1">
                  <p className="text-xs font-bold text-amber-100 truncate">{user.nombres} {user.apellidos}</p>
                  <span className="inline-block text-[10px] mt-1 border border-amber-400/40 text-amber-300 px-2 py-0.5 rounded-full font-medium">
                    {user.rol_nombre}
                  </span>
                </div>
              </div>
            </div>
          )}

          <nav className="p-3 space-y-1.5 text-left">
            <p className="px-4 text-[10px] uppercase font-bold tracking-widest text-amber-400/40 mb-3 mt-2">
              Módulos del Sistema
            </p>

            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabSelect(item.id)}
                  className={`relative w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-white/10 backdrop-blur-sm text-white shadow-inner"
                      : "text-amber-100/60 hover:text-white hover:bg-white/5 hover:translate-x-0.5"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                  )}
                  <span className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all ${
                    isActive
                      ? "bg-white/15 text-amber-300"
                      : "bg-white/5 text-amber-200/60 group-hover:bg-white/10"
                  }`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-4 mt-5 border-t border-white/5">
              <NavLink
                to="/"
                onClick={() => setIsOpenMobile(false)}
                className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs text-amber-200/40 hover:text-amber-200 hover:bg-white/5 transition-all duration-200 hover:translate-x-0.5"
              >
                <span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">🌐</span>
                <span>Ver Tienda Pública</span>
              </NavLink>
            </div>
          </nav>
        </div>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-red-400/50 text-red-300 hover:bg-red-500/10 hover:text-red-200 hover:border-red-300 text-xs font-semibold rounded-xl transition-all duration-200"
          >
            <span>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
