import React from "react";
import img9 from '../src/img/img-coffe9.jpg';

export const Contact = () => {
  return (
    <div className="min-h-[calc(100vh-140px)] bg-stone-50 font-sans">
      <section className="relative py-24 px-6 bg-gradient-to-br from-stone-100 via-amber-50/40 to-stone-100 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold tracking-widest uppercase text-amber-800 bg-amber-100 rounded-full">
            ¿Tienes preguntas?
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-stone-950 font-serif tracking-tight leading-[1.05]">
            Ponte en{' '}
            <span className="bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">
              contacto
            </span>
          </h1>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Estamos aquí para ayudarte. Escríbenos a través de cualquiera de nuestros canales oficiales.
          </p>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8 order-2 lg:order-1">
            <div>
              <h2 className="text-3xl font-bold text-stone-950 font-serif mb-2">
                Información de contacto
              </h2>
              <p className="text-stone-600">
                Estamos disponibles para atenderte con gusto.
              </p>
            </div>

            <div className="space-y-5">
              <div className="group p-6 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Dirección</p>
                    <h3 className="text-lg font-bold text-stone-950">Carrera 43 #12-34</h3>
                    <p className="text-stone-600">Edificio Coffee Place, Piso 2, El Poblado, Medellín, Colombia</p>
                  </div>
                </div>
              </div>

              <div className="group p-6 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Teléfono y WhatsApp</p>
                    <h3 className="text-lg font-bold text-stone-950">+57 300 000 0000</h3>
                    <a href="https://wa.me/573000000000" target="_blank" rel="noopener noreferrer" className="text-amber-700 font-semibold hover:text-amber-800 transition-colors">
                      Abrir WhatsApp →
                    </a>
                  </div>
                </div>
              </div>

              <div className="group p-6 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-600 to-stone-700 text-white shadow-lg shadow-stone-500/25 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Correo Electrónico</p>
                    <h3 className="text-lg font-bold text-stone-950">contacto@cafeli.com</h3>
                    <a href="mailto:contacto@cafeli.com" className="text-amber-700 font-semibold hover:text-amber-800 transition-colors">
                      Enviar correo →
                    </a>
                  </div>
                </div>
              </div>

              <div className="group p-6 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Horarios de Atención</p>
                    <h3 className="text-lg font-bold text-stone-950">Lunes a Domingo</h3>
                    <p className="text-stone-600 space-y-0.5">
                      <span className="block">Lunes - Viernes: 7:00 AM — 9:00 PM</span>
                      <span className="block">Sábados: 8:00 AM — 10:00 PM</span>
                      <span className="block">Domingos y festivos: 9:00 AM — 8:00 PM</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-100">
              <div className="bg-amber-50 p-2">
                <div className="relative rounded-[22px] overflow-hidden">
                  <img
                    src={img9}
                    alt="Mapa CaféLi"
                    className="w-full h-72 object-cover brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-950/50 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-2xl border-4 border-white">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </div>
                    <div className="w-4 h-4 bg-amber-600 rotate-45 mx-auto -mt-2 border-r border-b border-amber-700" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 backdrop-blur rounded-2xl px-5 py-3 shadow-lg">
                      <p className="font-bold text-stone-950">📍 CafeLi Flagship Store</p>
                      <p className="text-sm text-stone-600">El Poblado, Medellín — Colombia</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:sticky lg:top-24">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-amber-400/40 to-amber-700/30 rounded-[2rem] blur-xl" />
              <div className="relative bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-8 md:p-10">
                <div className="space-y-2 mb-8">
                  <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-amber-800 bg-amber-100 rounded-full">
                    Escríbenos
                  </span>
                  <h2 className="text-3xl font-bold text-stone-950 font-serif">
                    Envía un mensaje
                  </h2>
                  <p className="text-stone-600">
                    Te responderemos en menos de 24 horas hábiles.
                  </p>
                </div>

                <form className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-stone-800">
                        Nombre
                      </label>
                      <input
                        type="text"
                        placeholder="Tu nombre completo"
                        className="w-full px-5 py-3.5 rounded-2xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-stone-800">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        placeholder="+57 300 000 0000"
                        className="w-full px-5 py-3.5 rounded-2xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-stone-800">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      placeholder="tu@correo.com"
                      className="w-full px-5 py-3.5 rounded-2xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-stone-800">
                      Asunto
                    </label>
                    <input
                      type="text"
                      placeholder="¿En qué podemos ayudarte?"
                      className="w-full px-5 py-3.5 rounded-2xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-stone-800">
                      Mensaje
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Cuéntanos sobre tu consulta, pedido o idea..."
                      className="w-full px-5 py-3.5 rounded-2xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm min-h-[9rem] resize-y"
                    />
                  </div>

                  <button
                    type="button"
                    className="group w-full inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-bold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-2xl shadow-xl shadow-amber-500/25 hover:shadow-2xl hover:shadow-amber-400/35 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Enviar Mensaje
                    <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
