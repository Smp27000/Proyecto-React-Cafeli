import React from "react";

export const Contact = () => {
  return (
    <section className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gray-50 dark:bg-zinc-950 py-16 px-6">
      <div className="max-w-xl w-full bg-white dark:bg-zinc-900 p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800 text-center space-y-6">
        <span className="inline-block px-3.5 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/40 rounded-full">
          ¿Tienes preguntas?
        </span>
        <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Ponte en contacto
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base">
          Estamos aquí para ayudarte. Escríbenos a través de cualquiera de nuestros canales oficiales.
        </p>

        <div className="space-y-4 pt-4">
          {/* Email */}
          <div className="flex items-center justify-center space-x-3 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800">
            <span className="text-xl">📧</span>
            <div className="text-left">
              <p className="text-xs font-semibold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Correo Electrónico</p>
              <a href="mailto:contacto@cafeli.com" className="text-sm font-medium text-amber-600 hover:text-amber-700 dark:hover:text-amber-500 transition-colors">
                contacto@cafeli.com
              </a>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="flex items-center justify-center space-x-3 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800">
            <span className="text-xl">💬</span>
            <div className="text-left">
              <p className="text-xs font-semibold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Línea WhatsApp</p>
              <a href="https://wa.me/573000000000" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-amber-600 hover:text-amber-700 dark:hover:text-amber-500 transition-colors">
                +57 300 000 0000
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
