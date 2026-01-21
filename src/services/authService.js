import { httpRequest } from "./httpClient";
import { endpoints } from "../config/endpoints";
import { API_BASE_URL } from "../config/apiconfig";

export const AUTH_MODE = import.meta.env.VITE_AUTH_MODE || "auto"; // auto | oauth | password
const DEBUG_AUTH = String(import.meta.env.VITE_DEBUG_AUTH || "").toLowerCase() === "true";

function authLog(...args) {
  if (DEBUG_AUTH) console.log(...args);
}

function safeJson(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return obj;
  }
}

// Decodifica payload do JWT (debug visual, não valida assinatura)
export function decodeJwtPayload(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
}

const OAUTH_CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID || "Brise2Web";
const OAUTH_REDIRECT_URI = import.meta.env.VITE_OAUTH_REDIRECT_URI || "";

const K = {
  access: "access_token",
  refresh: "refresh_token",
  expiresAt: "token_expires_at",
  oauthState: "oauth_state",
  refreshAttemptAt: "oauth_refresh_attempt_at",
};

export function maskToken(token) {
  if (!token) return "—";
  const s = String(token);
  return s.length <= 14 ? s : `${s.slice(0, 8)}…${s.slice(-6)}`;
}

function buildApiUrl(path) {
  const base = API_BASE_URL.replace(/\/+$/, "");
  const rel = String(path || "").startsWith("/") ? String(path) : `/${path}`;
  return `${base}${rel}`;
}

