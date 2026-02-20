import React, { useState, useEffect } from "react";
import { Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import { useLanguage } from "../../context/LanguageContext";
import {
  listarAmbientes,
  criarAmbiente,
  editarAmbiente,
  deletarAmbiente,
} from "../../services/ambientesService";
import { useAuth } from "../../context/AuthContext";
import { useAmbiente } from "../../context/AmbienteContext";
import ConfirmDialog from "../../components/ConfirmDialog";

import "./Ambientes.css";
import { useToast } from "../../context/ToastContext";

const Ambientes = () => {
  const { showToast, addNotification } = useToast();

  const [statusFiltro, setStatusFiltro] = useState("TODOS");

  const { corporationId } = useAuth();
  const { setActiveAmbiente } = useAmbiente();

  const { t } = useLanguage();
  const navigate = useNavigate();

  const [ambientes, setAmbientes] = useState(() => []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buscaAmbiente, setBuscaAmbiente] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  useEffect(() => {
    if (!corporationId) {
      setAmbientes([]);
      return;
    }

    setLoading(true);
    setError("");

    listarAmbientes(corporationId)
      .then((lista) => {
        console.log("Corporation ID:", corporationId);
        console.log("Ambientes carregados:", lista);

        setAmbientes(Array.isArray(lista) ? lista : []);
      })
      .catch(() => {
        setError(t('ambientesPage.erroCarregar'));
        setAmbientes([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [corporationId]);

  const [showModal, setShowModal] = useState(false);
  const [erroModal, setErroModal] = useState("");

  const [modoModal, setModoModal] = useState("CRIAR"); // CRIAR | EDITAR
  const [ambienteEditando, setAmbienteEditando] = useState(null);

  const [novoAmbiente, setNovoAmbiente] = useState({
    nome: "",
    tipo: "Sala",
    equipamentos: [],
    status: "OFFLINE",
  });

  const equipamentosDisponiveis = [
    { id: 1, nome: "Samsung 1" },
    { id: 2, nome: "Samsung 2" },
    { id: 3, nome: "Samsung 3" },
    { id: 4, nome: "Samsung 4" },
    { id: 5, nome: "Samsung 5" },
    { id: 6, nome: "Samsung 6" },
    { id: 7, nome: "Samsung 7" },
  ];

  const prioridadeStatus = {
    PARCIAL: 1,
    OFFLINE: 2,
    MANUTENCAO: 3,
    ONLINE: 4,
  };

  /* =========================
     FILTRO
  ========================= */
  const termoBusca = buscaAmbiente.trim().toLowerCase();
  const ambientesFiltrados = (Array.isArray(ambientes) ? ambientes : [])
    .filter((ambiente) => {
      const nome = String(ambiente.nome || "").toLowerCase();
      const tipo = String(ambiente.tipo || "").toLowerCase();
      const buscaOk =
        !termoBusca || nome.includes(termoBusca) || tipo.includes(termoBusca);
      if (!buscaOk) return false;

      if (statusFiltro === "TODOS") return true;
      return ambiente.status?.toUpperCase() === statusFiltro;
    })
    .sort((a, b) => {
      const statusA = a.status?.toUpperCase();
      const statusB = b.status?.toUpperCase();
      return (
        (prioridadeStatus[statusA] || 99) - (prioridadeStatus[statusB] || 99)
      );
    });

  /* =========================
     CHECKBOX
  ========================= */
  const toggleEquipamento = (equipamentoId) => {
    setNovoAmbiente((prev) => ({
      ...prev,
      equipamentos: prev.equipamentos.includes(equipamentoId)
        ? prev.equipamentos.filter((id) => id !== equipamentoId)
        : [...prev.equipamentos, equipamentoId],
    }));
  };

  /* =========================
     AÇÕES
  ========================= */
  const handleAdicionarAmbiente = () => {
    setModoModal("CRIAR");
    setAmbienteEditando(null);
    setErroModal("");
    setNovoAmbiente({
      nome: "",
      tipo: "Sala",
      equipamentos: [],
      status: "OFFLINE",
    });
    setShowModal(true);
  };

  const handleEditarAmbiente = (ambiente) => {
    setModoModal("EDITAR");
    setAmbienteEditando(ambiente);
    setErroModal("");

    setNovoAmbiente({
      nome: ambiente.nome,
      tipo: ambiente.tipo,
      equipamentos: ambiente.equipamentos?.map((e) => e.id) || [],
      status: ambiente.status || "OFFLINE",
    });

    setShowModal(true);
  };

  const handleFecharModal = () => {
    setShowModal(false);
    setErroModal("");
    setAmbienteEditando(null);
  };

  const handleSalvarAmbiente = async () => {
    if (!novoAmbiente.nome) {
      setErroModal(t('ambientesPage.erroNome'));
      showToast({
        type: "error",
        message: t('ambientesPage.erroNome'),
      });
      return;
    }

    if (novoAmbiente.equipamentos.length === 0) {
      setErroModal(t('ambientesPage.erroEquipamento'));
      showToast({
        type: "error",
        message: t('ambientesPage.erroEquipamento'),
      });
      return;
    }

    try {
      const equipamentosObjetos = novoAmbiente.equipamentos.map((id) => {
        const eqOriginal = equipamentosDisponiveis.find((e) => e.id === id);
        return { ...eqOriginal, ligado: false };
      });

      if (modoModal === "CRIAR") {
        const novo = await criarAmbiente(corporationId, {
          nome: novoAmbiente.nome,
          tipo: novoAmbiente.tipo,
          temperatura: 25,
          potencia: 0,
          status: novoAmbiente.status?.toUpperCase(),
          equipamentos: equipamentosObjetos,
          pausado: false,
          ultimaAtualizacao: new Date().toISOString(),
        });

        setAmbientes((prev) => [...prev, novo]);

        showToast({
          type: "success",
          message: t('ambientesPage.erroCriado'),
        });
      }

      if (modoModal === "EDITAR" && ambienteEditando) {
        const atualizado = await editarAmbiente(
          corporationId,
          ambienteEditando.id,
          {
            nome: novoAmbiente.nome,
            tipo: novoAmbiente.tipo,
            status: novoAmbiente.status?.toUpperCase(),
            equipamentos: equipamentosObjetos,
          },
        );

        setAmbientes((prev) =>
          prev.map((a) => (a.id === ambienteEditando.id ? atualizado : a)),
        );

        showToast({
          type: "success",
          message: t('ambientesPage.erroAtualizado'),
        });
      }

      handleFecharModal();
    } catch (err) {
      showToast({
        type: "error",
        message: t('ambientesPage.erroSalvar'),
      });
    }
  };

  const handleExcluirAmbiente = (ambiente) => {
    setConfirmTarget(ambiente);
    setConfirmOpen(true);
  };

  const confirmarExclusaoAmbiente = async () => {
    if (!confirmTarget) return;

    try {
      await deletarAmbiente(corporationId, confirmTarget.id);

      setAmbientes((prev) => prev.filter((a) => a.id !== confirmTarget.id));

      const ambienteAtivo = localStorage.getItem("agst_active_ambiente_id");
      if (String(ambienteAtivo) === String(confirmTarget.id)) {
        localStorage.removeItem("agst_active_ambiente_id");
      }

      showToast({
        type: "success",
        message: t('ambientesPage.excluido'),
      });
    } catch (err) {
      showToast({
        type: "error",
        message: t('ambientesPage.erroExcluir'),
      });
    } finally {
      setConfirmOpen(false);
      setConfirmTarget(null);
    }
  };
  /* =========================
     NAVEGAÇÃO
  ========================= */
  const handleControlar = (ambiente) => {
    setActiveAmbiente(ambiente.id);
    addNotification({
      type: "info",
      message: t('ambientesPage.enviadoAutomacoes').replace('{name}', ambiente.nome),
    });
    navigate("/automacoes");
  };

  const handleTogglePausa = (ambiente) => {
    const pausado = !ambiente.pausado;
    setAmbientes((prev) =>
      prev.map((a) => (a.id === ambiente.id ? { ...a, pausado } : a)),
    );
    addNotification({
      type: "info",
      message: pausado ? t('ambientesPage.pausadoMsg').replace('{name}', ambiente.nome) : t('ambientesPage.ativadoMsg').replace('{name}', ambiente.nome),
    });
  };

  function getTextoStatus(ambiente) {
    const status = ambiente.status?.toUpperCase();
    const total = ambiente.equipamentos?.length || 0;
    const ligados = ambiente.equipamentos?.filter((e) => e.ligado).length || 0;

    if (status === "MANUTENCAO") {
      return (
        <>
          <Wrench size={14} />
          {t('ambientesPage.manutencaoAtendimento')}
        </>
      );
    }

    if (status === "OFFLINE") {
      return `🔴 ${t('ambientesPage.offlineNenhum')}`;
    }

    if (status === "PARCIAL") {
      return `🟡 ${t('ambientesPage.parcialLigados').replace('{on}', ligados).replace('{total}', total)}`;
    }

    if (status === "ONLINE") {
      return `🟢 ${t('ambientesPage.onlineTodos')}`;
    }

    return status;
  }

  function podeControlar(ambiente) {
    const status = ambiente.status?.toUpperCase();
    return status === "ONLINE" || status === "PARCIAL";
  }

  function tempoDesdeAtualizacao(data) {
    const agora = new Date();
    const atualizacao = new Date(data);

    const diferencaMs = agora - atualizacao;
    const diferencaMin = Math.floor(diferencaMs / 60000);

    if (diferencaMin < 1) return t('ambientesPage.atualizadoAgora');
    if (diferencaMin === 1) return t('ambientesPage.atualizado1Min');
    if (diferencaMin < 60) return t('ambientesPage.atualizadoMin').replace('{n}', diferencaMin);

    const diferencaHoras = Math.floor(diferencaMin / 60);
    if (diferencaHoras === 1) return t('ambientesPage.atualizado1Hora');
    if (diferencaHoras < 24) return t('ambientesPage.atualizadoHoras').replace('{n}', diferencaHoras);

    const diferencaDias = Math.floor(diferencaHoras / 24);
    return t('ambientesPage.atualizadoDias').replace('{n}', diferencaDias);
  }

  function mostrarTemperatura(ambiente) {
    const status = ambiente.status?.toUpperCase();
    if (status === "OFFLINE") {
      return "—";
    }

    if (status === "MANUTENCAO") {
      return `${ambiente.temperatura}°C ${t('ambientesPage.ultimaLeitura')}`;
    }

    return `${ambiente.temperatura}°C`;
  }

  function mostrarPotencia(ambiente) {
    const status = ambiente.status?.toUpperCase();
    if (status === "OFFLINE") {
      return "—";
    }

    if (status === "MANUTENCAO") {
      return t('ambientesPage.bloqueado');
    }

    if (ambiente.potencia === 0) {
      return `0 kW ${t('ambientesPage.desligado')}`;
    }

    return `${ambiente.potencia} kW`;
  }

  return (
    <div className="app">
      {/* <NavBar /> */}

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1>{t('ambientesPage.title')}</h1>
            <p>{t('ambientesPage.subtitle')}</p>
          </div>

          <div className="header-actions">
            <div className="search-ambientes">
              <input
                type="text"
                placeholder={t('ambientesPage.buscarPlaceholder')}
                value={buscaAmbiente}
                onChange={(e) => setBuscaAmbiente(e.target.value)}
              />
            </div>

            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="btn-secondary"
            >
              <option value="TODOS">{t('ambientesPage.todos')}</option>
              <option value="ONLINE">{t('ambientesPage.online')}</option>
              <option value="PARCIAL">{t('ambientesPage.parcial')}</option>
              <option value="OFFLINE">{t('ambientesPage.offline')}</option>
              <option value="MANUTENCAO">{t('ambientesPage.manutencao')}</option>
            </select>

            <button
              className="btn-primary btn-fit"
              onClick={handleAdicionarAmbiente}
            >
              {t("dashboard.adicionarAmbiente")}
            </button>
          </div>
        </header>

        <div className="ambientes-grid">
          {loading && <p>{t('ambientesPage.carregando')}</p>}

          {!loading && error && <p className="error">{error}</p>}
          {!loading && !error && ambientes.length === 0 && (
            <div className="empty-state">
              <p>{t('ambientesPage.nenhumCadastrado')}</p>
              <p>{t('ambientesPage.cadastreParaComecar')}</p>
            </div>
          )}

          {!loading &&
            !error &&
            ambientes.length > 0 &&
            ambientesFiltrados.length === 0 && (
              <div className="empty-state">
                <p>{t('ambientesPage.nenhumFiltro')}</p>
                <p>{t('ambientesPage.tenteFiltro')}</p>
              </div>
            )}

          {!loading &&
            !error &&
            ambientesFiltrados.length > 0 &&
            ambientesFiltrados.map((ambiente) => (
              <div key={ambiente.id} className="automacao-card ambiente-card">
                <div className="ambiente-header">
                  <div>
                    <h3 className="ambiente-nome">{ambiente.nome}</h3>

                    {ambiente.equipamentos?.length > 0 && (
                      <p className="ambiente-equipamentos">
                        {ambiente.equipamentos.length}{" "}
                        {ambiente.equipamentos.length === 1
                          ? t('ambientesPage.equipamento')
                          : t('ambientesPage.equipamentos')}
                      </p>
                    )}

                    <div className="status-badge-container">
                      <span
                        className={`status-badge status-${ambiente.status?.toLowerCase()}`}
                      >
                        {ambiente.status === "ONLINE" && `🟢 ${t('ambientesPage.online')}`}
                        {ambiente.status === "PARCIAL" && `🟡 ${t('ambientesPage.parcial')}`}
                        {ambiente.status === "OFFLINE" && `🔴 ${t('ambientesPage.offline')}`}
                        {ambiente.status === "MANUTENCAO" && `🛠 ${t('ambientesPage.manutencao')}`}
                      </span>
                    </div>

                    <div className="ambiente-pausa">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={ambiente.pausado}
                          disabled={
                            ambiente.status?.toUpperCase() === "MANUTENCAO"
                          }
                          onChange={() => handleTogglePausa(ambiente)}
                        />
                        <span className="slider" />
                      </label>

                      <span className="ambiente-pausa-texto">
                        {ambiente.status?.toUpperCase() === "MANUTENCAO"
                          ? t('ambientesPage.ambienteManutencao')
                          : ambiente.pausado
                            ? t('ambientesPage.ambientePausado')
                            : t('ambientesPage.ambienteAtivo')}
                      </span>
                    </div>

                    {ambiente.pausado && (
                      <p className="ambiente-pausado-info">
                        {t('ambientesPage.automacoesPausadas')}
                      </p>
                    )}
                  </div>

                  <div className="ambiente-menu-wrapper">
                    <button
                      className="icon-btn menu-trigger"
                      onClick={() =>
                        setAmbientes((prev) =>
                          prev.map((a) =>
                            a.id === ambiente.id
                              ? { ...a, menuAberto: !a.menuAberto }
                              : { ...a, menuAberto: false },
                          ),
                        )
                      }
                    >
                      ⋮
                    </button>

                    {ambiente.menuAberto && (
                      <div className="ambiente-dropdown">
                        <button
                          onClick={() => {
                            handleEditarAmbiente(ambiente);
                            setAmbientes((prev) =>
                              prev.map((a) => ({ ...a, menuAberto: false })),
                            );
                          }}
                        >
                          {t('ambientesPage.editar')}
                        </button>

                        <button
                          className="danger"
                          onClick={() => {
                            handleExcluirAmbiente(ambiente);
                            setAmbientes((prev) =>
                              prev.map((a) => ({ ...a, menuAberto: false })),
                            );
                          }}
                        >
                          {t('ambientesPage.excluirBtn')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="ambiente-tipo">{ambiente.tipo}</p>

                <div className="ambiente-info">
                  <div className="info-row">
                    <span>{t('ambientesPage.temperatureMedia')}</span>
                    <strong>{mostrarTemperatura(ambiente)}</strong>
                  </div>

                  <div className="info-row">
                    <span>{t('ambientesPage.potencia')}</span>
                    <strong>{mostrarPotencia(ambiente)}</strong>
                  </div>
                </div>

                {ambiente.ultimaAtualizacao && (
                  <p className="ambiente-atualizacao">
                    🕒 {tempoDesdeAtualizacao(ambiente.ultimaAtualizacao)}
                  </p>
                )}

                <button
                  className="btn-controlar"
                  disabled={!podeControlar(ambiente) || ambiente.pausado}
                  onClick={() => handleControlar(ambiente)}
                  title={
                    ambiente.status?.toUpperCase() === "OFFLINE"
                      ? t('ambientesPage.semComunicacao')
                      : ambiente.status?.toUpperCase() === "MANUTENCAO"
                        ? t('ambientesPage.emManutencao')
                        : ""
                  }
                >
                  {t('ambientesPage.automatizar')}
                </button>
              </div>
            ))}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={handleFecharModal}>
            <div
              className="modal-content modal-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>
                  {modoModal === "CRIAR" ? t('ambientesPage.novoAmbiente') : t('ambientesPage.editarAmbiente')}
                </h2>
              </div>

              <div className="modal-body">
                <label className="form-label">{t('ambientesPage.nomeAmbiente')}</label>
                <input
                  className="input"
                  value={novoAmbiente.nome}
                  onChange={(e) =>
                    setNovoAmbiente({ ...novoAmbiente, nome: e.target.value })
                  }
                />

                <label className="form-label">{t('ambientesPage.tipoAmbiente')}</label>
                <select
                  className="input"
                  value={novoAmbiente.tipo}
                  onChange={(e) =>
                    setNovoAmbiente({ ...novoAmbiente, tipo: e.target.value })
                  }
                >
                  <option value="Sala">{t('ambientesPage.sala')}</option>
                  <option value="Escritório">{t('ambientesPage.escritorio')}</option>
                  <option value="Laboratório">{t('ambientesPage.laboratorio')}</option>
                  <option value="Outro">{t('ambientesPage.outro')}</option>
                </select>

                <label className="form-label">{t('ambientesPage.statusAmbiente')}</label>
                <div className="status-selector">
                  {["ONLINE", "OFFLINE", "MANUTENCAO", "PARCIAL"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`status-option ${novoAmbiente.status === s ? "selected" : ""
                        }`}
                      onClick={() =>
                        setNovoAmbiente({
                          ...novoAmbiente,
                          status: s,
                        })
                      }
                    >
                      {s === "ONLINE" && `🟢 ${t('ambientesPage.online')}`}
                      {s === "OFFLINE" && `🔴 ${t('ambientesPage.offline')}`}
                      {s === "MANUTENCAO" && `🟡 ${t('ambientesPage.manutencao')}`}
                      {s === "PARCIAL" && `🟠 ${t('ambientesPage.parcial')}`}
                    </button>
                  ))}
                </div>

                <h4 className="modal-section-title">{t('ambientesPage.equipamentosLabel')}</h4>
                <div className="equipamentos-grid">
                  {equipamentosDisponiveis.map((eq) => (
                    <label key={eq.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={novoAmbiente.equipamentos.includes(eq.id)}
                        onChange={() => toggleEquipamento(eq.id)}
                      />
                      <span>{eq.nome}</span>
                    </label>
                  ))}
                </div>

                {erroModal && <p className="form-error">{erroModal}</p>}
              </div>

              <div className="modal-footer modal-footer-sa">
                <button className="btn-secondary" onClick={handleFecharModal}>
                  {t('common.cancelar')}
                </button>
                <button className="btn-primary" onClick={handleSalvarAmbiente}>
                  {modoModal === "CRIAR"
                    ? t('ambientesPage.criarAmbiente')
                    : t('ambientesPage.salvarAlteracoes')}
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog
          open={confirmOpen}
          title={t('ambientesPage.excluirAmbiente')}
          message={
            confirmTarget
              ? t('ambientesPage.confirmarExcluir').replace('{name}', confirmTarget.nome)
              : t('ambientesPage.confirmarExcluirGenerico')
          }
          confirmText={t('common.excluir')}
          cancelText={t('common.cancelar')}
          onConfirm={confirmarExclusaoAmbiente}
          onCancel={() => {
            setConfirmOpen(false);
            setConfirmTarget(null);
          }}
        />
      </main>
    </div>
  );
};

export default Ambientes;

