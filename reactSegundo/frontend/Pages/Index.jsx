import React from 'react'
import { Link } from 'react-router-dom'
import Carrusel from '../src/Components/Carrusel'
import heroBg from '../src/assets/hero.png'

function Principal() {
  return (
    <div className="min-h-[calc(100vh-80px)] font-sans">
      <section
        className="relative overflow-hidden py-24 px-6"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(28, 15, 4, 0.92) 0%, rgba(41, 37, 36, 0.88) 50%, rgba(12, 10, 9, 0.95) 100%), url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 via-transparent to-stone-950/60 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-amber-200 bg-white/5 border border-amber-400/30 rounded-full backdrop-blur-sm">
              🌱 Café 100% Colombiano
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.05] font-serif">
              Todo el café,
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 bg-clip-text text-transparent">
                en un solo lugar.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-stone-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Descubre nuestra exclusiva selección de granos de café andinos y orgánicos, preparados con pasión y servidos con excelencia.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 px-7 py-4 text-base font-semibold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-2xl shadow-xl shadow-amber-500/20 hover:shadow-2xl hover:shadow-amber-400/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                Comenzar Ahora
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/nosotros"
                className="inline-flex items-center gap-2 px-7 py-4 text-base font-semibold text-white bg-white/5 border border-white/30 hover:bg-white/10 hover:border-white/50 hover:backdrop-blur-md rounded-2xl transition-all duration-300"
              >
                Saber Más
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full max-w-2xl">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl rotate-1 hover:rotate-0 transition-all duration-500 shadow-black/40">
              <Carrusel />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-block px-4 py-1.5 text-xs font-bold text-amber-800 tracking-widest uppercase bg-amber-100 rounded-full">
              Nuestras Ventajas
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-stone-950 font-serif">
              ¿Por qué elegir{' '}
              <span className="bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">
                CafeLi
              </span>
              ?
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Más que café, una experiencia cuidadosamente diseñada para los paladares más exigentes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center space-y-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white text-2xl shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                ☕
              </div>
              <h3 className="text-2xl font-bold text-stone-950 font-serif">Variedad Premium</h3>
              <p className="text-base text-stone-600 leading-relaxed">
                Seleccionamos granos finos de las mejores fincas colombianas para entregarte una taza perfecta.
              </p>
            </div>

            <div className="group p-8 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center space-y-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-2xl shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                🌿
              </div>
              <h3 className="text-2xl font-bold text-stone-950 font-serif">Grano 100% Orgánico</h3>
              <p className="text-base text-stone-600 leading-relaxed">
                Apoyamos a cultivadores tradicionales con procesos de comercio justo y ecológicos.
              </p>
            </div>

            <div className="group p-8 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center space-y-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-amber-600 to-stone-700 text-white text-2xl shadow-lg shadow-stone-500/30 group-hover:scale-110 transition-transform duration-300">
                ✨
              </div>
              <h3 className="text-2xl font-bold text-stone-950 font-serif">Experiencia Exclusiva</h3>
              <p className="text-base text-stone-600 leading-relaxed">
                Disfruta de nuestros servicios premium de barismo y reserva espacios únicos en nuestra tienda.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-stone-900 to-stone-950" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(180, 83, 9, 0.3) 0%, transparent 50%)` }} />
        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold text-white font-serif leading-tight">
            ¿Listo para probar el{' '}
            <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              mejor café
            </span>
            ?
          </h2>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto">
            Únete a miles de amantes del café que ya descubrieron la diferencia de un grano seleccionado con amor.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 px-8 py-4 text-lg font-bold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-2xl shadow-2xl shadow-amber-500/30 hover:shadow-amber-400/40 transition-all duration-300 hover:-translate-y-1"
            >
              Empezar Hoy
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/contacto"
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-white/5 border border-white/30 hover:bg-white/10 hover:border-white/50 hover:backdrop-blur-md rounded-2xl transition-all duration-300"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Principal
