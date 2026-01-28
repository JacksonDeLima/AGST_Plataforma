import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function PublicRoute({ children }) {
  const { status } = useAuth();

  if (status === "loading") {
    return <div style={{ padding: 24 }}>Carregando sessão...</div>;
  }

  // Se já estiver autenticado, não deixa voltar pro login
  if (status === "authed") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
