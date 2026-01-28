import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Equipamentos from "../pages/Equipamentos/Equipamentos";
import EsqueciSenha from "../pages/EsqueciSenha/EsqueciSenha";
import RedefinirSenha from "../pages/RedefinirSenha/index";
import AlterarSenha from "../pages/AlterarSenha/index";
import CriarConta from "../pages/CriarConta/CriarConta";
import Activation from "../pages/Activation/activation";
import Automacoes from "../pages/Automacoes/Automacoes";
import GerirUsuarios from "../pages/GerirUsuarios/GerirUsuarios";
import CorporationsPage from "../pages/Corporacao/CorporationsPage";
import CorporationDetails from "../pages/Corporacao/CorporationDetails";
import Relatorios from "../pages/Relatorios/Relatorios";

import AppLayout from "../pages/Layouts/AppLayout";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

import OAuthCallback from "../pages/OAuthCallback/OAuthCallback";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ===== Callback OAuth (pública) ===== */}
      <Route path="/oauth/callback" element={<OAuthCallback />} />

      {/* ===== Rotas públicas ===== */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route path="/criarConta" element={<CriarConta />} />
      <Route path="/activation" element={<Activation />} />
      <Route path="/esqueciSenha" element={<EsqueciSenha />} />

      {/* Reset via link do e-mail */}
      <Route path="/redefinirSenha" element={<RedefinirSenha />} />
      <Route path="/users/reset-password" element={<RedefinirSenha />} />

      {/* ===== Rotas internas (privadas) ===== */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/equipamentos" element={<Equipamentos />} />
        <Route path="/automacoes" element={<Automacoes />} />
        <Route path="/gerir-usuarios" element={<GerirUsuarios />} />
        <Route path="/corporations" element={<CorporationsPage />} />
        <Route path="/corporations/:corporationId" element={<CorporationDetails />} />
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="/alterarSenha" element={<AlterarSenha />} />
      </Route>

      <Route path="*" element={<h1>404 - Página não encontrada</h1>} />
    </Routes>
  );
}
