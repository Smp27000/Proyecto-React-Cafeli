import React, { useState, useEffect, useRef } from "react";

const API_BASE = "http://localhost:3000/api/v1";

export function ChatbotWidget() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [entrada, setEntrada] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const scrollRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    let sid = localStorage.getItem("cafeli_chat_session");
    if (!sid) {
      sid = "sess-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
      localStorage.setItem("cafeli_chat_session", sid);
    }
    setSessionId(sid);
    const historial = localStorage.getItem("cafeli_chat_historial_" + sid);
    if (historial) {
      try { setMensajes(JSON.parse(historial)); } catch { /* ignore */ }
    } else {
      const bienvenida = {
        remitente: "Bot",
        contenido: "¡Hola! 👋 Soy Cafélito, el asistente virtual de CafeLi.\n\nPuedo ayudarte con:\n☕ Catálogo de cafés\n💰 Precios y disponibilidad\n📦 Información de pedidos\n📝 Registrar PQR\n🌐 Horarios y ubicación\n\n¿En qué puedo ayudarte hoy?",
      };
      setMensajes([bienvenida]);
    }
  }, []);

  useEffect(() => {
    if (sessionId) localStorage.setItem("cafeli_chat_historial_" + sessionId, JSON.stringify(mensajes));
  }, [mensajes, sessionId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [mensajes, abierto, escribiendo]);

  const enviar = async () => {
    const texto = entrada.trim();
    if (!texto || escribiendo) return;
    const nuevo = [...mensajes, { remitente: "Usuario", contenido: texto }];
    setMensajes(nuevo);
    setEntrada("");
    setEscribiendo(true);
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/chatbot/mensaje`, {
        method: "POST",
        headers,
        body: JSON.stringify({ session_id: sessionId, contenido: texto, mensaje: texto }),
      });
      const data = await res.json();
      if (data.success) {
        setMensajes(m => [...m, { remitente: "Bot", contenido: data.respuesta, fecha_envio: data.fecha_envio }]);
      } else {
        throw new Error(data.message || "No hubo respuesta");
      }
    } catch (err) {
      setMensajes(m => [...m, { remitente: "Bot", contenido: "⚠️ Lo siento, en este momento no puedo responder. Por favor intenta más tarde o contáctanos al WhatsApp." }]);
    } finally {
      setEscribiendo(false);
    }
  };

  const sugerencias = [
    "¿Qué cafés tienen?",
    "Precios de productos",
    "Tiempos de envío",
    "Métodos de pago",
    "Servicios de barismo",
    "¿Cómo hacer un PQR?",
    "Horarios y ubicación",
    "Café Geisha",
  ];

  return (
    <>
      <div className="fixed z-[55] left-5 bottom-5 group">
        <button
          onClick={() => setAbierto(!abierto)}
          className="relative block"
          aria-label="Abrir chatbot Cafélito"
        >
          <div className="absolute inset-0 rounded-full bg-amber-600/40 blur-xl scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {!abierto && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-40 animate-ping" />
          )}
          <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-800 via-coffee-800 to-stone-900 text-white shadow-2xl-coffee ring-4 ring-white/80 transition-all duration-300 hover:scale-110 hover:-translate-y-1 overflow-hidden flex items-center justify-center ${abierto ? "rotate-180" : ""}`}>
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            {abierto ? (
              <svg className="w-7 h-7 relative z-10 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-8 h-8 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <circle cx="9" cy="10" r="1" fill="currentColor" />
                <circle cx="13" cy="10" r="1" fill="currentColor" />
                <circle cx="17" cy="10" r="1" fill="currentColor" />
              </svg>
            )}
          </div>
        </button>
      </div>

      {abierto && (
        <div className="fixed z-[55] left-5 bottom-24 w-[calc(100vw-40px)] sm:w-[420px] h-[620px] max-h-[80vh] bg-white rounded-3xl shadow-2xl-coffee flex flex-col overflow-hidden animate-fade-up border border-coffee-100">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-coffee-600 to-amber-500" />

          <div className="relative bg-gradient-to-r from-stone-900 via-coffee-900 to-stone-900 text-white p-4 flex items-center space-x-3 border-b border-coffee-700/50">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-coffee-500 via-amber-600 to-coffee-900 flex items-center justify-center text-2xl shadow-xl ring-2 ring-amber-400/30 overflow-hidden">
                <span className="drop-shadow-md">🤖</span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 ring-2 ring-stone-900"></span>
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="font-extrabold font-serif text-lg bg-gradient-to-r from-amber-100 to-amber-300 bg-clip-text text-transparent">Cafélito</p>
              </div>
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] text-amber-200/80">Asistente virtual CafeLi</p>
                <span className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  En línea
                </span>
              </div>
            </div>
            <button onClick={() => {
              if (confirm("¿Cerrar y borrar historial de chat?")) {
                localStorage.removeItem("cafeli_chat_historial_" + sessionId);
                localStorage.removeItem("cafeli_chat_session");
                setMensajes([]);
                setSessionId("");
                setTimeout(() => {
                  const sid = "sess-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
                  localStorage.setItem("cafeli_chat_session", sid);
                  setSessionId(sid);
                  setMensajes([{ remitente: "Bot", contenido: "¡Hola! 👋 Soy Cafélito. ¿En qué puedo ayudarte hoy?" }]);
                }, 100);
              }
            }} className="group text-white/50 hover:text-white px-2.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 flex items-center gap-1" title="Reiniciar chat">
              <svg className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-coffee-50/80 via-amber-50/40 to-white">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex animate-fade-up ${m.remitente === "Usuario" ? "justify-end" : "justify-start"}`} style={{animationDelay: `${i * 30}ms`}}>
                {m.remitente !== "Usuario" && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-coffee-500 to-coffee-800 flex items-center justify-center text-xs mr-2 mt-1 shrink-0 shadow-md">
                    🤖
                  </div>
                )}
                <div className={`relative max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-md-coffee ${
                  m.remitente === "Usuario"
                    ? "bg-gradient-to-br from-coffee-700 via-coffee-800 to-stone-900 text-white rounded-br-sm mr-2"
                    : "bg-gradient-to-br from-white to-coffee-50 border border-coffee-100 text-stone-800 rounded-bl-sm"
                }`}>
                  {m.remitente !== "Usuario" && (
                    <div className="absolute left-0 top-4 -translate-x-full pr-1">
                      <div className="w-0 h-0 border-y-4 border-y-transparent border-r-[6px] border-r-white" />
                    </div>
                  )}
                  {m.remitente === "Usuario" && (
                    <div className="absolute right-0 top-4 translate-x-full pl-1">
                      <div className="w-0 h-0 border-y-4 border-y-transparent border-l-[6px] border-l-stone-900" />
                    </div>
                  )}
                  {m.remitente !== "Usuario" && <p className="text-[10px] font-bold text-coffee-600 mb-1.5 uppercase tracking-wide">Cafélito</p>}
                  {m.contenido}
                </div>
              </div>
            ))}
            {escribiendo && (
              <div className="flex justify-start animate-fade-up">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-coffee-500 to-coffee-800 flex items-center justify-center text-xs mr-2 mt-1 shrink-0 shadow-md">
                  🤖
                </div>
                <div className="relative bg-gradient-to-br from-white to-coffee-50 border border-coffee-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-md-coffee">
                  <div className="absolute left-0 top-4 -translate-x-full pr-1">
                    <div className="w-0 h-0 border-y-4 border-y-transparent border-r-[6px] border-r-white" />
                  </div>
                  <div className="flex space-x-1.5 items-center h-5">
                    <span className="w-2 h-2 bg-gradient-to-br from-coffee-500 to-coffee-700 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gradient-to-br from-coffee-500 to-coffee-700 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gradient-to-br from-coffee-500 to-coffee-700 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {mensajes.length <= 2 && (
            <div className="px-4 pb-3 pt-1 flex flex-wrap gap-2 bg-gradient-to-t from-coffee-50/50 to-transparent">
              {sugerencias.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setEntrada(s); setTimeout(enviar, 50); }}
                  className="group text-xs bg-white hover:bg-gradient-to-br hover:from-amber-50 hover:to-coffee-50 text-coffee-800 px-3 py-1.5 rounded-full border-2 border-coffee-200 hover:border-coffee-400 font-semibold transition-all duration-200 hover:shadow-md-coffee hover:-translate-y-0.5 animate-fade-up"
                  style={{animationDelay: `${100 + i * 50}ms`}}
                >
                  <span className="mr-1">💡</span>
                  {s}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); enviar(); }} className="p-4 border-t border-coffee-100 bg-gradient-to-b from-white to-coffee-50/30 flex gap-2.5">
            <div className="flex-1 relative">
              <input
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                placeholder="Escribe tu mensaje a Cafélito..."
                className="w-full text-sm px-4 py-3.5 rounded-2xl border-2 border-coffee-200 bg-white shadow-inner focus:ring-2 focus:ring-coffee-500/30 focus:border-coffee-500 focus:outline-none transition-all duration-200 placeholder:text-coffee-400 text-coffee-900"
              />
            </div>
            <button
              type="submit"
              disabled={escribiendo || !entrada.trim()}
              className="group relative bg-gradient-to-r from-coffee-700 via-amber-700 to-coffee-900 hover:from-coffee-800 hover:via-amber-800 hover:to-stone-900 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-4 rounded-2xl text-sm transition-all duration-300 shadow-lg-coffee hover:shadow-xl-coffee hover:-translate-y-0.5 flex items-center justify-center overflow-hidden min-w-[52px]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <svg className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
