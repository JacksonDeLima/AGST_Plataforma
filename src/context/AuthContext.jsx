import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const API_BASE_URL =
  import.meta.env.VITE_BRISE_API_BASE_URL ||
  "https://sandbox.brise.agst.com.br:8443/api/v3";

const LS_ACCESS = "access_token";
const LS_REFRESH = "refresh_token";
const LS_CORP_ID = "corporation_id";

// ðŸ”§ liga/desliga logs
const DEBUG_AUTH =
  String(import.meta.env.VITE_DEBUG_AUTH || "").toLowerCase() === "true";

function authLog(...args) {
  if (DEBUG_AUTH) console.log(...args);
}
function authGroup(title, fn) {
  if (!DEBUG_AUTH) return fn();
  console.group(title);
  try {
    return fn();
  } finally {
    console.groupEnd();
  }
}

function maskToken(t = "") {
  const s = String(t || "");
  if (!s) return "";
  if (s.length <= 18) return `${s.slice(0, 6)}â€¦${s.slice(-4)}`;
  return `${s.slice(0, 10)}â€¦${s.slice(-6)}`;
}

function now() {
  return new Date().toISOString();
}

function urlSnap() {
  return {
    href: window.location.href,
    origin: window.location.origin,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  };
}

function storageSnap() {
  const at = localStorage.getItem(LS_ACCESS) || "";
  const rt = localStorage.getItem(LS_REFRESH) || "";
  const corp = localStorage.getItem(LS_CORP_ID) || "";

  return {
    access_token: at ? maskToken(at) : "(vazio)",
    refresh_token: rt ? maskToken(rt) : "(vazio)",
    corporation_id: corp || "(vazio)",
    ss_state: sessionStorage.getItem(SS_OAUTH_STATE) ? "OK" : "(vazio)",
    ss_verifier: sessionStorage.getItem(SS_PKCE_VERIFIER) ? "OK" : "(vazio)",
    ss_post_redirect: sessionStorage.getItem(SS_POST_AUTH_REDIRECT) || "(vazio)",
  };
}

function logEnvSnap() {
  return {
    AUTH_MODE,
    resolved_mode: resolveAuthMode(),
    API_BASE_URL,
    OAUTH_CLIENT_ID,
    OAUTH_AUTHORIZE_PATH,
    OAUTH_TOKEN_PATH,
    ENV_REDIRECT_URI: ENV_REDIRECT_URI || "(vazio)",
    computed_redirect_uri: getRedirectUri(),
  };
}

function groupCollapsed(title, fn) {
  if (!DEBUG_AUTH) return fn();
  console.groupCollapsed(title);
  try {
    return fn();
  } finally {
    console.groupEnd();
  }
}

/* ============================
   OAuth2 + PKCE (SPA)
============================ */
export const AUTH_MODE = import.meta.env.VITE_AUTH_MODE || "auto"; // auto | oauth | password

function resolveAuthMode() {
  if (AUTH_MODE !== "auto") return AUTH_MODE;
  const host = window.location.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
  return isLocal ? "password" : "oauth";
}

const OAUTH_CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID || "Brise2Web";

// defaults do seu doc: /oauth/authorize e /oauth/token
const OAUTH_AUTHORIZE_PATH = import.meta.env.VITE_OAUTH_AUTHORIZE_PATH || "/oauth/authorize";
const OAUTH_TOKEN_PATH = import.meta.env.VITE_OAUTH_TOKEN_PATH || "/oauth/token";

// se nÃ£o setar no .env, usamos runtime: window.location.origin + "/oauth/callback"
const ENV_REDIRECT_URI = import.meta.env.VITE_OAUTH_REDIRECT_URI || "";

const SS_OAUTH_REDIRECT_AT = "oauth_redirect_at";
const SS_POST_AUTH_REDIRECT = "post_auth_redirect";
const SS_PKCE_VERIFIER = "pkce_code_verifier";
const SS_OAUTH_STATE = "oauth_state";

function buildApiUrl(path) {
  const base = String(API_BASE_URL).replace(/\/+$/, "");
  const rel = String(path || "").startsWith("/") ? String(path) : `/${path}`;
  return `${base}${rel}`;
}

