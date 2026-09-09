import React from 'react'
import { Link } from 'react-router-dom'
import Carrusel from '../src/Components/Carrusel'

function Principal() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 font-sans">
      {/* Hero Section */}
      <section className="relative py-16 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/40 rounded-full">
            El verdadero sabor del café
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
            Todo el café, <br />
            <span className="text-amber-600 dark:text-amber-500">en un solo lugar.</span>
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto lg:mx-0">
            Descubre nuestra exclusiva selección de granos de café andinos y orgánicos, preparados con pasión y servidos con excelencia.
          </p>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <Link
              to="/login"
              className="px-6 py-3 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              Comenzar Ahora
            </Link>
            <Link
              to="/nosotros"
              className="px-6 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-805/80 rounded-xl transition-all duration-200"
            >
              Saber Más
            </Link>
          </div>
        </div>

        {/* Carousel Section */}
        <div className="flex-1 w-full max-w-2xl">
          <Carrusel />
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-16 bg-white dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-white mb-12">
            ¿Por qué elegir <span className="text-amber-600 dark:text-amber-500">CafeLi</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 text-center space-y-4">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-2xl">
                ☕
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">Variedad Premium</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Seleccionamos granos finos de las mejores fincas colombianas para entregarte una taza perfecta.
              </p>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 text-center space-y-4">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-2xl">
                🌿
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">Grano 100% Orgánico</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Apoyamos a cultivadores tradicionales con procesos de comercio justo y ecológicos.
              </p>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 text-center space-y-4">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-2xl">
                ✨
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">Experiencia Exclusiva</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Disfruta de nuestros servicios premium de barismo y reserva espacios únicos en nuestra tienda.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Principal