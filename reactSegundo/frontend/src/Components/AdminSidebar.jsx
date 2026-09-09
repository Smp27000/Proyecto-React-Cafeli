import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../img/cafeli_logo_2.png";

export function AdminSidebar({ user, onLogout, activeTab, onTabChange }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const navItems = [
    { id: "usuarios", label: "Gestión de Usuarios", icon: "👥" },
    { id: "productos", label: "Granos y Productos", icon: "☕" },
    { id: "servicios", label: "Servicios de Barismo", icon: "✨" },
    { id: "pedidos", label: "Control de Pedidos", icon: "📦" },
  ];

  return (
    <aside className="w-64 bg-stone-950 text-amber-50 h-screen sticky top-0 flex flex-col justify-between border-r border-amber-950/40 shadow-2xl z-40 shrink-0">
      {/* Top branding */}
      <div>
        <div className="p-6 border-b border-amber-900/30 flex items-center space-x-3 bg-gradient-to-b from-amber-950/40 to-transparent">
          <img src={logo} alt="CafeLi Logo" className="h-10 w-auto object-contain" />
          <div className="text-left">
            <h1 className="text-lg font-extrabold tracking-wider text-amber-400 font-serif">
              CafeLi Admin
            </h1>
            <p className="text-[11px] uppercase tracking-widest text-amber-200/60 font-semibold">
              Panel Maestro
            </p>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className="m-4 p-3 bg-amber-900/20 border border-amber-800/30 rounded-xl text-left">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-sm">
                {user.nombres?.charAt(0) || "A"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-amber-100 truncate">{user.nombres} {user.apellidos}</p>
                <span className="inline-block text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-medium">
                  {user.rol_nombre}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <nav className="p-4 space-y-1.5 text-left">
          <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-amber-400/50 mb-2">
            Módulos del Sistema
          </p>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange && onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-md font-semibold border-l-4 border-amber-300"
                    : "text-amber-100/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-amber-900/30">
            <NavLink
              to="/"
              className="flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs text-amber-200/60 hover:text-amber-200 hover:bg-white/5 transition-all"
            >
              <span>🌐</span>
              <span>Ver Tienda Pública</span>
            </NavLink>
          </div>
        </nav>
      </div>

      {/* Footer logout */}
      <div className="p-4 border-t border-amber-900/30 bg-black/20">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 bg-red-950/60 hover:bg-red-900 text-red-200 text-xs font-semibold rounded-xl border border-red-900/50 transition-colors"
        >
          <span>🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
