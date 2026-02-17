import { httpRequest } from "./httpClient";
import { endpoints } from "../config/endpoints";

const LS_ACCESS = "access_token";

function getAccessToken() {
  return localStorage.getItem(LS_ACCESS) || "";
}

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function parseHttpError(err) {
  const status = err?.status;
  const apiMsg =
    (typeof err?.data === "object" && err?.data
      ? err.data.message || err.data.error || err.data.detail
      : null) ||
    (typeof err?.data === "string" && err.data.trim() ? err.data : null);

  if (status === 400) return apiMsg || "Dados invalidos. Verifique os campos.";
  if (status === 401) return apiMsg || "Nao autorizado. Token ausente ou invalido.";
  if (status === 403) return apiMsg || "Acesso negado.";
  if (status === 404) return apiMsg || "Recurso nao encontrado.";
  if (status === 409) return apiMsg || "Conflito.";
  if (status === 500) return apiMsg || "Erro interno na API (500).";

  return apiMsg || "Erro ao comunicar com a API.";
}

function pickEmail(input) {
  if (typeof input === "string") return input;
  if (input && typeof input === "object") return input.email;
  return "";
}

// POST /users/forgot-password (sem auth)
export async function forgotPassword(emailOrObj) {
  const email = pickEmail(emailOrObj);
  if (!email) {
    return { ok: false, message: "Informe um e-mail valido." };
  }

  try {
    const data = await httpRequest(endpoints.users.forgotPassword, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, message: parseHttpError(err), error: err };
  }
}

// GET /users/me (com auth)
export async function getMe() {
  try {
    const data = await httpRequest(endpoints.users.me, {
      method: "GET",
      headers: { ...authHeaders() },
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, message: parseHttpError(err), error: err };
  }
}

// PATCH /users/me (com auth)
export async function updateMe(payload = {}) {
  try {
    const data = await httpRequest(endpoints.users.me, {
      method: "PATCH",
      headers: { ...authHeaders() },
      body: JSON.stringify(payload),
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, message: parseHttpError(err), error: err };
  }
}

// POST /users/me/change-password (com auth)
export async function changeMyPassword({ password, new_password }) {
  if (!password || !new_password) {
    return { ok: false, message: "Informe a senha atual e a nova senha." };
  }

  try {
    const data = await httpRequest(endpoints.users.changePassword, {
      method: "POST",
      headers: { ...authHeaders() },
      body: JSON.stringify({ password, new_password }),
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, message: parseHttpError(err), error: err };
  }
}

// DELETE /users/me?password=... (com auth)
export async function deleteMe(password) {
  if (!password) {
    return { ok: false, message: "Informe sua senha para confirmar." };
  }

  const qp = `?password=${encodeURIComponent(password)}`;
  try {
    const data = await httpRequest(`${endpoints.users.me}${qp}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, message: parseHttpError(err), error: err };
  }
}
