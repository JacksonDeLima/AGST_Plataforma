import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import { useLanguage } from "../../context/LanguageContext";
import "./Dashboard.css";

const Dashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [ambientes, setAmbientes] = useState([
    {
      id: 1,
      nome: "Escritório Gerência",
      tipo: "Sala",
      temperatura: 22,
      potencia: 10.5,
      status: "online",
      equipamentos: [1, 2],
    },
    {
      id: 2,
      nome: "Sala de Reuniões A",
      tipo: "Sala",
      temperatura: 23,
      potencia: 9.5,
      status: "online",
      equipamentos: [3],
    },
    {
      id: 3,
      nome: "Sala de Reuniões B",
      tipo: "Sala",
      temperatura: 27,
      potencia: 0,
      status: "offline",
      equipamentos: [],
    },
    {
      id: 4,
      nome: "Escritório A",
      tipo: "Sala",
      temperatura: 26,
      potencia: 0,
      status: "offline",
      equipamentos: [],
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("todos");
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

  /* =========================
     FILTRO
  ========================= */
  const ambientesFiltrados = ambientes.filter((ambiente) => {
    if (filtroStatus === "todos") return true;
    return ambiente.status === filtroStatus;
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
            : a
        )
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
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="btn-secondary"
            >
              <option value="todos">Todos</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>

            <button
              className="btn-primary btn-fit"
              onClick={handleAdicionarAmbiente}
            >
              + {t("dashboard.adicionarAmbiente")}
            </button>
          </div>
        </header>

        <div className="ambientes-grid">
          {ambientesFiltrados.map((ambiente) => (
            <div key={ambiente.id} className="automacao-card ambiente-card">
              <div className="ambiente-header">
                <div>
                  <h3 className="ambiente-nome">{ambiente.nome}</h3>

                  <span
                    className={`status-text ${
                      ambiente.status === "online" ? "ativa" : "pausada"
                    }`}
                  >
                    {ambiente.status === "online"
                      ? "🟢 Online"
                      : ambiente.status === "offline"
                      ? "🔴 Offline"
                      : "🟡 Manutenção"}
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
                  <span>Temperatura</span>
                  <strong>{ambiente.temperatura}°C</strong>
                </div>

                <div className="info-row">
                  <span>Potência</span>
                  <strong>{ambiente.potencia} kW</strong>
                </div>
              </div>

              <button
                className="btn-primary btn-block"
                onClick={() => handleControlar(ambiente)}
              >
                {t("dashboard.controlar")} 🔧
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
