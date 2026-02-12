import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Equipamentos.css";

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const Equipamentos = () => {
  const navigate = useNavigate();

  const [equipamentos, setEquipamentos] = useState([
    {
      id: 1,
      modelo: "Samsung",
      status: "Ativo",
      local: "Escritório Gerência",
      capacidade: "12000 BTU",
      temperaturaAtual: "08°C",
      consumoAtual: "5000 W",
      setpoint: 22,
      modo: "cool",
    },
    {
      id: 2,
      modelo: "Samsung",
      status: "Ativo",
      local: "Escritório Gerência",
      capacidade: "16000 BTU",
      temperaturaAtual: "23°C",
      consumoAtual: "5000 W",
      setpoint: 24,
      modo: "auto",
    },
    {
      id: 3,
      modelo: "Samsung",
      status: "Ativo",
      local: "Escritório Gerência",
      capacidade: "9000 BTU",
      temperaturaAtual: "23°C",
      consumoAtual: "5000 W",
      setpoint: 23,
      modo: "fan",
    },
    {
      id: 4,
      modelo: "Samsung",
      status: "Ativo",
      local: "Escritório Gerência",
      capacidade: "9000 BTU",
      temperaturaAtual: "23°C",
      consumoAtual: "5000 W",
      setpoint: 21,
      modo: "cool",
    },
    {
      id: 5,
      modelo: "Samsung",
      status: "Ativo",
      local: "Escritório Gerência",
      capacidade: "12000 BTU",
      temperaturaAtual: "23°C",
      consumoAtual: "5000 W",
      setpoint: 22,
      modo: "dry",
    },
    {
      id: 6,
      modelo: "Samsung",
      status: "Ativo",
      local: "Escritório Gerência",
      capacidade: "16000 BTU",
      temperaturaAtual: "23°C",
      consumoAtual: "5000 W",
      setpoint: 25,
      modo: "heat",
    },
    {
      id: 7,
      modelo: "Samsung",
      status: "Inativo",
      local: "Escritório Gerência",
      capacidade: "9000 BTU",
      temperaturaAtual: "26°C",
      consumoAtual: "0 W",
      setpoint: 24,
      modo: "cool",
    },
    {
      id: 8,
      modelo: "Samsung",
      status: "Offline",
      local: "Escritório Gerência",
      capacidade: "9000 BTU",
      temperaturaAtual: "-",
      consumoAtual: "-",
      setpoint: null,
      modo: null,
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

  // ========= Helpers =========
  const ambientes = useMemo(
    () => ["TODOS", ...new Set(equipamentos.map((e) => e.local))],
    [equipamentos]
  );

  const equipamentosFiltrados = useMemo(() => {
    return equipamentos.filter((e) => {
      const statusOk = filtroStatus === "TODOS" || e.status === filtroStatus;
      const ambienteOk =
        filtroAmbiente === "TODOS" || e.local === filtroAmbiente;
      return statusOk && ambienteOk;
    });
  }, [equipamentos, filtroStatus, filtroAmbiente]);

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
      setpoint: null,
      modo: null,
    };

    setEquipamentos((prev) => [...prev, novo]);
    setNovoEquipamento({ modelo: "", local: "", capacidade: "" });
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

  // ========= Escala de cores (Temperatura) =========
  const parseTemp = (t) => {
    if (t === null || t === undefined) return null;
    if (typeof t === "number") return t;

    const s = String(t).trim();
    if (!s || s === "-") return null;

    const n = parseFloat(s.replace("°C", "").replace(",", "."));
    return Number.isNaN(n) ? null : n;
  };

  const getTempClass = (tempRaw) => {
    const temp = parseTemp(tempRaw);
    if (temp === null) return "temp-na";

    if (temp <= 18) return "temp-frio";
    if (temp <= 22) return "temp-agradavel";
    if (temp <= 26) return "temp-morno";
    if (temp <= 30) return "temp-quente";
    return "temp-muito-quente";
  };

  // ========= Ações (mock UI) =========
  const patchEquipamento = (id, patch) => {
    setEquipamentos((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );
  };

  const togglePower = (id) => {
    const eq = equipamentos.find((e) => e.id === id);
    if (!eq || eq.status === "Offline") return;

    if (eq.status === "Ativo") {
      patchEquipamento(id, { status: "Inativo", consumoAtual: "0 W" });
      return;
    }

    // ligando
    const tempAtual =
      eq.temperaturaAtual === "-" || eq.temperaturaAtual == null
        ? "24°C"
        : eq.temperaturaAtual;

    patchEquipamento(id, {
      status: "Ativo",
      temperaturaAtual: tempAtual,
      consumoAtual: "450 W",
      modo: eq.modo || "cool",
      setpoint: eq.setpoint ?? 24,
    });
  };

  const changeSetpoint = (id, delta) => {
    const eq = equipamentos.find((e) => e.id === id);
    if (!eq || eq.status !== "Ativo") return;

    const next = clamp((eq.setpoint ?? 24) + delta, 16, 30);
    patchEquipamento(id, { setpoint: next });
  };

  const cycleModo = (id) => {
    const eq = equipamentos.find((e) => e.id === id);
    if (!eq || eq.status !== "Ativo") return;

    const order = ["auto", "cool", "heat", "fan", "dry"];
    const cur = eq.modo || "auto";
    const idx = order.indexOf(cur);
    const next = order[(idx + 1) % order.length];

    patchEquipamento(id, { modo: next });
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
          <div>
            <h1 className="page-title">Equipamentos</h1>
            <p className="page-subtitle">Adicione ou gerencie seus equipamentos</p>
          </div>
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
          {equipamentosFiltrados.map((equipamento) => {
            const isOffline = equipamento.status === "Offline";
            const isActive = equipamento.status === "Ativo";

            return (
              <div className="device-card" key={equipamento.id}>
                {/* Cabeçalho do card */}
                <div className="device-header">
                  <h3 className="device-title">{equipamento.modelo}</h3>
                  <span className={`status ${getStatusClass(equipamento.status)}`}>
                    {equipamento.status}
                  </span>
                </div>

                <p className="device-local">{equipamento.local}</p>

                {/* Info */}
                <div className="device-info">
                  <div className="info-row">
                    <span className="info-label">Capacidade</span>
                    <span className="info-value">{equipamento.capacidade}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Temp. atual</span>

                    {/* ✅ AQUI entra o badge colorido */}
                    <span
                      className={`temp-badge ${getTempClass(
                        equipamento.temperaturaAtual
                      )}`}
                    >
                      {equipamento.temperaturaAtual}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Consumo</span>
                    <span className="info-value">{equipamento.consumoAtual}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Setpoint</span>
                    <span className="info-value">
                      {equipamento.setpoint !== null &&
                      equipamento.setpoint !== undefined
                        ? `${equipamento.setpoint}°C`
                        : "-"}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Modo</span>
                    <span className="info-value">{equipamento.modo || "-"}</span>
                  </div>
                </div>

                {/* Ações */}
                <div className="device-controls">
                  <button
                    className={`btn-power ${isActive ? "on" : "off"}`}
                    disabled={isOffline}
                    onClick={() => togglePower(equipamento.id)}
                    title={isOffline ? "Equipamento offline" : isActive ? "Desligar" : "Ligar"}
                  >
                    {isActive ? "Desligar" : "Ligar"}
                  </button>

                  <button
                    className="btn-ctrl"
                    disabled={!isActive}
                    onClick={() => changeSetpoint(equipamento.id, -1)}
                    title={!isActive ? "Ative o equipamento" : "Diminuir setpoint"}
                  >
                    −
                  </button>

                  <button
                    className="btn-ctrl"
                    disabled={!isActive}
                    onClick={() => changeSetpoint(equipamento.id, +1)}
                    title={!isActive ? "Ative o equipamento" : "Aumentar setpoint"}
                  >
                    +
                  </button>

                  <button
                    className="btn-ctrl"
                    disabled={!isActive}
                    onClick={() => cycleModo(equipamento.id)}
                    title={!isActive ? "Ative o equipamento" : "Trocar modo"}
                  >
                    Modo
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Novo Equipamento</h2>

              <div className="modal-body">
                <div className="form-group">
                  <label>Modelo</label>
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
                </div>

                <div className="form-group">
                  <label>Ambiente</label>
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
                </div>

                <div className="form-group">
                  <label>Capacidade</label>
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
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-criar-equipamento" onClick={criarEquipamento}>
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Equipamentos;
