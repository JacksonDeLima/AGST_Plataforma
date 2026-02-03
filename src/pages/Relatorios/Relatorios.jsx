import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Relatorios.css";
import { getUsersByCorporation, getEnergyConsumptionReport } from "../../services/reportsService";
import { useLanguage } from "../../context/LanguageContext";
import * as XLSX from "xlsx";

import {LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer,BarChart,Bar,PieChart,Pie,Cell} from "recharts";

/* CORES DO GRÁFICO DE PIZZA */
const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed"];

function EnergyReport({ data }) {
  return (
    <div className="energy-report">

      {/* =====================
          VISÃO GERAL
      ===================== */}
      <section className="energy-section">
        <h2 className="section-title">Visão Geral</h2>

        <div className="kpi-grid">
          <div className="kpi-card">
            <span>Total consumido</span>
            <strong>{data.summary.totalKwh} kWh</strong>
          </div>

          <div className="kpi-card">
            <span>Média por dispositivo</span>
            <strong>{data.summary.avgPerDevice} kWh</strong>
          </div>

          <div className="kpi-card">
            <span>Eficiência média</span>
            <strong>{data.summary.avgEfficiency} kWh/h</strong>
          </div>

          <div className="kpi-card warning">
            <span>Fora do horário</span>
            <strong>{data.summary.outOfScheduleDevices}</strong>
          </div>
        </div>
      </section>

      {/* =====================
          EVOLUÇÃO TEMPORAL
      ===================== */}
      <section className="energy-section">
        <h2 className="section-title">Evolução do consumo</h2>

        <div className="chart-card">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.timeline}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="kwh"
                stroke="#2563eb"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* =====================
          DISTRIBUIÇÃO
      ===================== */}
      <section className="energy-section">
        <h2 className="section-title">Distribuição do consumo</h2>

        <div className="charts-grid">
          <div className="chart-card">
            <h4>Por dispositivo</h4>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.byDevice}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="kwh" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h4>Consumo por ambiente</h4>
            <ResponsiveContainer width="100%" height={260}>
             <BarChart data={data.byEnvironment}
                layout="vertical"
                margin={{ left: 40 }}
                >
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* =====================
          RANKINGS
      ===================== */}
      <section className="energy-section">
        <h2 className="section-title">Performance dos dispositivos</h2>

        <div className="ranking-grid">
          <div className="ranking-card">
            <h4>Maior consumo</h4>
            {data.byDevice
              .slice()
              .sort((a, b) => b.kwh - a.kwh)
              .slice(0, 5)
              .map((d) => (
                <div key={d.name} className="ranking-row">
                  <span>{d.name}</span>
                  <strong>{d.kwh} kWh</strong>
                </div>
              ))}
          </div>

          <div className="ranking-card">
            <h4>Mais eficientes</h4>
            {data.byDevice
              .slice()
              .sort((a, b) => a.efficiency - b.efficiency)
              .slice(0, 5)
              .map((d) => (
                <div key={d.name} className="ranking-row">
                  <span>{d.name}</span>
                  <strong>{d.efficiency} kWh/h</strong>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* =====================
          ALERTAS
      ===================== */}
      {data.alerts?.length > 0 && (
        <section className="energy-section">
          <h2 className="section-title">Alertas operacionais</h2>

          <div className="alert-card">
            {data.alerts.map((a, i) => (
              <p key={i}>
                ⚠ <strong>{a.device}</strong> — {a.type}
              </p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


/* =========================
        COMPONENTE MAIN
========================= */
export default function Relatorios() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeReport, setActiveReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [corporations, setCorporations] = useState([]);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  async function openUsersByCorporationReport() {
    try {
      setActiveReport("USERS_BY_CORP");
      setLoading(true);
      setError(null);

      const response = await getUsersByCorporation();
      setCorporations(response);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar relatório");
    } finally {
      setLoading(false);
    }
  }

  async function openEnergyReport() {
    try {
      setActiveReport("ENERGY");
      setLoading(true);
      setError(null);

      const response = await getEnergyConsumptionReport();
      setData(response);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar relatório");
    } finally {
      setLoading(false);
    }
  }

  function exportCorporationToExcel(corp) {
    const rows = corp.members.map((user) => ({
      Nome: user.full_name,
      Email: user.email,
      Perfil: user.role,
      Status: user.member_status
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuários");

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
        <h1>{t("relatorios.title")}</h1>
        <p className="page-subtitle">{t("relatorios.subtitle")}</p>
      </div>

      {/* LISTA DE RELATÓRIOS */}
      {!activeReport && (
        <div className="relatorios-list">
          <div
            className="relatorio-card"
            onClick={openUsersByCorporationReport}
          >
            <h3>{t("relatorios.usuariosPorCorp")}</h3>
            <p>{t("relatorios.usuariosPorCorpDesc")}</p>
          </div>

          <div className="relatorio-card" onClick={openEnergyReport}>
            <h3>Consumo de Energia</h3>
            <p>Visão analítica por dispositivos, ambientes e eficiência</p>
          </div>
        </div>
      )}

      {/* BOTÃO VOLTAR */}
      {activeReport && (
        <button className="btn-back" onClick={() => setActiveReport(null)}>
          {t("relatorios.voltar")}
        </button>
      )}

      {loading && <p className="loading">{t("relatorios.carregando")}</p>}
      {error && <p className="error">{error}</p>}

      {/* RELATÓRIO: USUÁRIOS POR CORP */}
      {activeReport === "USERS_BY_CORP" && !loading && !error && (
        <div className="report-container">
          {corporations.map((corp) => (
            <div key={corp.corporationId} className="corp-section">
              <div className="corp-header">
                <h2 className="corp-title">{corp.corporationName}</h2>

                <button
                  className="btn-export"
                  onClick={() => exportCorporationToExcel(corp)}
                  title="Exportar para Excel"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-down-icon lucide-file-down">
                    <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/>
                    <path d="M14 2v5a1 1 0 0 0 1 1h5"/>
                    <path d="M12 18v-6"/>
                    <path d="m9 15 3 3 3-3"/>
                  </svg>
                </button>
              </div>

              <div className="stats">
                <div className="stat-card">
                  <span>{t("relatorios.total")}</span>
                  <strong>{corp.stats.total}</strong>
                </div>
                <div className="stat-card">
                  <span>{t("relatorios.admins")}</span>
                  <strong>{corp.stats.admins}</strong>
                </div>
                <div className="stat-card">
                  <span>{t("relatorios.usuarios")}</span>
                  <strong>{corp.stats.users}</strong>
                </div>
                <div className="stat-card">
                  <span>{t("relatorios.pendentes")}</span>
                  <strong>{corp.stats.pending}</strong>
                </div>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>{t("relatorios.nome")}</th>
                      <th>{t("relatorios.email")}</th>
                      <th>{t("relatorios.perfil")}</th>
                      <th>{t("relatorios.status")}</th>
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

      {/* RELATÓRIO: ENERGIA */}
      {activeReport === "ENERGY" && data && (
        <div className="report-container">
          <EnergyReport data={data} />
        </div>
      )}
    </div>
  );
}
