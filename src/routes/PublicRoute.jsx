import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { status, isAuthenticated } = useAuth();

  // Enquanto valida sessão
  if (status === "loading") {
    return <div style={{ padding: 24 }}>Carregando...</div>;
  }

  // Se já estiver autenticado, não deixa acessar login
  if (isAuthenticated) {
    return <Navigate to="/ambientes" replace />;
  }

  return children;
}
