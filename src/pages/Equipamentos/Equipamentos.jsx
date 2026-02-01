import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Equipamentos.css";

const Equipamentos = () => {
  const navigate = useNavigate();

  const [equipamentos, setEquipamentos] = useState([
    {
      id: 1,
      modelo: "Samsung",
      status: "Ativo",
      local: "Escritório Gerência",
      capacidade: "12000 BTU",
      temperaturaAtual: "23°C",
      consumoAtual: "5000 W",
    },
    {
      id: 2,
      modelo: "Samsung",
      status: "Ativo",
      local: "Escritório Gerência",
      capacidade: "16000 BTU",
      temperaturaAtual: "23°C",
      consumoAtual: "5000 W",
    },
    {
      id: 3,
      modelo: "Samsung",
      status: "Ativo",
      local: "Escritório Gerência",
      capacidade: "9000 BTU",
      temperaturaAtual: "23°C",
      consumoAtual: "5000 W",
    },
    {
      id: 4,
      modelo: "Samsung",
      status: "Ativo",
      local: "Escritório Gerência",
      capacidade: "9000 BTU",
      temperaturaAtual: "23°C",
      consumoAtual: "5000 W",
    },
    {
      id: 5,
      modelo: "Samsung",
      status: "Ativo",
      local: "Escritório Gerência",
      capacidade: "12000 BTU",
      temperaturaAtual: "23°C",
      consumoAtual: "5000 W",
    },
    {
      id: 6,
      modelo: "Samsung",
      status: "Ativo",
      local: "Escritório Gerência",
      capacidade: "16000 BTU",
      temperaturaAtual: "23°C",
      consumoAtual: "5000 W",
    },
    {
      id: 7,
      modelo: "Samsung",
      status: "Inativo",
      local: "Escritório Gerência",
      capacidade: "9000 BTU",
      temperaturaAtual: "26°C",
      consumoAtual: "0 W",
    },
    {
      id: 8,
      modelo: "Samsung",
      status: "Offline",
      local: "Escritório Gerência",
      capacidade: "9000 BTU",
      temperaturaAtual: "-",
      consumoAtual: "-",
    },
  ]);

  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [filtroAmbiente, setFiltroAmbiente] = useState("TODOS");
  const [mostrarFiltros, setMostrarFiltros] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [novoEquipamento, setNovoEquipamento] = useState({
    modelo: "",
    local: "",
    capacidade: "",
  });

  const ambientes = ["TODOS", ...new Set(equipamentos.map((e) => e.local))];

  const equipamentosFiltrados = equipamentos.filter((e) => {
    const statusOk = filtroStatus === "TODOS" || e.status === filtroStatus;
    const ambienteOk =
      filtroAmbiente === "TODOS" || e.local === filtroAmbiente;
    return statusOk && ambienteOk;
  });

  const criarEquipamento = () => {
    if (
      !novoEquipamento.modelo ||
      !novoEquipamento.local ||
      !novoEquipamento.capacidade
    ) {
      alert("Preencha todos os campos");
      return;
    }

    const novo = {
      id: equipamentos.length + 1,
      modelo: novoEquipamento.modelo,
      status: "Offline",
      local: novoEquipamento.local,
      capacidade: novoEquipamento.capacidade,
      temperaturaAtual: "-",
      consumoAtual: "-",
    };

    setEquipamentos([...equipamentos, novo]);

    setNovoEquipamento({
      modelo: "",
      local: "",
      capacidade: "",
    });

    setShowModal(false);
  };

  const getStatusClass = (status) => {
    if (status === "Ativo") return "status-ativo";
    if (status === "Inativo") return "status-inativo";
    if (status === "Offline") return "status-offline";
    return "";
  };

  const limparFiltros = () => {
    setFiltroStatus("TODOS");
    setFiltroAmbiente("TODOS");
  };

  return (
    <div className="app">
      <div className="equipamentos-page">
        <button
          className="btn-secondary"
          style={{ marginBottom: "20px" }}
          onClick={() => navigate(-1)}
        >
          ← Voltar
        </button>
        {/* HEADER */}
        <div className="page-header">
          <h1 className="page-title">Equipamentos</h1>
          <p className="page-subtitle">
            Adicione ou gerencie seus equipamentos
          </p>
        </div>

        {/* MINI DASHBOARD */}
        <div className="mini-dashboard">
          {["Ativo", "Inativo", "Offline"].map((status) => (
            <div
              key={status}
              className={`dashboard-card ${status.toLowerCase()} ${
                filtroStatus === status ? "selecionado" : ""
              }`}
              onClick={() => setFiltroStatus(status)}
            >
              <span className="dash-number">
                {equipamentos.filter((e) => e.status === status).length}
              </span>
              <span className="dash-label">{status}</span>
            </div>
          ))}
        </div>

        {/* AÇÕES */}
        <div className="equipamentos-actions">
          <button
            className="btn-filtros"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            Filtros
          </button>

          {mostrarFiltros && (
            <>
              <div className="select-wrapper">
                <span className="select-icon">🔍</span>
                <select
                  className="select-ambiente"
                  value={filtroAmbiente}
                  onChange={(e) => setFiltroAmbiente(e.target.value)}
                >
                  {ambientes.map((amb) => (
                    <option key={amb} value={amb}>
                      {amb}
                    </option>
                  ))}
                </select>
              </div>

              <button className="btn-clear" onClick={limparFiltros}>
                Limpar
              </button>
            </>
          )}

          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Adicionar Equipamento
          </button>
        </div>

        {/* GRID */}
        <div className="devices-grid">
          {equipamentosFiltrados.map((equipamento) => (
            <div className="device-card" key={equipamento.id}>
              <h3>{equipamento.modelo}</h3>
              <p>{equipamento.local}</p>
              <span className={`status ${getStatusClass(equipamento.status)}`}>
                {equipamento.status}
              </span>
            </div>
          ))}
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Novo Equipamento</h2>

              <input
                placeholder="Modelo"
                value={novoEquipamento.modelo}
                onChange={(e) =>
                  setNovoEquipamento({
                    ...novoEquipamento,
                    modelo: e.target.value,
                  })
                }
              />

              <input
                placeholder="Ambiente"
                value={novoEquipamento.local}
                onChange={(e) =>
                  setNovoEquipamento({
                    ...novoEquipamento,
                    local: e.target.value,
                  })
                }
              />

              <input
                placeholder="Capacidade"
                value={novoEquipamento.capacidade}
                onChange={(e) =>
                  setNovoEquipamento({
                    ...novoEquipamento,
                    capacidade: e.target.value,
                  })
                }
              />

              <button className="btn-primary" onClick={criarEquipamento}>
                Salvar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Equipamentos;
