// src/services/httpClient.js
import { API_BASE_URL } from "../config/apiconfig";

async function httpRequest(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  // Se tiver token salvo, manda junto
  const accessToken = localStorage.getItem("access_token");
  if (accessToken) {
    defaultHeaders["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  });

  let data = {};
  try {
    data = await response.json();
  } catch (e) {
    // resposta vazia ou não JSON
  }

  if (!response.ok) {
    const apiError = data.error || data.message;
    const error = new Error(apiError || "Erro na requisição");
    error.status = response.status;
    throw error;
  }

  return data;
}

export { httpRequest };
