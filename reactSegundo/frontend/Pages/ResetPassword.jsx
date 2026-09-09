import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

export function ResetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      return "El correo electrónico es obligatorio.";
    } else if (!emailRegex.test(value)) {
      return "Formato de correo electrónico inválido.";
    }
    return "";
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (touched) {
      setError(validateEmail(value));
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validateEmail(email));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      setTouched(true);
      return;
    }
    // Simulate sending email
    setIsSubmitted(true);
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-800 transition-all duration-350">
        {!isSubmitted ? (
          <>
            <div>
              <h1 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight my-2">
                Recuperar Contraseña
              </h1>
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-zinc-400">
                Ingresa tu correo electrónico para recibir un enlace de recuperación.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 text-left mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="reset-email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`appearance-none rounded-lg relative block w-full px-3 py-2.5 border placeholder-gray-450 dark:placeholder-zinc-500 text-gray-900 dark:text-white bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 focus:z-10 text-sm transition-colors duration-200 ${
                    touched && error
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-zinc-700"
                  }`}
                />
                {touched && error && (
                  <p className="mt-1 text-xs text-red-500 font-medium text-left">{error}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={!!validateEmail(email)}
                  className={`w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-colors duration-205 ${
                    validateEmail(email)
                      ? "bg-amber-600/50 cursor-not-allowed"
                      : "bg-amber-600 hover:bg-amber-700 shadow-sm"
                  }`}
                >
                  Enviar instrucciones
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center space-y-6 py-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Verifica tu correo
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
                Hemos enviado instrucciones de recuperación a <span className="font-semibold text-amber-650 dark:text-amber-500">{email}</span>.
              </p>
            </div>
          </div>
        )}

        <div className="text-center mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
          <NavLink
            to="/login"
            className="text-sm font-medium text-amber-600 hover:text-amber-700 transition duration-200"
          >
            Volver al inicio de sesión
          </NavLink>
        </div>
      </div>
    </section>
  );
}
