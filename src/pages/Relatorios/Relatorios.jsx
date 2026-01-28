// src/pages/Relatorios/Relatorios.jsx
import React, { useState } from "react";
import "./Relatorios.css";
import { getUsersByCorporation } from "../../services/reportsService";

export default function Relatorios() {
  const [activeReport, setActiveReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [corporations, setCorporations] = useState([]);
  const [error, setError] = useState(null);

  async function openUsersByCorporationReport() {
    try {
      setActiveReport("USERS_BY_CORP");
      setLoading(true);
      setError(null);

      const data = await getUsersByCorporation();
      setCorporations(data);
    } catch (err) {
      console.error("[Relatórios]", err);
      setError("Erro ao carregar relatório");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relatorios-page">
      <div className="page-header">
        <h1>Relatórios</h1>
        <p className="page-subtitle">Visualizações gerenciais do sistema</p>
      </div>

      {!activeReport && (
        <div className="relatorios-list">
          <div
            className="relatorio-card"
            onClick={openUsersByCorporationReport}
            role="button"
            tabIndex={0}
          >
            <h3>Usuários por corporação</h3>
            <p>Visualize usuários, perfis e status por corporação</p>
          </div>
        </div>
      )}

      {activeReport === "USERS_BY_CORP" && (
        <div className="report-container">
          <button className="btn-back" onClick={() => setActiveReport(null)}>
            ← Voltar
          </button>

          {loading && <p className="loading">Carregando relatório...</p>}
          {error && <p className="error">{error}</p>}

          {!loading && !error && corporations.length === 0 && (
            <p className="loading">
              Nenhuma corporação com usuários disponível.
            </p>
          )}

          {!loading &&
            !error &&
            corporations.map((corp) => (
              <div key={corp.corporationId} className="corp-section">
                <h2 className="corp-title">{corp.corporationName}</h2>

                <div className="stats">
                  <div className="stat-card">
                    <span>Total</span>
                    <strong>{corp.stats.total}</strong>
                  </div>
                  <div className="stat-card">
                    <span>Admins</span>
                    <strong>{corp.stats.admins}</strong>
                  </div>
                  <div className="stat-card">
                    <span>Usuários</span>
                    <strong>{corp.stats.users}</strong>
                  </div>
                  <div className="stat-card">
                    <span>Pendentes</span>
                    <strong>{corp.stats.pending}</strong>
                  </div>
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Perfil</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {corp.members.map((user) => (
                        <tr key={user.user_id}>
                          <td>{user.full_name}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`badge role-${user.role}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge status-${user.member_status}`}
                            >
                              {user.member_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
