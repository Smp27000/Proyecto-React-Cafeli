import React, { useState } from "react";

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
      const res = await fetch("http://localhost:3000/api/v1/pedidos", {
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        
        {/* Header */}
        <div className="p-5 border-b border-amber-100 bg-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">☕</span>
            <h2 className="text-xl font-bold tracking-tight">Tu Carrito de Café</h2>
            <span className="bg-amber-600 text-xs px-2 py-0.5 rounded-full font-semibold">
              {totalArticulos} {totalArticulos === 1 ? "ítem" : "ítems"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-amber-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-left">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {errorMsg}
            </div>
          )}

          {!isCheckingOut ? (
            <>
              {items.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="text-6xl">🫘</div>
                  <h3 className="text-lg font-bold text-amber-950">Tu carrito está vacío</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">
                    Explora nuestra selección de granos de café de alta montaña y agrégalos a tu orden.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100 shadow-xs"
                    >
                      {item.producto?.imagen_url ? (
                        <img
                          src={item.producto.imagen_url}
                          alt={item.producto.nombre}
                          className="w-16 h-16 object-cover rounded-lg shadow-xs"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-amber-200 text-amber-900 flex items-center justify-center rounded-lg text-2xl">
                          ☕
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-amber-950 text-sm truncate">
                          {item.producto?.nombre}
                        </h4>
                        <p className="text-xs text-amber-800">
                          ${Number(item.producto?.precio || 0).toLocaleString()} c/u
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="flex items-center border border-amber-200 rounded-md bg-white">
                            <button
                              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.cantidad - 1))}
                              className="px-2 py-0.5 text-xs text-amber-900 font-bold hover:bg-amber-100"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-semibold text-gray-800">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.cantidad + 1)}
                              className="px-2 py-0.5 text-xs text-amber-900 font-bold hover:bg-amber-100"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-xs font-bold text-amber-950 ml-auto">
                            ${Number(item.subtotal || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-gray-400 hover:text-red-600 p-1 transition-colors text-sm"
                        title="Eliminar producto"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}

                  <div className="pt-2 flex justify-between items-center text-xs">
                    <button
                      onClick={onClearCart}
                      className="text-red-600 hover:underline font-medium"
                    >
                      Vaciar todo el carrito
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="font-bold text-amber-950">Datos de Entrega</h3>
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="text-xs text-amber-700 hover:underline"
                >
                  ← Volver al carrito
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Dirección de Entrega *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Calle 10 # 4-20, Apto 302"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  type="tel"
                  placeholder="Ej. 3001234567"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Método de Pago
                </label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:outline-none"
                >
                  <option value="Contraentrega">Pago Contraentrega (Efectivo/Datáfono)</option>
                  <option value="Transferencia Bancolombia/Nequi">Transferencia Bancolombia / Nequi</option>
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito / Débito</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Instrucciones o Notas Especiales
                </label>
                <textarea
                  rows="2"
                  placeholder="Ej. Molienda para prensa francesa, o dejar en portería."
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:outline-none"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p><strong>Despacho garantizado:</strong> Grano recién tostado empacado en bolsa con válvula desgasificadora.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-md transition-colors text-sm disabled:opacity-50"
              >
                {loading ? "Procesando pedido..." : `Confirmar y Pagar $${Number(totalPrecio).toLocaleString()}`}
              </button>
            </form>
          )}
        </div>

        {/* Footer actions */}
        {!isCheckingOut && items.length > 0 && (
          <div className="p-5 border-t border-amber-100 bg-amber-50/50 space-y-3 text-left">
            <div className="flex justify-between items-center text-sm font-semibold text-gray-600">
              <span>Subtotal:</span>
              <span>${Number(totalPrecio).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-extrabold text-amber-950">
              <span>Total:</span>
              <span>${Number(totalPrecio).toLocaleString()} COP</span>
            </div>

            <button
              onClick={() => setIsCheckingOut(true)}
              className="w-full py-3 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center space-x-2"
            >
              <span>Proceder al Checkout</span>
              <span>→</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