function randomState() {
  const st =
    (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`).replace(/\W/g, "");
  localStorage.setItem(K.oauthState, st);
  return st;
}

export function getStoredTokens() {
  return {
    accessToken: localStorage.getItem(K.access),
    refreshToken: localStorage.getItem(K.refresh),
    expiresAt: localStorage.getItem(K.expiresAt),
  };
}

export function logAuthSnapshot(tag = "Auth Snapshot") {
  const { accessToken, refreshToken, expiresAt } = getStoredTokens();

  console.group(`🔎 ${tag}`);
  console.log("access_token (FULL):", accessToken);
  console.log("refresh_token (FULL):", refreshToken);
  console.log("access_token (masked):", maskToken(accessToken));
  console.log("refresh_token (masked):", maskToken(refreshToken));
  console.log("expiresAt:", expiresAt || "—");

  const claims = decodeJwtPayload(accessToken);
  console.log("jwt_payload:", claims || "(não é JWT ou não decodificou)");

  console.groupEnd();
}


export function clearTokens() {
  localStorage.removeItem(K.access);
  localStorage.removeItem(K.refresh);
  localStorage.removeItem(K.expiresAt);
}

export function resolveAuthMode() {
  if (AUTH_MODE !== "auto") return AUTH_MODE;

  const host = window.location.hostname;
  const isLocal =
    host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");

  return isLocal ? "password" : "oauth";
}

export function setTokenExpiryFromExpiresIn(expiresInSeconds) {
  if (!expiresInSeconds) return;
  const expiresAt = Date.now() + Number(expiresInSeconds) * 1000;
  localStorage.setItem(K.expiresAt, String(expiresAt));
}

function isExpiredByClock(expiresAt, leewayMs = 30_000) {
  if (!expiresAt) return false;
  const t = Number(expiresAt);
  if (!Number.isFinite(t)) return false;
  return Date.now() + leewayMs >= t;
}


/**
 * ✅ Validar token
 */
export async function validateToken(accessToken) {
  try {
    const data = await httpRequest(endpoints.users.validateToken, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    authLog("✅ [validateToken] OK:", safeJson(data));
    return { valid: true, data };
  } catch (err) {
    authLog("❌ [validateToken] FAIL:", err?.status, safeJson(err?.data));
    return { valid: false, status: err?.status, data: err?.data };
  }
}

/**
 * ✅ Redirect para iniciar OAuth
 */
export function redirectToAuthorize() {
  const state = randomState();

  const qs = new URLSearchParams({
    response_type: "code",
    client_id: OAUTH_CLIENT_ID,
    state,
  });

  if (OAUTH_REDIRECT_URI) qs.set("redirect_uri", OAUTH_REDIRECT_URI);

  const url = `${buildApiUrl(endpoints.oauth.authorize)}?${qs.toString()}`;

  authLog("➡️ [OAuth] authorize URL:", url);
  window.location.replace(url);
}

/**
 * ✅ Redirect para renovar sessão via refresh_token (injeção via backend)
 */
export function redirectToRefresh(refreshToken) {
  const state = localStorage.getItem(K.oauthState) || randomState();
  localStorage.setItem(K.refreshAttemptAt, String(Date.now()));

  const qs = new URLSearchParams({
    refresh_token: refreshToken,
    state,
  });

  const url = `${buildApiUrl(endpoints.oauth.token)}?${qs.toString()}`;

  authLog("🔁 [OAuth] refresh URL:", url);
  window.location.replace(url);
}

/**
 * ✅ Bootstrap OAuth (conforme doc)
 */
export async function bootstrapOAuthSession({ onAuthenticated } = {}) {
  const { accessToken, refreshToken, expiresAt } = getStoredTokens();

  authLog("🧭 [bootstrapOAuthSession] access:", maskToken(accessToken));
  authLog("🧭 [bootstrapOAuthSession] refresh:", maskToken(refreshToken));
  authLog("🧭 [bootstrapOAuthSession] expiresAt:", expiresAt || "—");

  const refreshAttemptAt = Number(localStorage.getItem(K.refreshAttemptAt) || "0");
  const attemptedRecently = refreshAttemptAt && Date.now() - refreshAttemptAt < 60_000;

  // 1) access existe e não parece expirado -> valida
  if (accessToken && !isExpiredByClock(expiresAt)) {
    const v = await validateToken(accessToken);
    if (v.valid) {
      localStorage.removeItem(K.refreshAttemptAt);
      onAuthenticated?.();
      return { status: "authenticated" };
    }
  }

  // 2) se tem refresh -> tenta refresh (com anti-loop)
  if (refreshToken) {
    if (attemptedRecently) {
      clearTokens();
      localStorage.removeItem(K.refreshAttemptAt);
      redirectToAuthorize();
      return { status: "redirect_authorize_after_failed_refresh" };
    }

    redirectToRefresh(refreshToken);
    return { status: "redirect_refresh" };
  }

  // 3) sem tokens -> authorize
  clearTokens();
  localStorage.removeItem(K.refreshAttemptAt);
  redirectToAuthorize();
  return { status: "redirect_authorize" };
}

/**
 * ✅ Login por senha (Opção B / localhost)
 */
export async function loginUser({ email, password }) {
  try {
    const data = await httpRequest(endpoints.users.login, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data?.access_token) localStorage.setItem(K.access, data.access_token);
    if (data?.refresh_token) localStorage.setItem(K.refresh, data.refresh_token);
    if (data?.expires_in) setTokenExpiryFromExpiresIn(data.expires_in);

    localStorage.removeItem(K.refreshAttemptAt);

    authLog("✅ [loginUser] /users/login OK:", safeJson(data));
    if (DEBUG_AUTH) logAuthSnapshot("authService (pós-login password)");

    return { success: true, data };
  } catch (err) {
    const code = err?.data?.error || err?.message;
    authLog("❌ [loginUser] erro:", err?.status, safeJson(err?.data));
    return { success: false, error: code || "Erro ao autenticar." };
  }
}

// =========================================================
// Register / Activate / Resend Activation
// =========================================================
function isNetworkError(err) {
  const msg = String(err?.message || "");
  return (
    msg.includes("Failed to fetch") ||
    msg.includes("NetworkError") ||
    msg.includes("ERR_CONNECTION") ||
    msg.includes("ERR_NETWORK")
  );
}

function pickApiMessage(err) {
  return (
    err?.data?.message ||
    err?.data?.detail ||
    err?.data?.error ||
    err?.message ||
    "Erro inesperado."
  );
}

export async function registerUser({ name, email, password, captchaToken }) {
  const payload = {
    email,
    full_name: name,
    password,
    "h-captcha-response": captchaToken,
  };

  console.log("🧾 [registerUser] payload:", {
    email: payload.email,
    full_name: payload.full_name,
    "h-captcha-response": payload["h-captcha-response"] ? "OK" : "MISSING",
    password: "******",
  });

  try {
    const data = await httpRequest(endpoints.users.create, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      data: {
        id: data?.id,
        status: data?.status,
        created_at: data?.created_at,
      },
    };
  } catch (err) {
    console.error("❌ Erro ao criar usuário:", err);

    let msg;
    if (isNetworkError(err)) {
      msg =
        "Não foi possível conectar ao servidor. Verifique sua conexão ou contate o administrador.";
    } else if (err?.status === 409) {
      msg = pickApiMessage(err) || "Este email já está cadastrado.";
    } else if (err?.status === 400) {
      msg =
        pickApiMessage(err) ||
        "Dados inválidos. Verifique as informações e a validação de segurança.";
    } else {
      msg = pickApiMessage(err) || "Erro ao criar usuário. Tente novamente.";
    }

    return { success: false, error: msg };
  }
}

export async function activateUserAccount({ email, token }) {
  try {
    const data = await httpRequest(endpoints.users.activate, {
      method: "POST",
      body: JSON.stringify({ email, token }),
    });

    return { success: true, data };
  } catch (err) {
    console.error("❌ Erro ao ativar usuário:", err);

    let msg;
    if (isNetworkError(err)) {
      msg =
        "Não foi possível conectar ao servidor. Verifique sua conexão ou contate o administrador.";
    } else if (err?.status === 404) {
      msg = pickApiMessage(err) || "Token inválido ou expirado.";
    } else if (err?.status === 400) {
      msg = pickApiMessage(err) || "Dados inválidos. Verifique e-mail e token.";
    } else {
      msg = pickApiMessage(err) || "Erro ao ativar usuário.";
    }

    return { success: false, error: msg };
  }
}

export async function resendActivationLink({ email }) {
  try {
    const data = await httpRequest(endpoints.users.resendActivation, {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    return {
      success: true,
      message:
        data?.message ||
        `Novo link de ativação foi enviado para ${email}. Verifique sua caixa de entrada.`,
    };
  } catch (err) {
    console.error("❌ Erro ao reenviar link de ativação:", err);

    let msg;
    if (isNetworkError(err)) {
      msg =
        "Não foi possível conectar ao servidor. Verifique sua conexão ou contate o administrador.";
    } else if (err?.status === 404) {
      msg = "Usuário não encontrado ou já ativo.";
    } else if (err?.status === 400) {
      msg = pickApiMessage(err) || "E-mail inválido.";
    } else {
      msg = pickApiMessage(err) || "Erro ao reenviar link de ativação.";
    }

    return { success: false, error: msg };
  }
}

// Aliases p/ compatibilidade
export async function createUser({ email, full_name, password }) {
  return httpRequest(endpoints.users.create, {
    method: "POST",
    body: JSON.stringify({ email, full_name, password }),
  });
}
export async function activateUser({ email, token }) {
  return activateUserAccount({ email, token });
}
export async function resendActivation({ email }) {
  return resendActivationLink({ email });
}


function safeMessage(err) {
  try {
    if (typeof err === "string") return err;
    if (err?.message) return err.message;
    if (err?.error) return err.error;
    return null;
  } catch {
    return null;
  }
}

export async function forgotPassword({ email }) {
  try {
    await httpRequest(endpoints.users.forgotPassword, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return { success: true };
  } catch (err) {
    console.error("❌ [AuthService] forgotPassword:", err);
    return { success: false, error: safeMessage(err) || "Erro ao solicitar redefinição." };
  }
}

export async function resetPassword({ email, recoveryToken, password }) {
  try {
    const qs = new URLSearchParams({
      email: String(email || ""),
      recoveryToken: String(recoveryToken || ""),
    }).toString();

    const url = `${endpoints.users.resetPassword}?${qs}`;

    await httpRequest(url, {
      method: "POST",
      body: JSON.stringify({ password }),
    });

    return { success: true };
  } catch (err) {
    console.error("❌ [AuthService] resetPassword:", err);
    return { success: false, error: safeMessage(err) || "Erro ao redefinir senha." };
  }
}

export async function changePassword({ password, new_password }) {
  try {
    await httpRequest(endpoints.users.changePassword, {
      method: "POST",
      body: JSON.stringify({ password, new_password }),
    });
    return { success: true };
  } catch (err) {
    console.error("❌ [AuthService] changePassword:", err);
    return { success: false, error: safeMessage(err) || "Erro ao alterar senha." };
  }
}