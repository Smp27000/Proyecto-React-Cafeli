import React from "react";
import { Link } from "react-router-dom";
import logo from "../img/cafeli_logo_2.png";

export const Footer = () => {
  return (
    <footer className="relative w-full overflow-hidden bg-gradient-to-t from-stone-950 via-[#4D3220] to-[#8B5A2B] text-white mt-auto">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-amber-500 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-coffee-500 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          <div className="space-y-5 animate-fade-up stagger-1">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={logo}
                  alt="CafeLi Logo"
                  className="h-14 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                />
              </div>
              <div>
                <h3 className="text-3xl font-black font-serif bg-gradient-to-r from-amber-200 to-coffee-200 bg-clip-text text-transparent leading-none">
                  CafeLi
                </h3>
                <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80 font-semibold mt-0.5">
                  Café de Especialidad
                </p>
              </div>
            </div>
            <p className="text-sm text-coffee-100/80 leading-relaxed max-w-xs">
              Granos seleccionados de las mejores fincas cafeteras colombianas.
              Tostado artesanal para entregarte el sabor, aroma y cuerpo perfecto
              en cada taza.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <div className="flex -space-x-2">
                {["★", "★", "★", "★", "★"].map((s, i) => (
                  <span key={i} className="text-amber-400 text-lg drop-shadow-md">
                    {s}
                  </span>
                ))}
              </div>
              <span className="text-xs text-coffee-200/70 font-medium">
                +5.000 clientes felices
              </span>
            </div>
          </div>

          <div className="space-y-5 animate-fade-up stagger-2">
            <h4 className="text-lg font-bold font-serif text-amber-200 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-gradient-to-r from-amber-400 to-transparent rounded-full" />
              Navegación
            </h4>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Inicio" },
                { to: "/nosotros", label: "Nosotros" },
                { to: "/cliente", label: "Catálogo" },
                { to: "/contacto", label: "Contacto" },
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    to={item.to}
                    className="group flex items-center gap-2 text-sm text-coffee-100/80 hover:text-amber-200 transition-all duration-300"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-amber-500/60 group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <span className="relative">
                      {item.label}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-gradient-to-r from-amber-400 to-amber-200 group-hover:w-full transition-all duration-300 rounded-full" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-5 animate-fade-up stagger-3">
            <h4 className="text-lg font-bold font-serif text-amber-200 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-gradient-to-r from-amber-400 to-transparent rounded-full" />
              Contáctanos
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 flex-shrink-0 rounded-2xl bg-gradient-to-br from-amber-600/30 to-coffee-700/30 flex items-center justify-center border border-amber-500/20">
                  <svg
                    className="w-4 h-4 text-amber-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-200/90">Dirección</p>
                  <p className="text-sm text-coffee-100/80">
                    Av. Principal #12-34, Zona Cafetera, Colombia
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 flex-shrink-0 rounded-2xl bg-gradient-to-br from-amber-600/30 to-coffee-700/30 flex items-center justify-center border border-amber-500/20">
                  <svg
                    className="w-4 h-4 text-amber-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-200/90">Teléfono</p>
                  <p className="text-sm text-coffee-100/80">+57 300 000 0000</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 flex-shrink-0 rounded-2xl bg-gradient-to-br from-amber-600/30 to-coffee-700/30 flex items-center justify-center border border-amber-500/20">
                  <svg
                    className="w-4 h-4 text-amber-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-200/90">Email</p>
                  <p className="text-sm text-coffee-100/80">hola@cafeli.com.co</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="space-y-5 animate-fade-up stagger-4">
            <h4 className="text-lg font-bold font-serif text-amber-200 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-gradient-to-r from-amber-400 to-transparent rounded-full" />
              Síguenos
            </h4>
            <p className="text-sm text-coffee-100/80">
              Conecta con nosotros y entérate de promociones, nuevos lanzamientos
              y tips para preparar el café perfecto.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://wa.me/573000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-11 h-11 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg-coffee hover:shadow-xl-coffee hover:scale-110 hover:rotate-[10deg] transition-all duration-300 border border-green-400/30"
                aria-label="WhatsApp"
              >
                <svg
                  className="w-5 h-5 text-white drop-shadow-sm"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.593 1.981 14.125.955 11.5.954c-5.448 0-9.87 4.372-9.874 9.802-.001 1.716.463 3.39 1.34 4.877l-1.02 3.725 3.812-1.004zM17.8 14.56c-.324-.162-1.92-.949-2.217-1.058-.297-.108-.513-.162-.73.162-.216.324-.838 1.058-1.027 1.274-.19.216-.378.243-.702.081-.324-.162-1.372-.505-2.613-1.611-.966-.862-1.617-1.927-1.806-2.251-.19-.324-.02-.5-.182-.661-.147-.146-.324-.378-.486-.568-.162-.19-.216-.324-.324-.54-.108-.216-.054-.405-.027-.568.027-.162.216-.513.324-.756.108-.243.162-.405.243-.567.081-.162.04-.324-.02-.486-.06-.162-.513-1.243-.703-1.702-.185-.446-.37-.386-.513-.393-.132-.006-.284-.007-.436-.007-.152 0-.401.057-.611.284-.21.228-.8.784-.8 1.913 0 1.129.82 2.217.933 2.37.113.153 1.613 2.463 3.91 3.455.546.236.973.377 1.305.483.55.174 1.05.15 1.446.09.44-.067 1.92-.784 2.19-1.54.27-.756.27-1.405.19-1.54-.08-.135-.297-.216-.621-.378z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/cafeli"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg-coffee hover:shadow-xl-coffee hover:scale-110 hover:-rotate-[10deg] transition-all duration-300 border border-pink-400/30"
                aria-label="Instagram"
              >
                <svg
                  className="w-5 h-5 text-white drop-shadow-sm"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://facebook.com/cafeli"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg-coffee hover:shadow-xl-coffee hover:scale-110 hover:rotate-[10deg] transition-all duration-300 border border-blue-400/30"
                aria-label="Facebook"
              >
                <svg
                  className="w-5 h-5 text-white drop-shadow-sm"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
            </div>
            <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-xs font-semibold text-amber-200 mb-2">🎁 Descuento exclusivo</p>
              <p className="text-xs text-coffee-100/70">
                Sigue nuestras redes y usa el código{" "}
                <span className="font-bold text-amber-300 bg-amber-900/40 px-1.5 py-0.5 rounded-lg">
                  CAFELI15
                </span>{" "}
                para obtener 15% OFF.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-coffee-600/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm text-coffee-100/60">
            <svg
              className="w-4 h-4 text-amber-500/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
              />
            </svg>
            <span className="font-medium">
              &copy; {new Date().getFullYear()} CafeLi. Todos los derechos reservados.
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-coffee-100/50">
            <a
              href="#"
              className="hover:text-amber-200 transition-colors duration-200"
            >
              Términos y Condiciones
            </a>
            <span className="w-1 h-1 rounded-full bg-coffee-500/50" />
            <a
              href="#"
              className="hover:text-amber-200 transition-colors duration-200"
            >
              Política de Privacidad
            </a>
            <span className="w-1 h-1 rounded-full bg-coffee-500/50" />
            <a
              href="#"
              className="hover:text-amber-200 transition-colors duration-200"
            >
              Envíos y Devoluciones
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
