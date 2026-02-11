import { API_BASE_URL } from "../config/apiconfig"; // <- ajuste se necessário

const LS_ACCESS = "access_token";

function getAccessToken() {
  return localStorage.getItem(LS_ACCESS) || "";
}

function withAuth(headers = {}) {
  const token = getAccessToken();
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}

async function http(path, { method = "GET", body, headers } = {}) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // 204 sem corpo
  if (res.status === 204) return { ok: true, status: 204, data: null };

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      data,
      message: data?.message || data?.error || "REQUEST_FAILED",
    };
  }

  return { ok: true, status: res.status, data };
}

/** === Endpoints === */

// POST /users/forgot-password (sem auth)
export function forgotPassword(email) {
  return http("/users/forgot-password", {
    method: "POST",
    body: { email },
  });
}

// GET /users/me (com auth)
export function getMe() {
  return http("/users/me", {
    method: "GET",
    headers: withAuth(),
  });
}

// PATCH /users/me (com auth)
export function updateMe(payload) {
  return http("/users/me", {
    method: "PATCH",
    headers: withAuth(),
    body: payload,
  });
}

// POST /users/me/change-password (com auth)
export function changeMyPassword({ password, new_password }) {
  return http("/users/me/change-password", {
    method: "POST",
    headers: withAuth(),
    body: { password, new_password },
  });
}

// DELETE /users/me?password=... (com auth)
export function deleteMe(password) {
  const qp = `?password=${encodeURIComponent(password)}`;
  return http(`/users/me${qp}`, {
    method: "DELETE",
    headers: withAuth(),
  });
}
