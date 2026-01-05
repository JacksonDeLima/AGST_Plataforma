// src/services/httpClient.js
import { API_BASE_URL } from "../config/apiConfig";

function buildApiUrl(path) {
  const base = API_BASE_URL.replace(/\/+$/, "");
  const rel = String(path || "").startsWith("/") ? String(path) : `/${path}`;
  return `${base}${rel}`;
}

export async function httpRequest(endpoint, options = {}) {
  const url = buildApiUrl(endpoint);

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });

  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const err = new Error("HTTP_ERROR");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
