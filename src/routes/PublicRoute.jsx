import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function PublicRoute({ children }) {
  const { status } = useAuth();

  if (status === "loading") {
    return <div style={{ padding: 24 }}>Carregando sessÃ£o...</div>;
  }

  // Se jÃ¡ estiver autenticado, nÃ£o deixa voltar pro login
  if (status === "authed") {
    return <Navigate to="/ambientes" replace />;
  }

  return children;
}