function safeRedirect(url) {
  // evita loop no StrictMode / render duplo
  const last = Number(sessionStorage.getItem(SS_OAUTH_REDIRECT_AT) || "0");
  if (last && Date.now() - last < 1500) return;
  sessionStorage.setItem(SS_OAUTH_REDIRECT_AT, String(Date.now()));
  window.location.replace(url);
}

function base64UrlEncode(bytes) {
  let str = "";
  bytes.forEach((b) => (str += String.fromCharCode(b)));
  const base64 = btoa(str);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomBytes(len = 32) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return arr;
}

function generateState() {
  const st = base64UrlEncode(randomBytes(16));
  sessionStorage.setItem(SS_OAUTH_STATE, st);
  return st;
}

function generateVerifier() {
  const v = base64UrlEncode(randomBytes(32));
  sessionStorage.setItem(SS_PKCE_VERIFIER, v);
  return v;
}

async function sha256Base64Url(input) {
  const enc = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return base64UrlEncode(new Uint8Array(hash));
}

function getRedirectUri() {
  return ENV_REDIRECT_URI || `${window.location.origin}/oauth/callback`;
}

async function startOAuthRedirect({ redirectAfterLogin } = {}) {
  groupCollapsed("âž¡ï¸ [OAuth PKCE] startOAuthRedirect()", () => {
    console.log("time:", now());
    console.log("url(before):", urlSnap());
    console.log("storage(before):", storageSnap());
    console.log("redirectAfterLogin:", redirectAfterLogin || "(nÃ£o informado)");
    console.log("redirect_uri:", getRedirectUri());
  });

  const redirect_uri = getRedirectUri();

  // guarda a rota que o usuÃ¡rio queria abrir
  if (redirectAfterLogin) {
    sessionStorage.setItem(SS_POST_AUTH_REDIRECT, String(redirectAfterLogin));
  } else if (!sessionStorage.getItem(SS_POST_AUTH_REDIRECT)) {
    sessionStorage.setItem(SS_POST_AUTH_REDIRECT, "/ambientes");
  }

  const state = generateState();
  const verifier = generateVerifier();
  const challenge = await sha256Base64Url(verifier);

  groupCollapsed("ðŸ” [OAuth PKCE] generated values", () => {
    console.log("state:", state);
    console.log("verifier_prefix:", verifier.slice(0, 10) + "â€¦");
    console.log("challenge_prefix:", String(challenge).slice(0, 10) + "â€¦");
    console.log("storage(after_gen):", storageSnap());
  });

  const qs = new URLSearchParams({
    response_type: "code",
    client_id: OAUTH_CLIENT_ID,
    redirect_uri,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  const url = `${buildApiUrl(OAUTH_AUTHORIZE_PATH)}?${qs.toString()}`;
  authLog("âž¡ï¸ [OAuth PKCE] authorize URL:", url);

  safeRedirect(url);
}


// token endpoint: geralmente x-www-form-urlencoded
async function oauthTokenRequest(form) {
  const url = buildApiUrl(OAUTH_TOKEN_PATH);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams(form).toString(),
  });

  const raw = await res.text();
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw || null;
  }

  if (!res.ok) {
    const err = new Error(
      typeof data === "object"
        ? (data?.error || data?.message || `HTTP ${res.status}`)
        : (data || `HTTP ${res.status}`)
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

/* ============================
   Storage helpers
============================ */
function getStoredTokens() {
  return {
    accessToken: localStorage.getItem(LS_ACCESS) || "",
    refreshToken: localStorage.getItem(LS_REFRESH) || "",
  };
}

function storeTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem(LS_ACCESS, accessToken);
  if (refreshToken) localStorage.setItem(LS_REFRESH, refreshToken);
}

function clearTokens() {
  localStorage.removeItem(LS_ACCESS);
  localStorage.removeItem(LS_REFRESH);
}

function getStoredCorpId() {
  return localStorage.getItem(LS_CORP_ID) || "";
}
function storeCorpId(id) {
  if (id) localStorage.setItem(LS_CORP_ID, String(id));
  else localStorage.removeItem(LS_CORP_ID);
}

/* ============================
   API request (Bearer)
============================ */
function sanitizeBodyForLog(body) {
  try {
    if (!body || typeof body !== "object") return body;
    const b = { ...body };
    if ("password" in b) b.password = "******";
    if ("new_password" in b) b.new_password = "******";
    if ("h-captcha-response" in b) b["h-captcha-response"] = b["h-captcha-response"] ? "OK" : "";
    return b;
  } catch {
    return body;
  }
}

async function apiRequest(path, { method = "GET", body, accessToken } = {}) {
  const url = `${API_BASE_URL}${path}`;
  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const t0 = performance.now();
  if (DEBUG_AUTH) {
    console.log("ðŸ“¡ [apiRequest] ->", {
      method,
      url,
      hasAuth: !!accessToken,
      body: sanitizeBodyForLog(body),
    });
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const ms = Math.round(performance.now() - t0);

  const rawText = await res.text();
  let data = null;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    data = rawText || null;
  }

  if (DEBUG_AUTH) console.log(`ðŸ“¥ [apiRequest] <- ${res.status} (${ms}ms)`, data);

  if (!res.ok) {
    const err = new Error(
      typeof data === "object"
        ? (data?.error || data?.message || `HTTP ${res.status}`)
        : (data || `HTTP ${res.status}`)
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

/* ============================
   Context
============================ */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const mode = useMemo(() => resolveAuthMode(), []);

  const [status, setStatus] = useState("loading"); // loading | authed | unauthed
  const [error, setError] = useState("");

  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");

  const [user, setUser] = useState(null);
  const [corporations, setCorporations] = useState([]);
  const [corporationId, setCorporationId] = useState("");
  const [corporation, setCorporation] = useState(null);

  const isAuthenticated = status === "authed" && !!accessToken;

  useEffect(() => {
    if (!DEBUG_AUTH) return;

    groupCollapsed("ðŸ§ª [Auth DEBUG] ENV + URL + STORAGE (mount)", () => {
      console.log("time:", now());
      console.log("env:", logEnvSnap());
      console.log("url:", urlSnap());
      console.log("storage:", storageSnap());
    });
  }, []);

  useEffect(() => {
    if (!DEBUG_AUTH) return;
    authLog("ðŸ§­ [Auth] snapshot:", {
      mode,
      status,
      isAuthenticated,
      accessToken: maskToken(accessToken),
      refreshToken: maskToken(refreshToken),
      user: user ? { ...user, access_token: undefined, refresh_token: undefined } : null,
      corporationsCount: corporations?.length || 0,
      corporationId,
      corporation: corporation ? { id: corporation.id, name: corporation.name } : null,
      error,
    });
  }, [
    mode,
    status,
    isAuthenticated,
    accessToken,
    refreshToken,
    user,
    corporations,
    corporationId,
    corporation,
    error,
  ]);

  const logout = useCallback(() => {
    authGroup("ðŸšª [Auth] logout()", () => {
      clearTokens();
      storeCorpId("");
      sessionStorage.removeItem(SS_POST_AUTH_REDIRECT);
      sessionStorage.removeItem(SS_PKCE_VERIFIER);
      sessionStorage.removeItem(SS_OAUTH_STATE);

      setAccessToken("");
      setRefreshToken("");
      setUser(null);

      setCorporations([]);
      setCorporationId("");
      setCorporation(null);

      setError("");
      setStatus("unauthed");
    });
  }, []);

  const loadMe = useCallback(async (token) => {
    const me = await apiRequest("/users/me", { method: "GET", accessToken: token });
    setUser(me);
    return me;
  }, []);

  const loadCorporations = useCallback(async (token) => {
    const list = await apiRequest("/corporations", { method: "GET", accessToken: token });
    const normalized = Array.isArray(list) ? list : Array.isArray(list?.data) ? list.data : [];
    setCorporations(normalized);

    const stored = getStoredCorpId();
    const hasStored = stored && normalized.some((c) => String(c.id) === String(stored));
    const nextId = hasStored
      ? String(stored)
      : normalized?.[0]?.id
        ? String(normalized[0].id)
        : "";

    setCorporationId(nextId);
    storeCorpId(nextId);

    return { ok: true, data: normalized, activeId: nextId };
  }, []);

  useEffect(() => {
    const cid = String(corporationId || "");
    if (!cid) {
      setCorporation(null);
      return;
    }

    const list = Array.isArray(corporations) ? corporations : [];
    const fromList = list.find((c) => String(c.id) === cid) || null;

    if (fromList) {
      setCorporation((prev) => {
        if (prev && String(prev.id) === cid) return { ...fromList, ...prev };
        return fromList;
      });
      return;
    }

    setCorporation((prev) => {
      if (prev && String(prev.id) === cid) return prev;
      return { id: isNaN(Number(cid)) ? cid : Number(cid) };
    });
  }, [corporations, corporationId]);

  const setActiveCorporation = useCallback(async (id) => {
    return authGroup("ðŸ” [Auth] setActiveCorporation()", async () => {
      const cid = String(id || "");
      setCorporationId(cid);
      storeCorpId(cid);

      if (!cid) {
        setCorporation(null);
        return { ok: true, data: null };
      }

      const { accessToken: at } = getStoredTokens();
      if (!at) return { ok: true, limited: true };

      try {
        const corp = await apiRequest(`/corporations/${cid}`, { method: "GET", accessToken: at });
        if (String(getStoredCorpId()) === cid) {
          setCorporation((prev) => ({ ...(prev || {}), ...corp }));
        }
        return { ok: true, data: corp };
      } catch (e) {
        if (e?.status === 403 || e?.status === 404) {
          console.warn(
            `[Auth] Sem permissÃ£o/sem detalhe em /corporations/${cid} (HTTP ${e?.status}). Seguindo com dados do /corporations.`
          );
          return { ok: true, limited: true };
        }
        console.error("[Auth] Falha ao buscar detalhes da corp ativa:", e);
        return { ok: true, limited: true, warning: e?.message };
      }
    });
  }, []);

  const loginWithPassword = useCallback(
    async (email, password, captchaToken) => {
      setError("");
      setStatus("loading");

      try {
        const body = captchaToken
          ? { email, password, "h-captcha-response": captchaToken }
          : { email, password };

        const data = await apiRequest("/users/login", { method: "POST", body });

        const at = data?.access_token || "";
        const rt = data?.refresh_token || "";

        if (!at) throw new Error("Resposta sem access_token.");

        storeTokens({ accessToken: at, refreshToken: rt });
        setAccessToken(at);
        setRefreshToken(rt);

        await loadMe(at);
        const corpsRes = await loadCorporations(at);
        if (corpsRes?.activeId) await setActiveCorporation(corpsRes.activeId);

        setStatus("authed");
        return { ok: true };
      } catch (e) {
        setError(e?.data?.error || e?.data?.message || e.message || "Falha no login");
        setStatus("unauthed");
        return { ok: false, error: e };
      }
    },
    [loadMe, loadCorporations, setActiveCorporation]
  );

  // âœ… troca code -> token (PKCE)
  const exchangeCodeForTokens = useCallback(async ({ code, state }) => {
    return authGroup("ðŸ§© [OAuth] exchangeCodeForTokens()", async () => {
      const redirect_uri = getRedirectUri();
      const expectedState = sessionStorage.getItem(SS_OAUTH_STATE) || "";
      const verifier = sessionStorage.getItem(SS_PKCE_VERIFIER) || "";

      authLog("state(expected):", expectedState);
      authLog("state(received):", state);
      authLog("has verifier:", !!verifier);

      if (!code) throw new Error("Missing authorization code.");
      if (!state || state !== expectedState) throw new Error("Invalid state (CSRF).");
      if (!verifier) throw new Error("Missing code_verifier (PKCE).");

      // POST /oauth/token
      const token = await oauthTokenRequest({
        grant_type: "authorization_code",
        client_id: OAUTH_CLIENT_ID,
        redirect_uri,
        code,
        code_verifier: verifier,
      });

      const at = token?.access_token || "";
      const rt = token?.refresh_token || "";

      if (!at) throw new Error("Token endpoint retornou sem access_token.");

      storeTokens({ accessToken: at, refreshToken: rt });
      setAccessToken(at);
      setRefreshToken(rt);

      // limpa temporÃ¡rios
      sessionStorage.removeItem(SS_PKCE_VERIFIER);
      sessionStorage.removeItem(SS_OAUTH_STATE);

      authLog("âœ… tokens recebidos:", { access: maskToken(at), refresh: maskToken(rt) });
      return { ok: true, token };
    });
  }, []);

  // âœ… refresh token (sem redirect)
  const refreshSession = useCallback(async () => {
    return authGroup("ðŸ” [OAuth] refreshSession()", async () => {
      const { refreshToken: rt } = getStoredTokens();
      if (!rt) return { ok: false, reason: "NO_REFRESH_TOKEN" };

      const token = await oauthTokenRequest({
        grant_type: "refresh_token",
        client_id: OAUTH_CLIENT_ID,
        refresh_token: rt,
      });

      const at = token?.access_token || "";
      const newRt = token?.refresh_token || rt;

      if (!at) throw new Error("Refresh retornou sem access_token.");

      storeTokens({ accessToken: at, refreshToken: newRt });
      setAccessToken(at);
      setRefreshToken(newRt);

      authLog("âœ… refresh ok:", { access: maskToken(at), refresh: maskToken(newRt) });
      return { ok: true };
    });
  }, []);

  // âœ… BOOTSTRAP: valida token, carrega user e corp, se falhar tenta refresh (oauth)
  const bootstrap = useCallback(async () => {
    return authGroup("â™»ï¸ [Auth] bootstrap()", async () => {
      setError("");

      const { accessToken: at, refreshToken: rt } = getStoredTokens();
      authLog("mode:", mode);
      authLog("stored:", { access: maskToken(at), refresh: maskToken(rt) });

      if (!at) {
        setStatus("unauthed");
        return { ok: false, reason: "NO_ACCESS_TOKEN" };
      }

      try {
        await apiRequest("/users/validate-token", { method: "GET", accessToken: at });

        setAccessToken(at);
        setRefreshToken(rt);

        await loadMe(at);
        const corpsRes = await loadCorporations(at);
        if (corpsRes?.activeId) await setActiveCorporation(corpsRes.activeId);

        setStatus("authed");
        return { ok: true };
      } catch (e) {
        authLog("âŒ validate-token falhou:", e?.status, e?.data || e?.message);

        // no oauth, tenta refresh antes de derrubar
        if (mode === "oauth" && rt) {
          try {
            const r = await refreshSession();
            if (r.ok) {
              const { accessToken: at2, refreshToken: rt2 } = getStoredTokens();

              await apiRequest("/users/validate-token", { method: "GET", accessToken: at2 });

              setAccessToken(at2);
              setRefreshToken(rt2);

              await loadMe(at2);
              const corpsRes2 = await loadCorporations(at2);
              if (corpsRes2?.activeId) await setActiveCorporation(corpsRes2.activeId);

              setStatus("authed");
              return { ok: true, refreshed: true };
            }
          } catch (refreshErr) {
            authLog("âŒ refresh falhou:", refreshErr?.status, refreshErr?.data || refreshErr?.message);
          }
        }

        // se nÃ£o deu, derruba sessÃ£o
        clearTokens();
        setAccessToken("");
        setRefreshToken("");
        setUser(null);
        setCorporations([]);
        setCorporationId("");
        setCorporation(null);

        setStatus("unauthed");
        return { ok: false, reason: "INVALID_SESSION" };
      }
    });
  }, [mode, loadMe, loadCorporations, refreshSession, setActiveCorporation]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // âœ… disparo automÃ¡tico do OAuth quando necessÃ¡rio (usado pelos guards)
  const beginOAuth = useCallback(async ({ redirectAfterLogin } = {}) => {
    await startOAuthRedirect({ redirectAfterLogin });
  }, []);

  const value = useMemo(
    () => ({
      mode,
      status,
      error,
      isAuthenticated,
      accessToken,
      refreshToken,

      user,
      corporations,
      corporationId,
      corporation,

      loginWithPassword,
      logout,
      bootstrap,
      setActiveCorporation,

      beginOAuth,
      exchangeCodeForTokens,

      getAuthHeader: () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }),
    [
      mode,
      status,
      error,
      isAuthenticated,
      accessToken,
      refreshToken,
      user,
      corporations,
      corporationId,
      corporation,
      loginWithPassword,
      logout,
      bootstrap,
      setActiveCorporation,
      beginOAuth,
      exchangeCodeForTokens,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider />");
  return ctx;
}

