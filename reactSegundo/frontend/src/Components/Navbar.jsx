// components/Navbar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../img/cafeli_logo_2.png";

function Navbar({ user, onLogout, cartCount = 0, onOpenCart }) {
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "text-amber-900 bg-amber-100 shadow-xs"
        : "text-amber-900/70 hover:text-amber-950 hover:bg-amber-50"
    }`;

  const handleLogoutClick = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-amber-200/70 px-6 py-3.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <NavLink to="/" className="flex items-center space-x-3 group">
          <img
            src={logo}
            alt="CafeLi Logo"
            className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <div className="text-left">
            <span className="text-2xl font-black bg-gradient-to-r from-amber-800 to-amber-950 bg-clip-text text-transparent font-serif tracking-tight">
              CafeLi
            </span>
            <span className="block text-[10px] uppercase tracking-widest text-amber-700 font-bold -mt-1">
              Café de Especialidad
            </span>
          </div>
        </NavLink>

        {/* Navigation & Actions */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          <nav>
            <ul className="flex items-center space-x-1 sm:space-x-2">
              <li>
                <NavLink to="/" end className={linkClass}>
                  Inicio
                </NavLink>
              </li>

              {/* Public or Client Links */}
              {(!user || user.rol_nombre === "Cliente") && (
                <>
                  <li>
                    <NavLink to="/nosotros" className={linkClass}>
                      Nosotros
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/contacto" className={linkClass}>
                      Contacto
                    </NavLink>
                  </li>
                </>
              )}

              {/* Role Panels */}
              {user && user.rol_nombre === "Administrador" && (
                <li>
                  <NavLink to="/admin" className={linkClass}>
                    ⚙️ Panel Admin
                  </NavLink>
                </li>
              )}

              {user && user.rol_nombre === "Empleado" && (
                <li>
                  <NavLink to="/empleado" className={linkClass}>
                    📋 Panel Empleado
                  </NavLink>
                </li>
              )}

              {user && user.rol_nombre === "Cliente" && (
                <li>
                  <NavLink to="/cliente" className={linkClass}>
                    ☕ Tienda y Pedidos
                  </NavLink>
                </li>
              )}
            </ul>
          </nav>

          {/* Cart Button (Always visible for Client or Guest) */}
          {(!user || user.rol_nombre === "Cliente") && (
            <button
              onClick={onOpenCart}
              className="relative p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl transition-all shadow-xs flex items-center space-x-2"
              title="Ver Carrito de Compras"
            >
              <span className="text-lg">🛒</span>
              <span className="hidden sm:inline text-xs font-bold text-amber-950">Carrito</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-700 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Auth Controls */}
          {user ? (
            <div className="flex items-center space-x-3 pl-3 border-l border-amber-200">
              <div className="text-right hidden md:block">
                <span className="block text-xs font-bold text-amber-950 leading-tight">
                  {user.nombres}
                </span>
                <span className="text-[10px] text-amber-700 font-semibold uppercase">
                  {user.rol_nombre}
                </span>
              </div>
              <button
                onClick={handleLogoutClick}
                className="px-3 py-1.5 text-xs font-bold text-red-700 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 rounded-lg transition-colors duration-200"
              >
                Salir
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 rounded-xl shadow-xs transition-all"
            >
              Iniciar Sesión
            </NavLink>
          )}

        </div>
      </div>
    </header>
  );
}

export default Navbar;