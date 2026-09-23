import React, { useState } from "react";
import { API_BASE } from "../config";

export function CartDrawer({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, onClearCart, onCheckoutSuccess }) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [metodoPago, setMetodoPago] = useState("Contraentrega");
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const items = cart?.items || [];
  const totalPrecio = cart?.total_precio || 0;
  const totalArticulos = cart?.total_articulos || 0;

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!direccion.trim()) {
      setErrorMsg("Por favor ingresa la dirección de entrega.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/pedidos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          direccion_envio: direccion,
          telefono_contacto: telefono,
          metodo_pago: metodoPago,
          notas: notas,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.detail || "Error al procesar el pedido.");
      }

      alert("🎉 ¡Pedido realizado con éxito! Tu café de especialidad está en camino.");
      setIsCheckingOut(false);
      if (onCheckoutSuccess) onCheckoutSuccess(data.pedido);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden bg-stone-950/70 backdrop-blur-soft flex justify-end animate-fade-in">
      <div className="w-full max-w-md bg-gradient-to-b from-white to-coffee-50/30 h-full shadow-2xl-coffee flex flex-col justify-between overflow-hidden animate-fade-up border-l border-coffee-200/50">

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-coffee-950 via-coffee-900 to-stone-900" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-coffee-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

          <div className="relative p-6 text-white flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-coffee-600 to-coffee-800 flex items-center justify-center shadow-xl ring-2 ring-amber-400/30 overflow-hidden">
                  <svg className="w-7 h-7 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                {totalArticulos > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-amber-400 to-orange-500 text-coffee-950 text-[11px] font-black min-w-[26px] h-[26px] px-1.5 rounded-full flex items-center justify-center shadow-lg ring-2 ring-coffee-900">
                    {totalArticulos > 99 ? '99+' : totalArticulos}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-black font-serif leading-tight bg-gradient-to-r from-amber-100 to-white bg-clip-text text-transparent">Tu Carrito</h2>
                <p className="text-xs text-amber-200/80 font-medium mt-1">
                  {totalArticulos === 0 ? "Aún no hay productos" : `${totalArticulos} ${totalArticulos === 1 ? "producto seleccionado" : "productos seleccionados"}`}
                </p>
                {items.length > 0 && (
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30">
                    <span className="text-xs font-extrabold text-amber-200">Subtotal</span>
                    <span className="text-sm font-black text-amber-100">${Number(totalPrecio).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="group text-amber-200/70 hover:text-white p-2.5 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:scale-110"
              aria-label="Cerrar carrito"
            >
              <svg className="w-6 h-6 transition-transform group-hover:rotate-90 duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-4 text-left">
          {errorMsg && (
            <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 text-red-800 text-sm rounded-2xl shadow-md-coffee animate-fade-up flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-bold">Lo sentimos</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {!isCheckingOut ? (
            <>
              {items.length === 0 ? (
                <div className="text-center py-20 space-y-6 animate-fade-up">
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-coffee-200 to-amber-100 opacity-60 animate-pulse" />
                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-coffee-100 to-white border-2 border-coffee-200 flex items-center justify-center shadow-xl-coffee">
                      <span className="text-6xl">☕</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black font-serif text-coffee-950">Tu carrito está vacío</h3>
                    <p className="text-sm text-coffee-600 max-w-xs mx-auto leading-relaxed">
                      Explora nuestra selección de granos de café de alta montaña y agrégalos a tu orden.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="group relative inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-coffee-700 via-amber-700 to-coffee-900 hover:from-coffee-800 hover:via-amber-800 hover:to-stone-900 rounded-2xl shadow-xl-coffee hover:shadow-2xl-coffee hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <svg className="w-4 h-4 relative z-10 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="relative z-10">Ir a explorar cafés</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="relative group flex items-center gap-4 p-4 bg-gradient-to-br from-white to-coffee-50/60 rounded-3xl border-2 border-coffee-100/80 shadow-md-coffee hover:shadow-xl-coffee hover:-translate-y-0.5 transition-all duration-300 animate-fade-up"
                      style={{animationDelay: `${idx * 50}ms`}}
                    >
                      {item.producto?.imagen_url ? (
                        <div className="relative shrink-0">
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/20 to-transparent blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <img
                            src={item.producto.imagen_url}
                            alt={item.producto.nombre}
                            className="relative w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl shadow-lg ring-2 ring-white"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-coffee-200 via-amber-100 to-coffee-100 text-coffee-700 flex items-center justify-center rounded-2xl shadow-lg ring-2 ring-white shrink-0">
                          <span className="text-3xl">☕</span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-coffee-950 text-sm truncate">
                          {item.producto?.nombre}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-xl bg-gradient-to-r from-amber-100 to-coffee-100 text-xs font-bold text-coffee-800 border border-coffee-200/60">
                            ${Number(item.producto?.precio || 0).toLocaleString()}
                            <span className="text-coffee-600 font-normal ml-0.5">c/u</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3 gap-3">
                          <div className="flex items-center bg-gradient-to-r from-white to-coffee-50 border-2 border-coffee-200 rounded-full overflow-hidden shadow-sm-coffee">
                            <button
                              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.cantidad - 1))}
                              className="group w-9 h-9 flex items-center justify-center text-coffee-700 font-black hover:bg-gradient-to-br hover:from-coffee-100 hover:to-amber-50 hover:text-coffee-900 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={item.cantidad <= 1}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="min-w-[36px] text-center text-sm font-extrabold text-coffee-900 px-2 select-none">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.cantidad + 1)}
                              className="group w-9 h-9 flex items-center justify-center text-coffee-700 font-black hover:bg-gradient-to-br hover:from-coffee-100 hover:to-amber-50 hover:text-coffee-900 transition-all duration-200 hover:scale-110"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                          <span className="text-sm font-black text-coffee-950 bg-gradient-to-r from-amber-600 to-coffee-700 bg-clip-text text-transparent px-2">
                            ${Number(item.subtotal || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="absolute top-3 right-3 text-coffee-300 hover:text-red-500 p-1.5 rounded-xl hover:bg-red-50 transition-all duration-200 hover:scale-110 group/remove"
                        title="Eliminar producto"
                      >
                        <svg className="w-4.5 h-4.5 transition-transform group-hover/remove:rotate-90 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  <div className="pt-3 flex justify-between items-center animate-fade-up">
                    <button
                      onClick={onClearCart}
                      className="group inline-flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-white bg-red-50 hover:bg-gradient-to-br hover:from-red-500 hover:to-red-700 border-2 border-red-200 hover:border-red-500 px-4 py-2 rounded-2xl transition-all duration-300 shadow-sm-coffee hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <svg className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Vaciar carrito
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleCheckoutSubmit} className="space-y-5 animate-fade-up">
              <div className="flex items-center justify-between pb-4 border-b-2 border-coffee-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-coffee-500 to-coffee-800 flex items-center justify-center text-white shadow-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-black text-coffee-950 text-lg font-serif">Datos de Entrega</h3>
                    <p className="text-xs text-coffee-600">Completa la información</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="group inline-flex items-center gap-1 text-xs font-bold text-coffee-700 hover:text-coffee-950 bg-coffee-50 hover:bg-coffee-100 px-3 py-2 rounded-xl border border-coffee-200 hover:border-coffee-300 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Volver
                </button>
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-1.5 text-xs font-bold text-coffee-800 mb-1.5">
                  <svg className="w-3.5 h-3.5 text-coffee-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Dirección de Entrega <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Calle 10 # 4-20, Apto 302"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full text-sm px-4 py-3.5 border-2 border-coffee-200 rounded-2xl bg-white focus:ring-2 focus:ring-coffee-500/30 focus:border-coffee-500 focus:outline-none transition-all duration-200 placeholder:text-coffee-300 text-coffee-900 shadow-inner"
                />
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-1.5 text-xs font-bold text-coffee-800 mb-1.5">
                  <svg className="w-3.5 h-3.5 text-coffee-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Teléfono de Contacto
                </label>
                <input
                  type="tel"
                  placeholder="Ej. 3001234567"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full text-sm px-4 py-3.5 border-2 border-coffee-200 rounded-2xl bg-white focus:ring-2 focus:ring-coffee-500/30 focus:border-coffee-500 focus:outline-none transition-all duration-200 placeholder:text-coffee-300 text-coffee-900 shadow-inner"
                />
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-1.5 text-xs font-bold text-coffee-800 mb-1.5">
                  <svg className="w-3.5 h-3.5 text-coffee-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Método de Pago
                </label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full text-sm px-4 py-3.5 border-2 border-coffee-200 rounded-2xl bg-white focus:ring-2 focus:ring-coffee-500/30 focus:border-coffee-500 focus:outline-none transition-all duration-200 text-coffee-900 shadow-inner appearance-none cursor-pointer"
                >
                  <option value="Contraentrega">💵 Pago Contraentrega (Efectivo/Datáfono)</option>
                  <option value="Transferencia Bancolombia/Nequi">💰 Transferencia Bancolombia / Nequi</option>
                  <option value="Tarjeta de Crédito">💳 Tarjeta de Crédito / Débito</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-1.5 text-xs font-bold text-coffee-800 mb-1.5">
                  <svg className="w-3.5 h-3.5 text-coffee-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Instrucciones o Notas Especiales
                </label>
                <textarea
                  rows="3"
                  placeholder="Ej. Molienda para prensa francesa, o dejar en portería."
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="w-full text-sm px-4 py-3.5 border-2 border-coffee-200 rounded-2xl bg-white focus:ring-2 focus:ring-coffee-500/30 focus:border-coffee-500 focus:outline-none transition-all duration-200 placeholder:text-coffee-300 text-coffee-900 shadow-inner resize-none"
                />
              </div>

              <div className="bg-gradient-to-r from-amber-50 via-coffee-50 to-amber-50 p-4 rounded-3xl border-2 border-amber-200/80 text-xs text-coffee-800 space-y-2 shadow-md-coffee">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shrink-0 shadow-md">
                    ✦
                  </div>
                  <div>
                    <p className="font-black text-coffee-900 text-sm">Despacho garantizado</p>
                    <p className="text-coffee-700 leading-relaxed">
                      Grano recién tostado empacado en bolsa con válvula desgasificadora para máxima frescura.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full py-4 bg-gradient-to-r from-coffee-700 via-amber-700 to-coffee-900 hover:from-coffee-800 hover:via-amber-800 hover:to-stone-900 text-white font-black rounded-2xl shadow-xl-coffee hover:shadow-2xl-coffee hover:-translate-y-1 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden flex items-center justify-center gap-2.5 text-base"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="relative z-10">
                  {loading ? "Procesando pedido..." : `Confirmar y Pagar $${Number(totalPrecio).toLocaleString()}`}
                </span>
              </button>
            </form>
          )}
        </div>

        {!isCheckingOut && items.length > 0 && (
          <div className="p-5 sm:p-6 border-t-2 border-coffee-200/60 bg-gradient-to-t from-white via-coffee-50/70 to-amber-50/30 space-y-4 text-left shadow-[0_-10px_40px_-15px_rgba(111,78,55,0.15)]">
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-sm text-coffee-600 font-semibold">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Subtotal ({totalArticulos} ítems):
                </span>
                <span>${Number(totalPrecio).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-coffee-600 font-semibold">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Envío:
                </span>
                <span className="text-green-600 font-bold">✓ Gratis</span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-coffee-950 via-coffee-800 to-stone-900 p-5 shadow-xl-coffee">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
              <div className="relative flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-300/80">Total a pagar</p>
                  <p className="text-[11px] text-amber-200/60 font-medium mt-0.5">Incluye IVA</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black font-serif bg-gradient-to-r from-amber-200 to-white bg-clip-text text-transparent leading-none">
                    ${Number(totalPrecio).toLocaleString()}
                  </p>
                  <p className="text-xs text-amber-200/70 font-bold mt-1">COP</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsCheckingOut(true)}
              className="group relative w-full py-4 bg-gradient-to-r from-coffee-700 via-amber-700 to-coffee-900 hover:from-coffee-800 hover:via-amber-800 hover:to-stone-900 text-white font-black rounded-2xl shadow-xl-coffee hover:shadow-2xl-coffee hover:-translate-y-1 transition-all duration-300 overflow-hidden flex items-center justify-center gap-2.5 text-base"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <svg className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="relative z-10">Proceder al Checkout</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
