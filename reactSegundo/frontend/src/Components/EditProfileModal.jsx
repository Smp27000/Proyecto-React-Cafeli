import React, { useState, useEffect } from "react";
import { API_BASE } from "../config";

export function EditProfileModal({ isOpen, onClose, user, onUserUpdated }) {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    current_password: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        nombres: user.nombres || "",
        apellidos: user.apellidos || "",
        email: user.email || "",
        telefono: user.telefono || "",
        current_password: "",
        password: "",
      });
      setError("");
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.nombres.trim() || !formData.apellidos.trim() || !formData.email.trim()) {
      setError("Nombre, apellidos y correo son requeridos.");
      return;
    }

    if (formData.password && !formData.current_password) {
      setError("Debes ingresar tu contraseña actual para cambiarla.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    const payload = {
      nombres: formData.nombres.trim(),
      apellidos: formData.apellidos.trim(),
      email: formData.email.trim(),
      telefono: formData.telefono ? formData.telefono.trim() : "",
    };

    if (formData.password) {
      payload.password = formData.password;
      payload.current_password = formData.current_password;
    }

    try {
      const res = await fetch(`${API_BASE}/usuarios/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.detail || data.message || "Error al actualizar perfil.");
      }

      const updatedUser = {
        ...user,
        ...data.usuario,
      };

      localStorage.setItem("usuario", JSON.stringify(updatedUser));
      if (onUserUpdated) onUserUpdated(updatedUser);

      alert("✨ ¡Tus datos se han actualizado correctamente!");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-left">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-100 animate-fade-up">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center text-lg">✏️</span>
            <div>
              <h2 className="text-xl font-bold text-stone-900 font-serif">Editar Mis Datos</h2>
              <p className="text-[11px] text-stone-500">Actualiza tu información personal</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 font-bold p-1">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-semibold">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 mb-1">Nombres *</label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                required
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
              />
            </div>
            <div>
              <label className="block text-stone-700 mb-1">Apellidos *</label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-700 mb-1">Correo Electrónico *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
            />
          </div>

          <div>
            <label className="block text-stone-700 mb-1">Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Ej: 3001234567"
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
            />
          </div>

          <div className="pt-2 border-t border-stone-100 space-y-3">
            <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Cambio de Contraseña (Opcional)</p>
            <div>
              <label className="block text-stone-700 mb-1">Contraseña Actual</label>
              <input
                type="password"
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
                placeholder="Requerida para cambiar la contraseña"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
              />
            </div>

            <div>
              <label className="block text-stone-700 mb-1">Nueva Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres (dejar en blanco para conservar actual)"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
