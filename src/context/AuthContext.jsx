// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

import {
  loginUser,
  clearTokens,
  getStoredTokens,
  resolveAuthMode,
  redirectToAuthorize,
  setTokenExpiryFromExpiresIn,
} from "../services/authService";
import { listCorporations } from "../services/corporationsService";
import { getMe } from "../services/usersService";
import { httpRequest } from "../services/httpClient";
import { endpoints } from "../config/endpoints";

const AuthContext = createContext(null);

const SS_POST_AUTH_REDIRECT = "post_auth_redirect";
const LS_ACTIVE_CORP = "agst_active_corporation_id";

export function AuthProvider({ children }) {
  const [status, setStatus] = useState("loading"); // loading | authed | unauthed
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [corporations, setCorporations] = useState([]);
  const [corporationId, setCorporationId] = useState(
    () => localStorage.getItem(LS_ACTIVE_CORP) || ""
  );

  const mode = useMemo(() => resolveAuthMode(), []);
  const isAuthenticated = status === "authed";

  const setActiveCorporation = useCallback((id) => {
    const nextId = String(id || "");
    setCorporationId(nextId);

    if (nextId) localStorage.setItem(LS_ACTIVE_CORP, nextId);
    else localStorage.removeItem(LS_ACTIVE_CORP);
  }, []);

  const syncActiveCorporation = useCallback((list) => {
    const stored = localStorage.getItem(LS_ACTIVE_CORP);
    const exists = list.some((c) => String(c.id) === String(stored));
    const nextId = exists ? stored : list[0]?.id ? String(list[0].id) : "";

    setCorporationId(nextId);
    if (nextId) localStorage.setItem(LS_ACTIVE_CORP, nextId);
    else localStorage.removeItem(LS_ACTIVE_CORP);
  }, []);

  const loadMe = useCallback(async () => {
    const res = await getMe();
    if (!res.ok) {
      throw new Error(res.message || "Falha ao carregar usuario.");
    }

    setUser(res.data);
    return res.data;
  }, []);

  const loadCorporations = useCallback(async () => {
    const res = await listCorporations();
    if (!res.ok) {
      setCorporations([]);
      return { ok: false, error: res.message };
    }

    const list = Array.isArray(res.data) ? res.data : [];
    setCorporations(list);
    syncActiveCorporation(list);

    return { ok: true, data: list };
  }, [syncActiveCorporation]);

  const bootstrap = useCallback(async () => {
    setError("");
    setStatus("loading");

    const { accessToken } = getStoredTokens();
    if (!accessToken) {
      setUser(null);
      setCorporations([]);
      setStatus("unauthed");
      return { ok: false, reason: "no_token" };
    }

    try {
      const me = await httpRequest("/users/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setUser(me);
      const corpRes = await loadCorporations();
      if (!corpRes.ok) {
        setError(corpRes.error || "Falha ao carregar corporacoes.");
      }

      setStatus("authed");
      return { ok: true };
    } catch (e) {
      clearTokens();
      setUser(null);
      setCorporations([]);
      setStatus("unauthed");
      setError(e?.message || "Falha ao iniciar sessao.");
      return { ok: false, error: e };
    }
  }, [loadMe, loadCorporations]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const loginWithPassword = useCallback(
    async (email, password) => {
      setError("");
      setStatus("loading");

      const res = await loginUser({ email, password });

      if (!res.success) {
        const msg = res.error || "Falha no login";
        setError(msg);
        setStatus("unauthed");
        return { ok: false, error: new Error(msg) };
      }

      const { accessToken } = getStoredTokens();
      if (!accessToken) {
        const msg = "Token nao recebido";
        setError(msg);
        setStatus("unauthed");
        return { ok: false, error: new Error(msg) };
      }

      try {
        await loadMe();
        const corpRes = await loadCorporations();
        if (!corpRes.ok) {
          setError(corpRes.error || "Falha ao carregar corporacoes.");
        }

        setStatus("authed");
        return { ok: true };
      } catch (e) {
        const msg = e?.message || "Falha ao carregar usuario";
        setError(msg);
        setStatus("unauthed");
        return { ok: false, error: e };
      }
    },
    [loadMe, loadCorporations]
  );

  const beginOAuth = useCallback(({ redirectAfterLogin } = {}) => {
    if (redirectAfterLogin) {
      sessionStorage.setItem(SS_POST_AUTH_REDIRECT, String(redirectAfterLogin));
    }
    redirectToAuthorize();
  }, []);

  const exchangeCodeForTokens = useCallback(async ({ code, state } = {}) => {
    if (!code) throw new Error("OAuth code ausente.");

    const qs = new URLSearchParams({ code: String(code) });
    if (state) qs.set("state", String(state));

    const data = await httpRequest(
      `${endpoints.oauth.token}?${qs.toString()}`,
      { method: "GET" }
    );

    if (data?.access_token) localStorage.setItem("access_token", data.access_token);
    if (data?.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
    if (data?.expires_in) setTokenExpiryFromExpiresIn(data.expires_in);

    return { ok: true, data };
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setCorporations([]);
    setStatus("unauthed");
  }, []);

  const value = useMemo(
    () => ({
      status,
      user,
      error,
      isAuthenticated,
      mode,
      corporations,
      corporationId,
      setActiveCorporation,
      bootstrap,
      beginOAuth,
      exchangeCodeForTokens,
      loginWithPassword,
      login: loginWithPassword,
      logout,
    }),
    [
      status,
      user,
      error,
      isAuthenticated,
      mode,
      corporations,
      corporationId,
      setActiveCorporation,
      bootstrap,
      beginOAuth,
      exchangeCodeForTokens,
      loginWithPassword,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider />");
  return ctx;
}
