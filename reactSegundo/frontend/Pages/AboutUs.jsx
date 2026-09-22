import React from 'react';
import img6 from '../src/img/img-coffe6.jpg';
import img3 from '../src/img/img-coffe3.jpg';
import img7 from '../src/img/img-coffe7.jpg';
import { Link } from 'react-router-dom';

export const AboutUs = () => {
  return (
    <div className="min-h-[calc(100vh-140px)] bg-stone-50 font-sans">
      <section className="relative py-24 px-6 bg-gradient-to-br from-stone-100 via-amber-50/50 to-stone-100 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold tracking-widest uppercase text-amber-800 bg-amber-100 rounded-full">
            Nuestra Historia
          </span>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-amber-600" />
            <h1 className="text-5xl md:text-7xl font-black text-stone-950 font-serif tracking-tight">
              Sobre <span className="bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">CafeLi</span>
            </h1>
            <div className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-amber-600" />
          </div>
          <p className="text-xl md:text-2xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
            Un viaje desde las fincas colombianas hasta tu taza.
          </p>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 order-2 lg:order-1">
            <div className="inline-block">
              <span className="text-xs font-bold tracking-widest uppercase text-amber-700">
                — ¿Quiénes somos?
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-stone-950 font-serif leading-tight">
              El café{' '}
              <span className="bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">
                como nunca antes lo habías probado
              </span>
            </h2>
            <div className="space-y-6 text-lg text-stone-600 leading-relaxed">
              <p>
                En <span className="font-semibold text-amber-700">CafeLi</span> creamos un espacio donde el mundo del café se encuentra en un solo lugar. Nuestra plataforma conecta a productores, vendedores y amantes del café, facilitando la compra y venta de granos, productos y servicios de alta calidad.
              </p>
              <p>
                Nuestro objetivo es ofrecer una experiencia sencilla, segura y accesible para descubrir nuevos sabores, apoyar a los caficultores locales y encontrar todo lo relacionado al barismo sin complicaciones.
              </p>
            </div>
            <div className="pt-6 border-t border-stone-200">
              <p className="text-sm font-bold text-amber-800 tracking-wider uppercase">
                CafeLi — Todo el café, en un solo lugar.
              </p>
            </div>
            <div className="flex flex-wrap gap-8 pt-4">
              <div>
                <p className="text-4xl font-black text-stone-950 font-serif">+50</p>
                <p className="text-sm text-stone-500 mt-1">Fincas aliadas</p>
              </div>
              <div>
                <p className="text-4xl font-black text-stone-950 font-serif">100%</p>
                <p className="text-sm text-stone-500 mt-1">Café colombiano</p>
              </div>
              <div>
                <p className="text-4xl font-black text-stone-950 font-serif">+5K</p>
                <p className="text-sm text-stone-500 mt-1">Amantes del café</p>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-amber-400/20 to-amber-700/20 rounded-[2rem] blur-2xl" />
              <img
                src={img6}
                alt="Nuestra finca cafetera"
                className="relative w-full h-[520px] object-cover rounded-3xl shadow-2xl -rotate-1 hover:rotate-0 transition-all duration-700 ease-out"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-xl border border-stone-100 hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-xl">
                    🏆
                  </div>
                  <div>
                    <p className="font-bold text-stone-950">Calidad Premium</p>
                    <p className="text-sm text-stone-500">Café de especialidad</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-white border-y border-stone-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-amber-800 bg-amber-100 rounded-full">
              Nuestros Pilares
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-stone-950 font-serif">
              Lo que nos define
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Cuatro valores que guían cada grano, cada taza y cada experiencia.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group p-8 bg-stone-50 hover:bg-white rounded-3xl border border-stone-100 hover:border-amber-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-5">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white text-2xl shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform duration-300">
                🎯
              </div>
              <h3 className="text-xl font-bold text-stone-950 font-serif">Misión</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Conectar caficultores colombianos con amantes del café del mundo, ofreciendo productos de calidad excepcional y experiencias auténticas.
              </p>
            </div>

            <div className="group p-8 bg-stone-50 hover:bg-white rounded-3xl border border-stone-100 hover:border-amber-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-5">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-600 to-stone-700 text-white text-2xl shadow-lg shadow-stone-500/25 group-hover:scale-110 transition-transform duration-300">
                🔭
              </div>
              <h3 className="text-xl font-bold text-stone-950 font-serif">Visión</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Ser la plataforma líder en Latinoamérica para la comercialización y disfrute del café de especialidad, con impacto social positivo.
              </p>
            </div>

            <div className="group p-8 bg-stone-50 hover:bg-white rounded-3xl border border-stone-100 hover:border-amber-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-5">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-2xl shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300">
                💎
              </div>
              <h3 className="text-xl font-bold text-stone-950 font-serif">Calidad</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Cada grano es seleccionado manualmente y probado en cataciones rigurosas para asegurar solo lo mejor llega a tu taza.
              </p>
            </div>

            <div className="group p-8 bg-stone-50 hover:bg-white rounded-3xl border border-stone-100 hover:border-amber-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-5">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white text-2xl shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300">
                🌍
              </div>
              <h3 className="text-xl font-bold text-stone-950 font-serif">Sostenibilidad</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Prácticas agrícolas responsables, comercio justo y compromiso ambiental en cada paso de nuestra cadena de valor.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-amber-800 bg-amber-100 rounded-full">
              Detrás del Café
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-stone-950 font-serif">
              Nuestro Equipo y Fincas
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Personas apasionadas que hacen posible la magia en cada taza.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="group bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
              <div className="relative overflow-hidden">
                <img
                  src={img3}
                  alt="Nuestro Barista"
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-white bg-amber-600 rounded-full mb-3">
                    Barismo
                  </span>
                  <h3 className="text-2xl font-bold text-white font-serif">Nuestro Barista</h3>
                </div>
              </div>
              <div className="p-8 space-y-3">
                <p className="text-stone-600 leading-relaxed">
                  Con más de 10 años de experiencia en el arte del espresso y el latte art, nuestro barista certificado crea obras de arte en cada taza, cuidando cada detalle desde la molienda hasta el servir.
                </p>
                <div className="flex gap-2 pt-2">
                  <span className="px-3 py-1 text-xs font-semibold text-amber-800 bg-amber-50 rounded-full">SCA Certificado</span>
                  <span className="px-3 py-1 text-xs font-semibold text-amber-800 bg-amber-50 rounded-full">Latte Art Pro</span>
                </div>
              </div>
            </div>

            <div className="group bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
              <div className="relative overflow-hidden">
                <img
                  src={img7}
                  alt="Nuestro Maestro Tostador"
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-white bg-stone-700 rounded-full mb-3">
                    Tostión
                  </span>
                  <h3 className="text-2xl font-bold text-white font-serif">Nuestro Maestro Tostador</h3>
                </div>
              </div>
              <div className="p-8 space-y-3">
                <p className="text-stone-600 leading-relaxed">
                  Tres generaciones de conocimiento cafetero. Nuestro maestro tostador domina los perfiles de tueste lento para resaltar las notas frutales, chocolatosas y florales de cada origen.
                </p>
                <div className="flex gap-2 pt-2">
                  <span className="px-3 py-1 text-xs font-semibold text-amber-800 bg-amber-50 rounded-full">Tueste Artesanal</span>
                  <span className="px-3 py-1 text-xs font-semibold text-amber-800 bg-amber-50 rounded-full">Q Grader</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-stone-900 to-stone-950" />
        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold text-white font-serif leading-tight">
            Conoce más sobre nuestro{' '}
            <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              mundo cafetero
            </span>
          </h2>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto">
            Escríbenos y te contamos todo sobre nuestros orígenes, procesos y cataciones exclusivas.
          </p>
          <div className="pt-4">
            <Link
              to="/contacto"
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-bold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-2xl shadow-2xl shadow-amber-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              Escríbenos
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
