import React, { useState } from "react";
import { Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import { useLanguage } from "../../context/LanguageContext";
import "./Dashboard.css";

const Dashboard = () => {
  const [statusFiltro, setStatusFiltro] = useState("TODOS");

  const { t } = useLanguage();
  const navigate = useNavigate();

  const [ambientes, setAmbientes] = useState([
    {
      id: 1,
      nome: "Escritório Gerência",
      tipo: "Sala",
      temperatura: 22,
      potencia: 10.5,
      status: "ONLINE",
      equipamentosTotal: 5,
      equipamentosLigados: 5,
    },
    {
      id: 2,
      nome: "Sala de Reuniões A",
      tipo: "Sala",
      temperatura: 23,
      potencia: 4.2,
      status: "PARCIAL",
      equipamentosTotal: 3,
      equipamentosLigados: 1,
      ultimaAtualizacao: "2026-01-31T14:20:00",
    },
    {
      id: 3,
      nome: "Sala de Reuniões B",
      tipo: "Sala",
      temperatura: 27,
      potencia: 0,
      status: "OFFLINE",
      equipamentosTotal: 2,
      equipamentosLigados: 0,
    },
    {
      id: 4,
      nome: "Auditório Principal",
      tipo: "Auditório",
      temperatura: 24,
      potencia: 0,
      status: "MANUTENCAO",
      equipamentosTotal: 8,
      equipamentosLigados: 0,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [erroModal, setErroModal] = useState("");

  const [modoModal, setModoModal] = useState("CRIAR"); // CRIAR | EDITAR
  const [ambienteEditando, setAmbienteEditando] = useState(null);

  const [novoAmbiente, setNovoAmbiente] = useState({
    nome: "",
    tipo: "Sala",
    equipamentos: [],
    status: "offline",
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
    ONLINE: 4
  };

  /* =========================
     FILTRO
  ========================= */
  const ambientesFiltrados = ambientes
    .filter((ambiente) => {
      if (statusFiltro === "TODOS") return true;
      return ambiente.status?.toUpperCase() === statusFiltro;
    })
    .sort((a, b) => {
      const statusA = a.status?.toUpperCase();
      const statusB = b.status?.toUpperCase();
      return (prioridadeStatus[statusA] || 99) - (prioridadeStatus[statusB] || 99);
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
      status: "offline",
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
      equipamentos: ambiente.equipamentos || [],
      status: ambiente.status || "offline",
    });

    setShowModal(true);
  };

  const handleFecharModal = () => {
    setShowModal(false);
    setErroModal("");
    setAmbienteEditando(null);
  };

  const handleSalvarAmbiente = () => {
    if (!novoAmbiente.nome) {
      setErroModal("Informe o nome do ambiente.");
      return;
    }

    if (novoAmbiente.equipamentos.length === 0) {
      setErroModal("Selecione ao menos um equipamento.");
      return;
    }

    if (modoModal === "CRIAR") {
      const novo = {
        id: ambientes.length + 1,
        nome: novoAmbiente.nome,
        tipo: novoAmbiente.tipo,
        temperatura: 25,
        potencia: 0,
        status: novoAmbiente.status,
        equipamentos: novoAmbiente.equipamentos,
      };

      setAmbientes([...ambientes, novo]);
    }

    if (modoModal === "EDITAR" && ambienteEditando) {
      setAmbientes((prev) =>
        prev.map((a) =>
          a.id === ambienteEditando.id
            ? {
                ...a,
                nome: novoAmbiente.nome,
                tipo: novoAmbiente.tipo,
                status: novoAmbiente.status,
                equipamentos: novoAmbiente.equipamentos,
              }
            : a,
        ),
      );
    }

    handleFecharModal();
  };

  /* =========================
     NAVEGAÇÃO
  ========================= */
  const handleControlar = (ambiente) => {
    navigate(`/automacoes?ambiente=${encodeURIComponent(ambiente.nome)}`);
  };
  
  function getTextoStatus(ambiente) {
    const status = ambiente.status?.toUpperCase();

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
      return `🟡 Parcial • ${ambiente.equipamentosLigados} de ${ambiente.equipamentosTotal} ligados`;
    }

    if (status === "ONLINE") {
      return "🟢 Online • Todos ligados";
    }

    return ambiente.status;
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
          {ambientes.length === 0 && (
            <div className="empty-state">
              <p>Nenhum ambiente cadastrado ainda.</p>
              <p>Cadastre um ambiente para começar o monitoramento.</p>
            </div>
          )}

          {ambientes.length > 0 && ambientesFiltrados.length === 0 && (
            <div className="empty-state">
              <p>Nenhum ambiente encontrado para este filtro.</p>
              <p>Tente selecionar outro status.</p>
            </div>
          )}

          {ambientesFiltrados.map((ambiente) => (
            <div key={ambiente.id} className="automacao-card ambiente-card">
              <div className="ambiente-header">
                <div>
                  <h3 className="ambiente-nome">{ambiente.nome}</h3>

                  {ambiente.equipamentosTotal > 0 && (
                    <p className="ambiente-equipamentos">
                      {ambiente.equipamentosTotal}{" "}
                      {ambiente.equipamentosTotal === 1 ? "equipamento" : "equipamentos"}
                    </p>
                  )}

                  <span className={`status ${ambiente.status?.toLowerCase() || ""}`}>
                    {getTextoStatus(ambiente)}
                  </span>
                </div>

                <button
                  className="icon-btn"
                  onClick={() => handleEditarAmbiente(ambiente)}
                  title="Editar ambiente"
                >
                  ⚙️
                </button>
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
                disabled={!podeControlar(ambiente)}
                onClick={() => handleControlar(ambiente)}
                title={
                  ambiente.status?.toUpperCase() === "OFFLINE"
                    ? "Ambiente sem comunicação"
                    : ambiente.status?.toUpperCase() === "MANUTENCAO"
                    ? "Ambiente em manutenção"
                    : ""
                }
              >
                Controlar 🔧
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
                <select
                  className="input"
                  value={novoAmbiente.status}
                  onChange={(e) =>
                    setNovoAmbiente({
                      ...novoAmbiente,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="manutencao">Manutenção</option>
                </select>

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

              <div className="modal-footer">
                <button className="btn-secondary" onClick={handleFecharModal}>
                  Cancelar
                </button>
                <button className="btn-primary" onClick={handleSalvarAmbiente}>
                  {modoModal === "CRIAR" ? "Concluir" : "Salvar alterações"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
