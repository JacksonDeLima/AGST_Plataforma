import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Equipamentos from "../pages/Equipamentos/Equipamentos";
// import Automacoes from "../pages/Automacoes/Automacoes";
// import Relatorios from "../pages/Relatorios/Relatorios";
// import GerirUsuarios from "../pages/GerirUsuarios/GerirUsuarios";
// import Alarmes from "../pages/Alarmes/Alarmes";
// import Configuracoes from "../pages/Configuracoes/Configuracoes";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} /> 
      <Route path="/equipamentos" element={<Equipamentos />} />
      {/* <Route path="/automacoes" element={<Automacoes />} />
      <Route path="/relatorios" element={<Relatorios />} />
      <Route path="/gerir-usuarios" element={<GerirUsuarios />} />
      <Route path="/alarmes" element={<Alarmes />} />
      <Route path="/configuracoes" element={<Configuracoes />} /> */}
      <Route path="*" element={<h1>404 - Página não encontrada</h1>} />
    </Routes>
  );
}