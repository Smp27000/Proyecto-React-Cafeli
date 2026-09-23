// Configuración central de la API
// En producción (Railway), define la variable de entorno VITE_API_URL
// En desarrollo local, usa http://localhost:3000/api/v1 por defecto
export const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : "http://localhost:3000/api/v1";
