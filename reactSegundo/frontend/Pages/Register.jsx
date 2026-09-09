import { useState, useEffect } from "react";
import logo from '../src/img/cafeli_logo_fondo_blanco.png'

export function Register({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    tipoDocumento: "CC",
    numeroDocumento: "",
    direccion: "",
    telefono: "",
    email: "",
    password: "",
    confirmPassword: "",
    rolId: "2",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const validate = (name, value, currentFormData = formData) => {
    let error = "";
    switch (name) {
      case "nombre":
        if (!value.trim()) {
          error = "El nombre es obligatorio.";
        } else if (value.trim().length < 2) {
          error = "Mínimo 2 caracteres.";
        } else if (value.length > 50) {
          error = "Máximo 50 caracteres.";
        }
        break;
      case "apellido":
        if (!value.trim()) {
          error = "El apellido es obligatorio.";
        } else if (value.trim().length < 2) {
          error = "Mínimo 2 caracteres.";
        } else if (value.length > 50) {
          error = "Máximo 50 caracteres.";
        }
        break;
      case "tipoDocumento":
        if (!value) {
          error = "Debe seleccionar un tipo de documento.";
        }
        break;
      case "numeroDocumento":
        if (!value) {
          error = "El número de documento es obligatorio.";
        } else if (value.length < 5 || value.length > 15) {
          error = "Debe tener entre 5 y 15 dígitos.";
        }
        break;
      case "direccion":
        if (!value.trim()) {
          error = "La dirección es obligatoria.";
        } else if (value.trim().length < 5) {
          error = "Mínimo 5 caracteres.";
        } else if (value.length > 100) {
          error = "Máximo 100 caracteres.";
        }
        break;
      case "telefono":
        if (!value) {
          error = "El teléfono es obligatorio.";
        } else if (value.length < 7 || value.length > 10) {
          error = "Debe tener entre 7 y 10 dígitos.";
        }
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          error = "El correo electrónico es obligatorio.";
        } else if (!emailRegex.test(value)) {
          error = "Formato de correo electrónico inválido.";
        }
        break;
      case "password":
        if (!value) {
          error = "La contraseña es obligatoria.";
        } else if (value.length < 8) {
          error = "Mínimo 8 caracteres.";
        } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(value)) {
          error = "Debe contener al menos una letra y un número.";
        }
        break;
      case "confirmPassword":
        if (!value) {
          error = "Debe confirmar su contraseña.";
        } else if (value !== currentFormData.password) {
          error = "Las contraseñas no coinciden.";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let cleanValue = value;

    // Character restrictions and input length limits
    if (name === "nombre" || name === "apellido") {
      cleanValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
      if (cleanValue.length > 50) cleanValue = cleanValue.slice(0, 50);
    } else if (name === "numeroDocumento") {
      cleanValue = value.replace(/\D/g, "");
      if (cleanValue.length > 15) cleanValue = cleanValue.slice(0, 15);
    } else if (name === "telefono") {
      cleanValue = value.replace(/\D/g, "");
      if (cleanValue.length > 10) cleanValue = cleanValue.slice(0, 10);
    } else if (name === "direccion") {
      if (cleanValue.length > 100) cleanValue = cleanValue.slice(0, 100);
    } else if (name === "password" || name === "confirmPassword") {
      if (cleanValue.length > 30) cleanValue = cleanValue.slice(0, 30);
    }

    const updatedFormData = { ...formData, [name]: cleanValue };
    setFormData(updatedFormData);

    const fieldError = validate(name, cleanValue, updatedFormData);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));

    if (name === "password" && formData.confirmPassword) {
      const matchError = validate("confirmPassword", formData.confirmPassword, updatedFormData);
      setErrors((prev) => ({ ...prev, confirmPassword: matchError }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validate(name, formData[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  useEffect(() => {
    const newErrors = {};
    let formIsValid = true;

    Object.keys(formData).forEach((key) => {
      const err = validate(key, formData[key]);
      if (err) {
        newErrors[key] = err;
        formIsValid = false;
      }
    });

    setIsSubmitDisabled(!formIsValid);
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    const payload = {
      nombres: formData.nombre,
      apellidos: formData.apellido,
      tipo_documento: formData.tipoDocumento,
      numero_documento: formData.numeroDocumento,
      direccion: formData.direccion,
      telefono: formData.telefono,
      email: formData.email,
      password: formData.password,
      rol_id: parseInt(formData.rolId),
    };

    try {
      const res = await fetch("http://localhost:3000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error al registrar el usuario.");
      }

      alert("¡Registro de cliente exitoso! Ahora puedes iniciar sesión.");
      if (onClose) onClose();
    } catch (err) {
      alert("Error en el registro: " + err.message);
    }
  };

  const isModal = isOpen !== undefined;

  if (isModal && !isOpen) return null;

  const content = (
    <div className={`bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 w-full ${isModal ? "max-w-2xl max-h-[90vh] overflow-y-auto transform scale-100 transition-all duration-300 animate-in fade-in zoom-in-95 duration-200" : "max-w-2xl p-6"}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
        <img src={logo} alt="logo" className="h-24 w-auto object-contain mb-2"/>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Registrar Nueva Cuenta
        </h2>
        {isModal && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-650 dark:hover:text-white transition-colors duration-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ej. Juan"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-600 transition-colors duration-200 ${
                touched.nombre && errors.nombre
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-zinc-700"
              }`}
            />
            {touched.nombre && errors.nombre && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.nombre}</p>
            )}
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Apellido
            </label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ej. Pérez"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-600 transition-colors duration-200 ${
                touched.apellido && errors.apellido
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-zinc-700"
              }`}
            />
            {touched.apellido && errors.apellido && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.apellido}</p>
            )}
          </div>

          {/* Tipo de Documento */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Tipo de documento
            </label>
            <select
              name="tipoDocumento"
              value={formData.tipoDocumento}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-600 transition-colors duration-200"
            >
              <option value="CC">Cédula de Ciudadanía (CC)</option>
              <option value="TI">Tarjeta de Identidad (TI)</option>
              <option value="CE">Cédula de Extranjería (CE)</option>
              <option value="PA">Pasaporte (PA)</option>
            </select>
          </div>

          {/* Rol de Usuario */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Rol de usuario
            </label>
            <select
              name="rolId"
              value={formData.rolId}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-600 transition-colors duration-200"
            >
              <option value="2">Cliente (Usuario estándar)</option>
              <option value="1">Administrador</option>
              <option value="3">Empleado</option>
            </select>
          </div>

          {/* Número de Documento */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Número de documento
            </label>
            <input
              type="text"
              name="numeroDocumento"
              value={formData.numeroDocumento}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ej. 1098765432"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-600 transition-colors duration-200 ${
                touched.numeroDocumento && errors.numeroDocumento
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-zinc-700"
              }`}
            />
            {touched.numeroDocumento && errors.numeroDocumento && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.numeroDocumento}</p>
            )}
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Dirección
            </label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ej. Calle 45 # 12-34"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-600 transition-colors duration-200 ${
                touched.direccion && errors.direccion
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-zinc-700"
              }`}
            />
            {touched.direccion && errors.direccion && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.direccion}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Teléfono
            </label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ej. 3123456789"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-600 transition-colors duration-200 ${
                touched.telefono && errors.telefono
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-zinc-700"
              }`}
            />
            {touched.telefono && errors.telefono && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.telefono}</p>
            )}
          </div>

          {/* Correo electrónico */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="ejemplo@correo.com"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-600 transition-colors duration-200 ${
                touched.email && errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-zinc-700"
              }`}
            />
            {touched.email && errors.email && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="••••••••"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-600 transition-colors duration-200 ${
                touched.password && errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-zinc-700"
              }`}
            />
            {touched.password && errors.password && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.password}</p>
            )}
          </div>

          {/* Confirmación de Contraseña */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="••••••••"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-600 transition-colors duration-200 ${
                touched.confirmPassword && errors.confirmPassword
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-zinc-700"
              }`}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirmPassword}</p>
            )}
          </div>

        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
          {isModal && (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 dark:text-zinc-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-sm font-medium transition-colors duration-200"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors duration-200 ${
              isSubmitDisabled
                ? "bg-amber-600/50 cursor-not-allowed"
                : "bg-amber-600 hover:bg-amber-700 shadow-sm"
            }`}
          >
            Registrarse
          </button>
        </div>

      </form>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
        {content}
      </div>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      {content}
    </section>
  );
}
