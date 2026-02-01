// src/pages/Relatorios/Relatorios.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Relatorios.css";
import { getUsersByCorporation } from "../../services/reportsService";
import { useLanguage } from "../../context/LanguageContext";
import * as XLSX from "xlsx";

export default function Relatorios() {
  const { t } = useLanguage();
  const navigate = useNavigate();
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

  /** EXPORTAÇÃO PARA EXCEL (POR CORPORAÇÃO) */
  function exportCorporationToExcel(corp) {
    const rows = corp.members.map((user) => ({
      Nome: user.full_name,
      Email: user.email,
      Perfil: user.role,
      Status: user.member_status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Usuários"
    );

    const fileName = `usuarios_${corp.corporationName
      .toLowerCase()
      .replace(/\s+/g, "_")}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  }

  return (
    <div className="relatorios-page">
      <button
        className="btn-secondary"
        style={{ marginBottom: "20px" }}
        onClick={() => navigate(-1)}
      >
        ← Voltar
      </button>
      <div className="page-header">
        <h1>{t('relatorios.title')}</h1>
        <p className="page-subtitle">{t('relatorios.subtitle')}</p>
      </div>

      {!activeReport && (
        <div className="relatorios-list">
          <div
            className="relatorio-card"
            onClick={openUsersByCorporationReport}
            role="button"
            tabIndex={0}
          >
            <h3>{t('relatorios.usuariosPorCorp')}</h3>
            <p>{t('relatorios.usuariosPorCorpDesc')}</p>
          </div>
        </div>
      )}

      {activeReport === "USERS_BY_CORP" && (
        <div className="report-container">
          <button className="btn-back" onClick={() => setActiveReport(null)}>
            {t('relatorios.voltar')}
          </button>

          {loading && <p className="loading">{t('relatorios.carregando')}</p>}
          {error && <p className="error">{error}</p>}

          {!loading &&
            !error &&
            corporations.map((corp) => (
              <div key={corp.corporationId} className="corp-section">
                {/* HEADER DA CORPORAÇÃO */}
                <div className="corp-header">
                  <h2 className="corp-title">{corp.corporationName}</h2>

                  <button
                    className="btn-export"
                    title="Exportar para Excel"
                    onClick={() => exportCorporationToExcel(corp)}
                    aria-label="Exportar para Excel"
                  >
                    <svg
                      className="icon-excel"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      {/* Documento */}
                      <path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                      {/* Dobra */}
                      <path d="M15 2v5h5" />
                    </svg>
                  </button>
                </div>



                <div className="stats">
                  <div className="stat-card">
                    <span>{t('relatorios.total')}</span>
                    <strong>{corp.stats.total}</strong>
                  </div>
                  <div className="stat-card">
                    <span>{t('relatorios.admins')}</span>
                    <strong>{corp.stats.admins}</strong>
                  </div>
                  <div className="stat-card">
                    <span>{t('relatorios.usuarios')}</span>
                    <strong>{corp.stats.users}</strong>
                  </div>
                  <div className="stat-card">
                    <span>{t('relatorios.pendentes')}</span>
                    <strong>{corp.stats.pending}</strong>
                  </div>
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>{t('relatorios.nome')}</th>
                        <th>{t('relatorios.email')}</th>
                        <th>{t('relatorios.perfil')}</th>
                        <th>{t('relatorios.status')}</th>
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
