import React from "react";

export function WhatsAppButton() {
  const phoneNumber = "573000000000"; // Reemplaza con el número de contacto de la empresa
  const message = "Hola! Quisiera obtener información sobre sus productos y servicios.";
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-55 bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
      aria-label="Contactar por WhatsApp"
    >
      <svg
        className="w-8 h-8 fill-current"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.593 1.981 14.125.955 11.5.954c-5.448 0-9.87 4.372-9.874 9.802-.001 1.716.463 3.39 1.34 4.877l-1.02 3.725 3.812-1.004zM17.8 14.56c-.324-.162-1.92-.949-2.217-1.058-.297-.108-.513-.162-.73.162-.216.324-.838 1.058-1.027 1.274-.19.216-.378.243-.702.081-.324-.162-1.372-.505-2.613-1.611-.966-.862-1.617-1.927-1.806-2.251-.19-.324-.02-.5-.182-.661-.147-.146-.324-.378-.486-.568-.162-.19-.216-.324-.324-.54-.108-.216-.054-.405-.027-.568.027-.162.216-.513.324-.756.108-.243.162-.405.243-.567.081-.162.04-.324-.02-.486-.06-.162-.513-1.243-.703-1.702-.185-.446-.37-.386-.513-.393-.132-.006-.284-.007-.436-.007-.152 0-.401.057-.611.284-.21.228-.8.784-.8 1.913 0 1.129.82 2.217.933 2.37.113.153 1.613 2.463 3.91 3.455.546.236.973.377 1.305.483.55.174 1.05.15 1.446.09.44-.067 1.92-.784 2.19-1.54.27-.756.27-1.405.19-1.54-.08-.135-.297-.216-.621-.378z" />
      </svg>
      {/* Tooltip */}
      <span className="absolute right-16 scale-0 transition-all rounded bg-zinc-800 p-2 text-xs text-white group-hover:scale-100 whitespace-nowrap">
        ¿Necesitas ayuda? Escríbenos
      </span>
    </a>
  );
}
