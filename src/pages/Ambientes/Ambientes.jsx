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

import "./Ambientes.css";
import { useToast } from "../../context/ToastContext";

const Ambientes = () => {
  const { showToast } = useToast();

  const [statusFiltro, setStatusFiltro] = useState("TODOS");

  const { corporationId } = useAuth();
  const { setActiveAmbiente } = useAmbiente();

  const { t } = useLanguage();
  const navigate = useNavigate();

  const [ambientes, setAmbientes] = useState(() => []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        setError("Erro inesperado ao carregar ambientes");
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
  const ambientesFiltrados = (Array.isArray(ambientes) ? ambientes : [])
    .filter((ambiente) => {
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
      setErroModal("Informe o nome do ambiente.");
      showToast({
        type: "error",
        message: "Informe o nome do ambiente.",
      });
      return;
    }

    if (novoAmbiente.equipamentos.length === 0) {
      setErroModal("Selecione ao menos um equipamento.");
      showToast({
        type: "error",
        message: "Selecione ao menos um equipamento.",
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
          message: "Ambiente criado com sucesso",
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
          message: "Ambiente atualizado com sucesso",
        });
      }

      handleFecharModal();
    } catch (err) {
      showToast({
        type: "error",
        message: "Erro inesperado ao salvar ambiente",
      });
    }
  };

  const handleExcluirAmbiente = async (ambiente) => {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o ambiente "${ambiente.nome}"?`,
    );

    if (!confirmar) return;

    try {
      await deletarAmbiente(corporationId, ambiente.id);

      setAmbientes((prev) => prev.filter((a) => a.id !== ambiente.id));

      const ambienteAtivo = localStorage.getItem("agst_active_ambiente_id");
      if (String(ambienteAtivo) === String(ambiente.id)) {
        localStorage.removeItem("agst_active_ambiente_id");
      }

      showToast({
        type: "success",
        message: "Ambiente excluído com sucesso",
      });
    } catch (err) {
      showToast({
        type: "error",
        message: "Erro ao excluir ambiente",
      });
    }
  };

  /* =========================
     NAVEGAÇÃO
  ========================= */
  const handleControlar = (ambiente) => {
    setActiveAmbiente(ambiente.id);
    navigate("/automacoes");
  };

  function getTextoStatus(ambiente) {
    const status = ambiente.status?.toUpperCase();
    const total = ambiente.equipamentos?.length || 0;
    const ligados = ambiente.equipamentos?.filter((e) => e.ligado).length || 0;

    if (status === "MANUTENCAO") {
      return (
        <>
          <Wrench size={14} />
          Manutenção • Em atendimento
        </>
      );
    }

    if (status === "OFFLINE") {
      return "🔴 Offline • Nenhum ligado";
    }

    if (status === "PARCIAL") {
      return `🟡 Parcial • ${ligados} de ${total} ligados`;
    }

    if (status === "ONLINE") {
      return "🟢 Online • Todos ligados";
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

    if (diferencaMin < 1) return "Atualizado agora";
    if (diferencaMin === 1) return "Atualizado há 1 minuto";
    if (diferencaMin < 60) return `Atualizado há ${diferencaMin} min`;

    const diferencaHoras = Math.floor(diferencaMin / 60);
    if (diferencaHoras === 1) return "Atualizado há 1 hora";
    if (diferencaHoras < 24) return `Atualizado há ${diferencaHoras} horas`;

    const diferencaDias = Math.floor(diferencaHoras / 24);
    return `Atualizado há ${diferencaDias} dias`;
  }

  function mostrarTemperatura(ambiente) {
    const status = ambiente.status?.toUpperCase();
    if (status === "OFFLINE") {
      return "—";
    }

    if (status === "MANUTENCAO") {
      return `${ambiente.temperatura}°C (última)`;
    }

    return `${ambiente.temperatura}°C`;
  }

  function mostrarPotencia(ambiente) {
    const status = ambiente.status?.toUpperCase();
    if (status === "OFFLINE") {
      return "—";
    }

    if (status === "MANUTENCAO") {
      return "Bloqueado";
    }

    if (ambiente.potencia === 0) {
      return "0 kW (desligado)";
    }

    return `${ambiente.potencia} kW`;
  }

  return (
    <div className="app">
      {/* <NavBar /> */}

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1>Ambientes</h1>
            <p>Gerencie os ambientes e seus equipamentos</p>
          </div>

          <div className="header-actions">
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="btn-secondary"
            >
              <option value="TODOS">Todos</option>
              <option value="ONLINE">Online</option>
              <option value="PARCIAL">Parcial</option>
              <option value="OFFLINE">Offline</option>
              <option value="MANUTENCAO">Manutenção</option>
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
          {loading && <p>Carregando ambientes...</p>}

          {!loading && error && <p className="error">{error}</p>}
          {!loading && !error && ambientes.length === 0 && (
            <div className="empty-state">
              <p>Nenhum ambiente cadastrado ainda.</p>
              <p>Cadastre um ambiente para começar o monitoramento.</p>
            </div>
          )}

          {!loading &&
            !error &&
            ambientes.length > 0 &&
            ambientesFiltrados.length === 0 && (
              <div className="empty-state">
                <p>Nenhum ambiente encontrado para este filtro.</p>
                <p>Tente selecionar outro status.</p>
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
                          ? "equipamento"
                          : "equipamentos"}
                      </p>
                    )}

                    <div className="status-badge-container">
                      <span
                        className={`status-badge status-${ambiente.status?.toLowerCase()}`}
                      >
                        {ambiente.status === "ONLINE" && "🟢 Online"}
                        {ambiente.status === "PARCIAL" && "🟡 Parcial"}
                        {ambiente.status === "OFFLINE" && "🔴 Offline"}
                        {ambiente.status === "MANUTENCAO" && "🛠 Manutenção"}
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
                          onChange={() =>
                            setAmbientes((prev) =>
                              prev.map((a) =>
                                a.id === ambiente.id
                                  ? { ...a, pausado: !a.pausado }
                                  : a,
                              ),
                            )
                          }
                        />
                        <span className="slider" />
                      </label>

                      <span className="ambiente-pausa-texto">
                        {ambiente.status?.toUpperCase() === "MANUTENCAO"
                          ? "Ambiente em manutenção"
                          : ambiente.pausado
                            ? "Ambiente pausado"
                            : "Ambiente ativo"}
                      </span>
                    </div>

                    {ambiente.pausado && (
                      <p className="ambiente-pausado-info">
                        ⏸ Automações deste ambiente estão pausadas
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
                          ✏️ Editar
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
                          🗑️ Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="ambiente-tipo">{ambiente.tipo}</p>

                <div className="ambiente-info">
                  <div className="info-row">
                    <span>Temperatura média</span>
                    <strong>{mostrarTemperatura(ambiente)}</strong>
                  </div>

                  <div className="info-row">
                    <span>Potência</span>
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
                      ? "Ambiente sem comunicação"
                      : ambiente.status?.toUpperCase() === "MANUTENCAO"
                        ? "Ambiente em manutenção"
                        : ""
                  }
                >
                  Automatizar 🔧
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
                  {modoModal === "CRIAR" ? "Novo Ambiente" : "Editar Ambiente"}
                </h2>
              </div>

              <div className="modal-body">
                <label className="form-label">Nome do Ambiente</label>
                <input
                  className="input"
                  value={novoAmbiente.nome}
                  onChange={(e) =>
                    setNovoAmbiente({ ...novoAmbiente, nome: e.target.value })
                  }
                />

                <label className="form-label">Tipo do Ambiente</label>
                <select
                  className="input"
                  value={novoAmbiente.tipo}
                  onChange={(e) =>
                    setNovoAmbiente({ ...novoAmbiente, tipo: e.target.value })
                  }
                >
                  <option value="Sala">Sala</option>
                  <option value="Escritório">Escritório</option>
                  <option value="Laboratório">Laboratório</option>
                  <option value="Outro">Outro</option>
                </select>

                <label className="form-label">Status do Ambiente</label>
                <div className="status-selector">
                  {["ONLINE", "OFFLINE", "MANUTENCAO", "PARCIAL"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`status-option ${
                        novoAmbiente.status === s ? "selected" : ""
                      }`}
                      onClick={() =>
                        setNovoAmbiente({
                          ...novoAmbiente,
                          status: s,
                        })
                      }
                    >
                      {s === "ONLINE" && "🟢 Online"}
                      {s === "OFFLINE" && "🔴 Offline"}
                      {s === "MANUTENCAO" && "🟡 Manutenção"}
                      {s === "PARCIAL" && "🟠 Parcial"}
                    </button>
                  ))}
                </div>

                <h4 className="modal-section-title">Equipamentos</h4>
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
                  Cancelar
                </button>
                <button className="btn-primary" onClick={handleSalvarAmbiente}>
                  {modoModal === "CRIAR"
                    ? "Criar Ambiente"
                    : "Salvar alterações"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Ambientes;
