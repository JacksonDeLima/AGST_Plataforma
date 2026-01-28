import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { status, mode, beginOAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (mode === "oauth" && status === "unauthed") {
      const target = `${location.pathname}${location.search || ""}${location.hash || ""}`;
      beginOAuth({ redirectAfterLogin: target });
    }
  }, [mode, status, beginOAuth, location.pathname, location.search, location.hash]);

  if (status === "loading") {
    return <div style={{ padding: 24 }}>Carregando sessão...</div>;
  }

  if (status !== "authed") {
    // no oauth, o effect acima dispara o redirect automático
    return <div style={{ padding: 24 }}>Redirecionando para login...</div>;
  }

  return children;
}
