import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { status, mode, beginOAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (mode === "oauth" && status === "unauthed") {
      const target =
        location.pathname +
        location.search +
        location.hash;

      beginOAuth({ redirectAfterLogin: target });
    }
  }, [mode, status]);

  // Regra de ouro: nao decide nada enquanto estiver carregando
  if (status === "loading") {
    return (
      <div style={{ padding: 24 }}>
        Restaurando sessao...
      </div>
    );
  }

  if (status !== "authed") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
