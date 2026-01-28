<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Automacoes.css";
=======
import { useState } from "react";
import ModalRotinaHorario from "../../components/automacoes/ModalRotinaHorario";
import ModalOcupacao from "../../components/automacoes/ModalOcupacao";
import { useLanguage } from "../../context/LanguageContext";
>>>>>>> 66da59357fb6cc4a4876ddf07f797d039d9f417a

import {
  listarAutomacoes,
  criarAutomacao,
} from "../../services/automacoesService";

<<<<<<< HEAD
const Automacoes = () => {
  const navigate = useNavigate();
=======
export default function Automacoes() {
  const { t } = useLanguage();
  const [mostrarRotina, setMostrarRotina] = useState(false);
  const [mostrarOcupacao, setMostrarOcupacao] = useState(false);
>>>>>>> 66da59357fb6cc4a4876ddf07f797d039d9f417a

  // =========================
  // STATES GERAIS
  // =========================
  const [automacoes, setAutomacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");

  // =========================
  // MODAL CRIAR
  // =========================
  const [showCriarModal, setShowCriarModal] = useState(false);
  const [passo, setPasso] = useState(1);
  const [loadingSalvar, setLoadingSalvar] = useState(false);
  const [erroForm, setErroForm] = useState("");

  const [novaAutomacao, setNovaAutomacao] = useState({
    tipo: "",
    ambiente: "",
    regra: "",
    equipamentos: [],
  });

  // =========================
  // BUSCAR AUTOMAÇÕES
  // =========================
  useEffect(() => {
    listarAutomacoes().then((dados) => {
      setAutomacoes(dados);
      setLoading(false);
    });
  }, []);

  // =========================
  // FILTROS
  // =========================
  const automacoesFiltradas = automacoes.filter((a) => {
    const tipoOk = filtroTipo === "TODOS" || a.tipo === filtroTipo;
    const statusOk = filtroStatus === "TODOS" || a.status === filtroStatus;
    return tipoOk && statusOk;
  });

  // =========================
  // FECHAR MODAL
  // =========================
  const fecharModal = () => {
    setShowCriarModal(false);
    setPasso(1);
    setErroForm("");
    setNovaAutomacao({
      tipo: "",
      ambiente: "",
      regra: "",
      equipamentos: [],
    });
  };

  // =========================
  // CRIAR AUTOMAÇÃO
  // =========================
  const salvarNovaAutomacao = async () => {
    if (!novaAutomacao.tipo || !novaAutomacao.ambiente || !novaAutomacao.regra) {
      setErroForm("Preencha todos os campos obrigatórios");
      return;
    }

    setErroForm("");
    setLoadingSalvar(true);

    const criada = await criarAutomacao({
      ...novaAutomacao,
      equipamentos: ["Ar 01", "Ar 02"], // mock por enquanto
    });

    setAutomacoes((prev) => [...prev, criada]);
    setLoadingSalvar(false);
    fecharModal();
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return <p style={{ padding: 32 }}>Carregando automações...</p>;
  }

  // =========================
  // RENDER
  // =========================
  return (
<<<<<<< HEAD
    <div className="app">
      <div className="automacoes-page">
        {/* HEADER */}
        <header className="page-header">
          <div>
            <h1 className="page-title">Automações</h1>
            <p className="page-subtitle">
              Automatize o funcionamento dos equipamentos
            </p>
          </div>

          <button className="btn-primary" onClick={() => setShowCriarModal(true)}>
            + Criar Automação
          </button>
        </header>

        {/* MINI DASHBOARD */}
        <div className="mini-dashboard">
          <div className="dashboard-card ativo">
            <span className="dash-number">
              {automacoes.filter((a) => a.status === "ATIVA").length}
            </span>
            <span className="dash-label">Ativas Agora</span>
          </div>

          <div className="dashboard-card">
            <span className="dash-number">
              {automacoes.filter((a) => a.tipo === "HORARIO").length}
            </span>
            <span className="dash-label">Por Horário</span>
          </div>

          <div className="dashboard-card">
            <span className="dash-number">
              {automacoes.filter((a) => a.tipo === "OCUPACAO").length}
            </span>
            <span className="dash-label">Por Ocupação</span>
          </div>

          <div className="dashboard-card erro">
            <span className="dash-number">0</span>
            <span className="dash-label">Com Erro</span>
          </div>
        </div>

        {/* FILTROS */}
        <div className="filtros-container">
          <button
            className="btn-filtros"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            Filtros
          </button>

          {mostrarFiltros && (
            <div className="filtros-box">
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="TODOS">Todos os tipos</option>
                <option value="HORARIO">Por Horário</option>
                <option value="OCUPACAO">Por Ocupação</option>
              </select>

              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="TODOS">Todos os status</option>
                <option value="ATIVA">Ativas</option>
                <option value="PAUSADA">Pausadas</option>
              </select>

              <button
                className="btn-clear"
                onClick={() => {
                  setFiltroTipo("TODOS");
                  setFiltroStatus("TODOS");
                }}
              >
                Limpar
              </button>
            </div>
          )}
        </div>

        {/* LISTA */}
        <div className="automacoes-list">
          {automacoesFiltradas.map((a) => (
            <div className="automacao-card" key={a.id}>
              <div className="automacao-header">
                <h3>{a.nome}</h3>

                <label className="switch">
                  <input type="checkbox" checked={a.status === "ATIVA"} readOnly />
                  <span className="slider" />
                </label>
              </div>

              <p>
                {a.tipo === "HORARIO" ? "⏰" : "👤"} {a.regra}
              </p>

              <p>
                📍 {a.ambiente} · {a.equipamentos.length} equipamentos
              </p>

              <span className="automacao-status ativo">
                🟢 Executando agora
              </span>

              <div className="automacao-actions">
                <button
                  className="btn-secondary"
                  onClick={() => navigate(`/automacoes/${a.id}`)}
                >
                  Detalhes
                </button>

                <button
                  className="btn-secondary"
                  onClick={() =>
                    navigate(`/automacoes/${a.id}/historico`)
                  }
                >
                  Histórico
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL CRIAR */}
        {showCriarModal && (
          <div className="modal-overlay" onClick={fecharModal}>
            <div
              className="modal-content modal-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Criar Automação</h2>
                <span>Passo {passo} de 5</span>
              </div>

              <div className="modal-body">
                {passo === 1 && (
                  <>
                    <h3>Tipo de automação</h3>
                    <button
                      onClick={() => {
                        setNovaAutomacao({ ...novaAutomacao, tipo: "HORARIO" });
                        setPasso(2);
                      }}
                    >
                      ⏰ Por Horário
                    </button>
                    <button
                      onClick={() => {
                        setNovaAutomacao({ ...novaAutomacao, tipo: "OCUPACAO" });
                        setPasso(2);
                      }}
                    >
                      👤 Por Ocupação
                    </button>
                  </>
                )}

                {passo === 2 && (
                  <>
                    <h3>Ambiente</h3>
                    <input
                      placeholder="Ex: Escritório"
                      value={novaAutomacao.ambiente}
                      onChange={(e) =>
                        setNovaAutomacao({
                          ...novaAutomacao,
                          ambiente: e.target.value,
                        })
                      }
                    />
                  </>
                )}

                {passo === 3 && (
                  <>
                    <h3>Regra</h3>
                    <input
                      placeholder="Ex: 22:00 → 06:00"
                      value={novaAutomacao.regra}
                      onChange={(e) =>
                        setNovaAutomacao({
                          ...novaAutomacao,
                          regra: e.target.value,
                        })
                      }
                    />
                  </>
                )}

                {passo === 4 && (
                  <>
                    <h3>Resumo</h3>
                    <p><strong>Tipo:</strong> {novaAutomacao.tipo}</p>
                    <p><strong>Ambiente:</strong> {novaAutomacao.ambiente}</p>
                    <p><strong>Regra:</strong> {novaAutomacao.regra}</p>

                    <div className="impact-preview">
                      <p>⚡ Economia estimada:</p>
                      <strong>~ 120 kWh / mês</strong>
                      <p>💰 Economia financeira:</p>
                      <strong>~ R$ 95,00 / mês</strong>
                    </div>
                  </>
                )}

                {erroForm && <p className="form-error">{erroForm}</p>}
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={fecharModal}>
                  Cancelar
                </button>

                {passo < 4 && (
                  <button
                    className="btn-primary"
                    onClick={() => setPasso(passo + 1)}
                  >
                    Próximo →
                  </button>
                )}

                {passo === 4 && (
                  <button
                    className="btn-primary"
                    disabled={loadingSalvar}
                    onClick={salvarNovaAutomacao}
                  >
                    {loadingSalvar ? "Salvando..." : "Criar Automação"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
=======
    <div className="automacoes-container">
      <div className="automacoes-header">
        <div>
          <h1>{t('automacoes.title')}</h1>
          <p>{t('automacoes.subtitle')}</p>
        </div>

        <div className="automacoes-actions">
          <button
            className="btn-primary"
            onClick={() => setMostrarOcupacao(true)}
          >
            {t('automacoes.novaOcupacao')}
          </button>

          <button
            className="btn-secondary"
            onClick={() => setMostrarRotina(true)}
          >
            {t('automacoes.novaRotina')}
          </button>

        </div>
      </div>

      {/* AUTOMAÇÕES POR OCUPAÇÃO */}
      <div className="automacoes-card">
        <div className="automacoes-card-header">
          <div className="title">
            <span>👥</span>
            <h2>{t('automacoes.porOcupacao')}</h2>
          </div>

          <div className="status">
            <span className="ativo">0 {t('automacoes.ativas')}</span>
            <span className="inativo">0 {t('automacoes.inativas')}</span>
          </div>
        </div>

        <div className="automacoes-empty">
          {t('automacoes.nenhumaOcupacao')}
        </div>
      </div>

      {/* ROTINAS POR HORÁRIO */}
      <div className="automacoes-card">
        <div className="automacoes-card-header">
          <div className="title">
            <span>🕒</span>
            <h2>{t('automacoes.porHorario')}</h2>
          </div>

          <div className="status">
            <span className="ativo">0 {t('automacoes.ativas')}</span>
            <span className="inativo">0 {t('automacoes.inativas')}</span>
          </div>
        </div>

        <div className="automacoes-empty">
          {t('automacoes.nenhumaRotina')}
        </div>
      </div>
      {mostrarRotina && (
        <ModalRotinaHorario onClose={() => setMostrarRotina(false)} />
      )}

      {mostrarOcupacao && (
        <ModalOcupacao onClose={() => setMostrarOcupacao(false)} />
      )}

>>>>>>> 66da59357fb6cc4a4876ddf07f797d039d9f417a
    </div>
  );
};

export default Automacoes;
