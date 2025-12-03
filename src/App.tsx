import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import DeviceListPage from './pages/DeviceListPage';
import CreateDevicePage from './pages/CreateDevicePage';
import EditDevicePage from './pages/EditDevicePage';

// Componente de Layout para ter um menu de navegação consistente
function AppLayout() {
  const navStyle = {
    backgroundColor: '#f0f0f0',
    padding: '10px 20px',
    borderBottom: '1px solid #ccc',
    marginBottom: '20px',
  };

  const linkStyle = {
    marginRight: '15px',
    textDecoration: 'none',
    color: '#333',
    fontWeight: 'bold',
  };

  return (
    <div>
      <nav style={navStyle}>
        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/equipamentos" style={linkStyle}>Equipamentos</Link>
      </nav>
      <main style={{ padding: '0 20px' }}>
        {/* O Outlet renderiza a rota filha correspondente */}
        <Outlet />
      </main>
    </div>
  );
}

// Componente "Not Found" para rotas que não existem
function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>404 - Página Não Encontrada</h1>
      <p>A página que você está procurando não existe.</p>
      <Link to="/">Voltar para a Home</Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota principal com o layout de navegação */}
        <Route path="/" element={<AppLayout />}>
          {/* Rota Index (página inicial, renderizada no Outlet do AppLayout) */}
          <Route index element={<h2>Bem-vindo à Plataforma AGST</h2>} />
          
          {/* Rotas de Equipamentos */}
          <Route path="/equipamentos" element={<DeviceListPage />} />
          <Route path="/equipamentos/cadastrar" element={<CreateDevicePage />} />
          <Route path="/equipamentos/:id/editar" element={<EditDevicePage />} />
        </Route>

        {/* Rota para qualquer outro caminho não encontrado */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
