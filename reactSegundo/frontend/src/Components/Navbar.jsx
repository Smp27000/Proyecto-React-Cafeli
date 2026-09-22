import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../img/cafeli_logo_2.png";

function Navbar({ user, onLogout, cartCount = 0, onOpenCart }) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `relative px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 overflow-hidden ${
      isActive
        ? "text-coffee-900 bg-coffee-100 shadow-md-coffee translate-y-[-1px]"
        : "text-coffee-800/80 hover:text-coffee-950 hover:bg-coffee-50 hover:translate-y-[-1px]"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
      isActive
        ? "text-coffee-900 bg-coffee-100 font-bold shadow-sm-coffee"
        : "text-coffee-800/90 hover:text-coffee-950 hover:bg-coffee-50"
    }`;

  const handleLogoutClick = () => {
    setIsMobileMenuOpen(false);
    onLogout();
    navigate("/login");
  };

  const getUserInitials = () => {
    if (!user || !user.nombres) return "??";
    const parts = user.nombres.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-coffee-200/50 px-4 sm:px-8 py-3 shadow-md-coffee">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        <NavLink to="/" className="flex items-center space-x-3 group shrink-0">
          <div className="relative">
            <img
              src={logo}
              alt="CafeLi Logo"
              className="h-10 sm:h-12 w-auto object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-[-3deg] animate-float"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          <div className="text-left">
            <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-coffee-700 via-coffee-800 to-coffee-950 bg-clip-text text-transparent font-serif tracking-tight">
              CafeLi
            </span>
            <span className="block text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-coffee-600 font-bold -mt-0.5">
              Café de Especialidad
            </span>
          </div>
        </NavLink>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Navegación para pantallas Medianas y Grandes */}
          <nav className="hidden md:block">
            <ul className="flex items-center space-x-1 sm:space-x-2">
              <li>
                <NavLink to="/" end className={linkClass}>
                  <span className="relative z-10">Inicio</span>
                </NavLink>
              </li>

              {(!user || user.rol_nombre === "Cliente") && (
                <>
                  <li>
                    <NavLink to="/nosotros" className={linkClass}>
                      <span className="relative z-10">Nosotros</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/contacto" className={linkClass}>
                      <span className="relative z-10">Contacto</span>
                    </NavLink>
                  </li>
                </>
              )}

              {user && user.rol_nombre === "Administrador" && (
                <li>
                  <NavLink to="/admin" className={linkClass}>
                    <span className="relative z-10 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Panel Admin
                    </span>
                  </NavLink>
                </li>
              )}

              {user && user.rol_nombre === "Empleado" && (
                <li>
                  <NavLink to="/empleado" className={linkClass}>
                    <span className="relative z-10 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      Panel Empleado
                    </span>
                  </NavLink>
                </li>
              )}

              {user && user.rol_nombre === "Cliente" && (
                <li>
                  <NavLink to="/cliente" className={linkClass}>
                    <span className="relative z-10 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Tienda y Pedidos
                    </span>
                  </NavLink>
                </li>
              )}
            </ul>
          </nav>

          {/* Botón Carrito */}
          {(!user || user.rol_nombre === "Cliente") && (
            <button
              onClick={onOpenCart}
              className="relative group p-2.5 sm:p-3 backdrop-blur-md bg-white/60 hover:bg-coffee-50 text-coffee-800 border border-coffee-200/60 rounded-2xl transition-all duration-300 shadow-sm-coffee hover:shadow-lg-coffee hover:translate-y-[-1px] flex items-center space-x-1.5 sm:space-x-2"
              title="Ver Carrito de Compras"
            >
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden sm:inline text-sm font-bold text-coffee-900">Carrito</span>
              {cartCount > 0 && (
                <span className={`absolute -top-2 -right-2 bg-gradient-to-br from-amber-600 to-coffee-800 text-white text-[10px] font-extrabold min-w-[22px] h-[22px] px-1 rounded-full flex items-center justify-center shadow-lg-coffee ${cartCount > 0 ? 'animate-shake' : ''}`}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          )}

          {/* Estado de Usuario */}
          {user ? (
            <div className="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-3 border-l border-coffee-200/60">
              <div className="text-right hidden lg:block">
                <span className="block text-xs font-bold text-coffee-950 leading-tight">
                  Hola, {user.nombres}
                </span>
                <span className="text-[10px] text-coffee-600 font-semibold uppercase tracking-wide">
                  {user.rol_nombre}
                </span>
              </div>
              <div className="relative">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-coffee-500 via-coffee-700 to-coffee-950 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-md-coffee ring-2 ring-white/80">
                  {getUserInitials()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <button
                onClick={handleLogoutClick}
                className="hidden sm:flex px-3.5 py-2 text-xs font-bold text-coffee-800 hover:text-white bg-coffee-50 hover:bg-gradient-to-br hover:from-red-500 hover:to-red-700 border border-coffee-200 hover:border-red-500 rounded-2xl transition-all duration-300 shadow-sm-coffee hover:shadow-lg-coffee hover:translate-y-[-1px] items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Salir
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="group relative px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#6F4E37] to-[#4D3220] hover:from-[#8B5A2B] hover:to-[#2D1B10] rounded-2xl shadow-md-coffee hover:shadow-xl-coffee hover:translate-y-[-2px] transition-all duration-300 overflow-hidden flex items-center gap-1.5 sm:gap-2"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="relative z-10 whitespace-nowrap">Iniciar Sesión</span>
            </NavLink>
          )}

          {/* Botón Menú Hamburguesa para Móviles */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 rounded-2xl bg-coffee-50 hover:bg-coffee-100 text-coffee-800 border border-coffee-200/60 transition-colors"
            aria-label="Abrir menú de navegación"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

        </div>
      </div>

      {/* Menú desplegable Móvil */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-coffee-200/60 animate-fade-up">
          <nav className="flex flex-col space-y-1.5 pb-2 text-left">
            <NavLink to="/" end className={mobileLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
              Inicio
            </NavLink>

            {(!user || user.rol_nombre === "Cliente") && (
              <>
                <NavLink to="/nosotros" className={mobileLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                  Nosotros
                </NavLink>
                <NavLink to="/contacto" className={mobileLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                  Contacto
                </NavLink>
              </>
            )}

            {user && user.rol_nombre === "Administrador" && (
              <NavLink to="/admin" className={mobileLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                Panel Admin
              </NavLink>
            )}

            {user && user.rol_nombre === "Empleado" && (
              <NavLink to="/empleado" className={mobileLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                Panel Empleado
              </NavLink>
            )}

            {user && user.rol_nombre === "Cliente" && (
              <NavLink to="/cliente" className={mobileLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                Tienda y Pedidos
              </NavLink>
            )}

            {user && (
              <div className="pt-2 border-t border-coffee-200/40">
                <div className="px-4 py-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-coffee-950">{user.nombres} {user.apellidos}</p>
                    <p className="text-[10px] text-coffee-600 uppercase font-semibold">{user.rol_nombre}</p>
                  </div>
                  <button
                    onClick={handleLogoutClick}
                    className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
