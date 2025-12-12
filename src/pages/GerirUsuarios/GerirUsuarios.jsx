import React, { useState } from "react";
import "./GerirUsuarios.css";
import NavBar from "../../components/NavBar";

const GerirUsuarios = () => {
  const [usuarios] = useState([
    { id: 1, nome: "João", email: "joao@empresa.com", perfil: "Admin", ultimoAcesso: "12/09/2025" },
    { id: 2, nome: "João", email: "joao@empresa.com", perfil: "Admin", ultimoAcesso: "12/09/2025" },
    { id: 3, nome: "João", email: "joao@empresa.com", perfil: "Admin", ultimoAcesso: "12/09/2025" },
    { id: 4, nome: "João", email: "joao@empresa.com", perfil: "Admin", ultimoAcesso: "12/09/2025" },
    { id: 5, nome: "João", email: "joao@empresa.com", perfil: "Admin", ultimoAcesso: "12/09/2025" },
  ]);

  const [busca, setBusca] = useState("");

  return (
    <div className="app">
      <NavBar />

      <div className="main-content">
        <div className="gerir-usuarios-page">
          
          {/* HEADER */}
          <div className="page-header">
            <div className="header-left">
              <h1 className="page-title">Gerir Usuários</h1>
              <p className="page-subtitle">Gerencie usuários e permissões de acesso</p>
            </div>

            <div className="header-right">
              <div className="ativos-count">
                <span className="status-dot ativo"></span>
                <span>Ativos: 6/8</span>
              </div>
              <button className="btn-primary">+ Adicionar Usuário</button>
              <button className="btn-filtros">
                <span className="filtros-icon">☰</span>
                Filtros
              </button>
            </div>
          </div>

          {/* BUSCA */}
          <div className="search-bar">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar"
                className="search-input"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>

          {/* TABELA */}
          <div className="table-container">
            <table className="gerir-usuarios-table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Email</th>
                  <th>Perfil</th>
                  <th>Último Acesso</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {usuarios
                  .filter(u =>
                    u.nome.toLowerCase().includes(busca.toLowerCase()) ||
                    u.email.toLowerCase().includes(busca.toLowerCase())
                  )
                  .map((u) => (
                    <tr key={u.id}>
                      <td className="usuario-cell">{u.nome}</td>
                      <td className="email-cell">{u.email}</td>
                      <td><span className="perfil-badge">{u.perfil}</span></td>
                      <td>{u.ultimoAcesso}</td>
                      <td>
                        <button className="btn-editar">
                          <span className="editar-icon">✏️</span> Editar
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GerirUsuarios;
