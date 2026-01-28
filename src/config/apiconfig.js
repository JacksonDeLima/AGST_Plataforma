// src/config/apiConfig.js
export const API_BASE_URL =
  import.meta.env.VITE_BRISE_API_BASE_URL ||
  "https://sandbox.brise.agst.com.br:8443/api/v3";

// Helper: transforma "/users/login" em "https://.../api/v3/users/login"
export function buildApiUrl(path) {
  if (!path) return API_BASE_URL;
  const p = String(path);

  // Já é URL absoluta
  if (p.startsWith("http://") || p.startsWith("https://")) return p;

  // Garante 1 barra entre base e path
  const base = API_BASE_URL.replace(/\/+$/, "");
  const rel = p.startsWith("/") ? p : `/${p}`;
  return `${base}${rel}`;
}
