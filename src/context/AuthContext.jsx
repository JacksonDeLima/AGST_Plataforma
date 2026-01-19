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

// 🔧 liga/desliga logs
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
  if (s.length <= 18) return `${s.slice(0, 6)}…${s.slice(-4)}`;
  return `${s.slice(0, 10)}…${s.slice(-6)}`;
}

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

async function apiRequest(path, { method = "GET", body, accessToken } = {}) {
  const url = `${API_BASE_URL}${path}`;
  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const t0 = performance.now();
  console.log("📡 [apiRequest] ->", { method, url, hasAuth: !!accessToken, body });

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

  console.log(`📥 [apiRequest] <- ${res.status} (${ms}ms)`, data);

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

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState("loading"); // loading | authed | unauthed
  const [error, setError] = useState("");

  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");

  const [user, setUser] = useState(null);
  const [corporations, setCorporations] = useState([]);
  const [corporationId, setCorporationId] = useState("");
  const [corporation, setCorporation] = useState(null);

  const isAuthenticated = status === "authed" && !!accessToken;

  // 🔎 log de mudanças (ajuda MUITO)
  useEffect(() => {
    if (!DEBUG_AUTH) return;
    authLog("🧭 [Auth] state snapshot:", {
      status,
      isAuthenticated,
      accessToken: maskToken(accessToken),
      refreshToken: maskToken(refreshToken),
      user: user
        ? { ...user, access_token: undefined, refresh_token: undefined }
        : null,
      corporationsCount: corporations?.length || 0,
      corporationId,
      corporation: corporation ? { id: corporation.id, name: corporation.name } : null,
      error,
    });
  }, [
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
    authGroup("🚪 [Auth] logout()", () => {
      authLog("🧹 Clearing tokens + state");
      clearTokens();
      storeCorpId("");

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
    console.group("👤 [Auth] loadMe");
    console.log("token:", token ? token.slice(0, 20) + "..." : "MISSING");

    const me = await apiRequest("/users/me", { method: "GET", accessToken: token });

    console.log("✅ /users/me =>", me);
    console.groupEnd();

    setUser(me);
    return me;
  }, []);

  // ✅ Carrega corporações e garante corporationId válido sem depender de /corporations/:id
  const loadCorporations = useCallback(async (token) => {
    console.group("🏢 [Auth] loadCorporations");
    console.log("token:", token ? token.slice(0, 20) + "..." : "MISSING");

    const list = await apiRequest("/corporations", { method: "GET", accessToken: token });
    console.log("✅ /corporations raw =>", list);

    const normalized = Array.isArray(list) ? list : Array.isArray(list?.data) ? list.data : [];
    console.log("normalized length:", normalized.length);

    setCorporations(normalized);

    // ✅ corp ativa: usa storage se existir na lista, senão usa primeira
    const stored = getStoredCorpId();
    const hasStored = stored && normalized.some((c) => String(c.id) === String(stored));
    const nextId = hasStored
      ? String(stored)
      : normalized?.[0]?.id
      ? String(normalized[0].id)
      : "";

    setCorporationId(nextId);
    storeCorpId(nextId);

    console.groupEnd();
    return { ok: true, data: normalized, activeId: nextId };
  }, []);

  // ✅ Mantém `corporation` sempre preenchida pelo menos com o item do /corporations
  // (isso evita “não carregou as informações” quando /corporations/:id dá 404/403)
  useEffect(() => {
    const cid = String(corporationId || "");
    if (!cid) {
      setCorporation(null);
      return;
    }

    const list = Array.isArray(corporations) ? corporations : [];
    const fromList = list.find((c) => String(c.id) === cid) || null;

    if (fromList) {
      // Se já temos detalhes (de /corporations/:id), mantemos e só “mesclamos”
      setCorporation((prev) => {
        if (prev && String(prev.id) === cid) return { ...fromList, ...prev };
        return fromList;
      });
      return;
    }

    // fallback mínimo (não deixa null)
    setCorporation((prev) => {
      if (prev && String(prev.id) === cid) return prev;
      return { id: isNaN(Number(cid)) ? cid : Number(cid) };
    });
  }, [corporations, corporationId]);

  // ✅ Trocar corp: nunca pode falhar por causa de /corporations/:id
  const setActiveCorporation = useCallback(async (id) => {
    return authGroup("🔁 [Auth] setActiveCorporation()", async () => {
      const cid = String(id || "");
      authLog("selected:", cid);

      // ✅ 1) troca corp SEMPRE (estado + storage)
      setCorporationId(cid);
      storeCorpId(cid);

      if (!cid) {
        setCorporation(null);
        return { ok: true, data: null };
      }

      // ✅ 2) best-effort: tenta detalhes, mas se der 403/404 não bloqueia
      const { accessToken: at } = getStoredTokens();
      authLog("stored accessToken:", maskToken(at));
      if (!at) return { ok: true, limited: true };

      try {
        const corp = await apiRequest(`/corporations/${cid}`, { method: "GET", accessToken: at });

        // evita race: só aplica se ainda estiver nessa corp
        if (String(getStoredCorpId()) === cid) {
          setCorporation((prev) => ({ ...(prev || {}), ...corp }));
        }

        return { ok: true, data: corp };
      } catch (e) {
        if (e?.status === 403 || e?.status === 404) {
          console.warn(
            `[Auth] Sem permissão/sem detalhe em /corporations/${cid} (HTTP ${e?.status}). Seguindo com dados do /corporations.`
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
      console.group("🔐 [Auth] loginWithPassword");
      console.log("payload:", {
        email,
        password: "******",
        captcha: captchaToken ? "OK" : "MISSING",
      });

      setError("");
      setStatus("loading");

      try {
        const body = captchaToken
          ? { email, password, "h-captcha-response": captchaToken }
          : { email, password };

        const data = await apiRequest("/users/login", { method: "POST", body });

        console.log("✅ login response:", {
          ...data,
          access_token: "******",
          refresh_token: "******",
        });

        const at = data?.access_token || "";
        const rt = data?.refresh_token || "";

        if (!at) throw new Error("Resposta sem access_token.");

        storeTokens({ accessToken: at, refreshToken: rt });
        setAccessToken(at);
        setRefreshToken(rt);

        await loadMe(at);
        const corpsRes = await loadCorporations(at);

        // ✅ tenta buscar detalhes da corp ativa, sem quebrar se der 404/403
        if (corpsRes?.activeId) {
          await setActiveCorporation(corpsRes.activeId);
        }

        setStatus("authed");
        console.log("✅ AuthContext: user/corporations carregados");
        console.groupEnd();
        return { ok: true };
      } catch (e) {
        console.error("❌ login error:", e?.status, e?.data || e?.message);
        setError(e?.data?.error || e?.data?.message || e.message || "Falha no login");
        setStatus("unauthed");
        console.groupEnd();
        return { ok: false, error: e };
      }
    },
    [loadMe, loadCorporations, setActiveCorporation]
  );

  const bootstrap = useCallback(async () => {
    return authGroup("♻️ [Auth] bootstrap()", async () => {
      setError("");

      const { accessToken: at, refreshToken: rt } = getStoredTokens();

      authLog("stored tokens:", { access: maskToken(at), refresh: maskToken(rt) });
      authLog("stored corpId:", getStoredCorpId());

      if (!at) {
        authLog("➡️ no access token -> status=unauthed");
        setStatus("unauthed");
        return;
      }

      try {
        await apiRequest("/users/validate-token", { method: "GET", accessToken: at });
        authLog("✅ validate-token ok");

        setAccessToken(at);
        setRefreshToken(rt);

        await loadMe(at);
        const corpsRes = await loadCorporations(at);

        // ✅ best-effort: detalhe da corp ativa (não quebra se 404/403)
        if (corpsRes?.activeId) {
          await setActiveCorporation(corpsRes.activeId);
        }

        setStatus("authed");
        authLog("✅ bootstrap success");
      } catch (e) {
        authLog("❌ bootstrap failed -> logout", e);
        logout();
      }
    });
  }, [loadMe, loadCorporations, logout, setActiveCorporation]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const value = useMemo(
    () => ({
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

      getAuthHeader: () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }),
    [
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
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider />");
  return ctx;
}
