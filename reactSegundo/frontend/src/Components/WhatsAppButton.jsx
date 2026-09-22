import React from "react";

export function WhatsAppButton() {
  const phoneNumber = "573000000000";
  const message = "Hola! Quisiera obtener información sobre sus productos y servicios.";
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-[60] group">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block animate-ring-pulse"
        aria-label="Contactar por WhatsApp"
      >
        <div className="absolute inset-0 rounded-full bg-[#25D366]/30 blur-xl scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white p-3 shadow-2xl shadow-green-900/30 transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-[0_20px_40px_-8px_rgba(37,211,102,0.5)] ring-4 ring-white/80 flex items-center justify-center overflow-hidden">
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <svg
            className="w-9 h-9 fill-current relative z-10 drop-shadow-md"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.593 1.981 14.125.955 11.5.954c-5.448 0-9.87 4.372-9.874 9.802-.001 1.716.463 3.39 1.34 4.877l-1.02 3.725 3.812-1.004zM17.8 14.56c-.324-.162-1.92-.949-2.217-1.058-.297-.108-.513-.162-.73.162-.216.324-.838 1.058-1.027 1.274-.19.216-.378.243-.702.081-.324-.162-1.372-.505-2.613-1.611-.966-.862-1.617-1.927-1.806-2.251-.19-.324-.02-.5-.182-.661-.147-.146-.324-.378-.486-.568-.162-.19-.216-.324-.324-.54-.108-.216-.054-.405-.027-.568.027-.162.216-.513.324-.756.108-.243.162-.405.243-.567.081-.162.04-.324-.02-.486-.06-.162-.513-1.243-.703-1.702-.185-.446-.37-.386-.513-.393-.132-.006-.284-.007-.436-.007-.152 0-.401.057-.611.284-.21.228-.8.784-.8 1.913 0 1.129.82 2.217.933 2.37.113.153 1.613 2.463 3.91 3.455.546.236.973.377 1.305.483.55.174 1.05.15 1.446.09.44-.067 1.92-.784 2.19-1.54.27-.756.27-1.405.19-1.54-.08-.135-.297-.216-.621-.378z" />
          </svg>
        </div>
      </a>

      <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none">
        <div className="relative opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            ¿Necesitas ayuda? Escríbenos
          </div>
          <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-stone-800 rotate-45 border-r border-b border-white/10" />
        </div>
      </div>
    </div>
  );
}
