import React from 'react';

export const AboutUs = () => {
  return (
    <section className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gray-50 dark:bg-zinc-950 py-16 px-6">
      <div className="max-w-3xl w-full bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800 text-center space-y-6">
        <span className="inline-block px-3.5 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/40 rounded-full">
          Nuestra Historia
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Sobre nosotros
        </h2>
        <div className="space-y-4 text-zinc-600 dark:text-zinc-400 text-base md:text-lg leading-relaxed">
          <p>
            En <span className="font-semibold text-amber-600 dark:text-amber-500">CafeLi</span> creamos un espacio donde el mundo del café se encuentra en un solo lugar. Nuestra plataforma conecta a productores, vendedores y amantes del café, facilitando la compra y venta de granos, productos y servicios de alta calidad.
          </p>
          <p>
            Nuestro objetivo es ofrecer una experiencia sencilla, segura y accesible para descubrir nuevos sabores, apoyar a los caficultores locales y encontrar todo lo relacionado al barismo sin complicaciones.
          </p>
        </div>
        <div className="pt-6 border-t border-gray-100 dark:border-zinc-800">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-500 tracking-wider uppercase">
            CafeLi — Todo el café, en un solo lugar.
          </p>
        </div>
      </div>
    </section>
  );
};
