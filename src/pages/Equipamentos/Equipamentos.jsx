import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Equipamentos.css";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const Equipamentos = () => {
  const navigate = useNavigate();
  const { addNotification } = useToast();
  const { t } = useLanguage();

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
      firmware: "v3.2.1",
      ultimoPing: "2 min",
      saudeSensor: "OK",
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
      firmware: "v3.2.1",
      ultimoPing: "5 min",
      saudeSensor: "OK",
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
      firmware: "v3.1.8",
      ultimoPing: "1 min",
      saudeSensor: "OK",
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
      firmware: "v3.1.8",
      ultimoPing: "3 min",
      saudeSensor: "Atenção",
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
      firmware: "v3.0.9",
      ultimoPing: "9 min",
      saudeSensor: "OK",
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
      firmware: "v3.0.9",
      ultimoPing: "4 min",
      saudeSensor: "OK",
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
      firmware: "v2.9.4",
      ultimoPing: "45 min",
      saudeSensor: "Atenção",
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
      firmware: "v2.8.7",
      ultimoPing: "-",
      saudeSensor: "Indisponível",
    },
  ]);

  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [filtroAmbiente, setFiltroAmbiente] = useState("TODOS");
  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  const [busca, setBusca] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [equipamentoEditandoId, setEquipamentoEditandoId] = useState(null);

  const [formEquipamento, setFormEquipamento] = useState({
    nome: "",
    local: "",
    modelo: "",
    capacidade: "",
    numeroSerie: "",
    tipoIntegracao: "BRISE",
    token: "",
  });

  const abrirModalCriacao = () => {
    setModoEdicao(false);
    setEquipamentoEditandoId(null);
    setFormEquipamento({
      nome: "",
      local: "",
      modelo: "",
      capacidade: "",
      numeroSerie: "",
      tipoIntegracao: "BRISE",
      token: "",
    });
    setShowModal(true);
  };

  const abrirModalEdicao = (equipamento) => {
    setModoEdicao(true);
    setEquipamentoEditandoId(equipamento.id);
    setFormEquipamento({
      nome: equipamento.nome || "",
      local: equipamento.local || "",
      modelo: equipamento.modelo || "",
      capacidade: equipamento.capacidade || "",
      numeroSerie: equipamento.numeroSerie || "",
      tipoIntegracao: equipamento.tipoIntegracao || "BRISE",
      token: equipamento.token || "",
    });
    setShowModal(true);
  };

  const formatarCapacidade = (valor) => {
    const texto = String(valor || "").trim();
    if (!texto) return "";
    return /btu/i.test(texto) ? texto : `${texto} BTU`;
  };

  // ========= Helpers =========
  const ambientes = useMemo(
    () => ["TODOS", ...new Set(equipamentos.map((e) => e.local))],
    [equipamentos]
  );

  const equipamentosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return equipamentos.filter((e) => {
      const statusOk = filtroStatus === "TODOS" || e.status === filtroStatus;
      const ambienteOk =
        filtroAmbiente === "TODOS" || e.local === filtroAmbiente;
      const buscaOk =
        !termo ||
        [e.modelo, e.local, e.capacidade]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(termo));
      return statusOk && ambienteOk && buscaOk;
    });
  }, [equipamentos, filtroStatus, filtroAmbiente, busca]);

  const salvarEquipamento = () => {
    if (
      !formEquipamento.nome ||
      !formEquipamento.local ||
      !formEquipamento.modelo ||
      !formEquipamento.capacidade ||
      !formEquipamento.numeroSerie
    ) {
      addNotification({
        type: "error",
        message: t('equipamentosPage.camposObrigatorios'),
      });
      return;
    }

    const capacidadeFinal = formatarCapacidade(formEquipamento.capacidade);

    if (modoEdicao && equipamentoEditandoId) {
      setEquipamentos((prev) =>
        prev.map((e) =>
          e.id === equipamentoEditandoId
            ? {
              ...e,
              nome: formEquipamento.nome,
              local: formEquipamento.local,
              modelo: formEquipamento.modelo,
              capacidade: capacidadeFinal,
              numeroSerie: formEquipamento.numeroSerie,
              tipoIntegracao: formEquipamento.tipoIntegracao,
              token: formEquipamento.token,
            }
            : e,
        ),
      );
      addNotification({
        type: "success",
        message: t('equipamentosPage.equipamentoAtualizado').replace('{model}', formEquipamento.modelo),
      });
      setShowModal(false);
      return;
    }

    const novo = {
      id: equipamentos.length + 1,
      nome: formEquipamento.nome,
      modelo: formEquipamento.modelo,
      status: "Offline",
      local: formEquipamento.local,
      capacidade: capacidadeFinal,
      numeroSerie: formEquipamento.numeroSerie,
      tipoIntegracao: formEquipamento.tipoIntegracao,
      token: formEquipamento.token,
      temperaturaAtual: "-",
      consumoAtual: "-",
      setpoint: null,
      modo: null,
      firmware: "v1.0.0",
      ultimoPing: "-",
      saudeSensor: "Indisponível",
    };

    setEquipamentos((prev) => [...prev, novo]);
    addNotification({
      type: "success",
      message: t('equipamentosPage.equipamentoAdicionado').replace('{model}', novo.modelo).replace('{location}', novo.local),
    });
    setShowModal(false);
  };

  const getStatusClass = (status) => {
    if (status === "Ativo") return "status-ativo";
    if (status === "Inativo") return "status-inativo";
    if (status === "Offline") return "status-offline";
    return "";
  };
  const getHealthInfo = (status) => {
    if (status === "Ativo") return { label: t('equipamentosPage.operando'), cls: "health-ok" };
    if (status === "Inativo") return { label: t('equipamentosPage.emEspera'), cls: "health-standby" };
    if (status === "Offline") return { label: t('equipamentosPage.semSinal'), cls: "health-offline" };
    return { label: "-", cls: "" };
  };
  const formatModo = (modo) => {
    if (!modo) return "-";
    const mapa = {
      auto: t('equipamentosPage.automatico'),
      cool: t('equipamentosPage.frio'),
      heat: t('equipamentosPage.aquecimento'),
      fan: t('equipamentosPage.ventilacao'),
      dry: t('equipamentosPage.seco'),
    };
    return mapa[modo] || modo;
  };
  const getSensorClass = (saude) => {
    const valor = String(saude || "").toLowerCase();
    if (valor.includes("ok")) return "sensor-ok";
    if (valor.includes("aten") || valor.includes("alert")) return "sensor-alert";
    if (valor.includes("crit")) return "sensor-critico";
    if (valor.includes("indis") || valor.includes("sem")) return "sensor-off";
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

  const parseWatts = (value) => {
    if (!value || value === "-") return 0;
    const raw = String(value).replace("W", "").replace(",", ".").trim();
    const num = parseFloat(raw);
    return Number.isNaN(num) ? 0 : num;
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
  const resumo = useMemo(() => {
    const ativos = equipamentos.filter((e) => e.status === "Ativo").length;
    const inativos = equipamentos.filter((e) => e.status === "Inativo").length;
    const offline = equipamentos.filter((e) => e.status === "Offline").length;
    const consumoAtivoW = equipamentos.reduce((acc, e) => {
      if (e.status !== "Ativo") return acc;
      return acc + parseWatts(e.consumoAtual);
    }, 0);
    const consumoFormatado =
      consumoAtivoW >= 1000
        ? `${(consumoAtivoW / 1000).toFixed(1)} kW`
        : `${consumoAtivoW} W`;

    const tempsAtivas = equipamentos
      .map((e) => (e.status === "Ativo" ? parseTemp(e.temperaturaAtual) : null))
      .filter((v) => v !== null);
    const mediaTemp =
      tempsAtivas.length > 0
        ? Math.round(
          tempsAtivas.reduce((a, b) => a + b, 0) / tempsAtivas.length
        )
        : null;

    return {
      total: equipamentos.length,
      ativos,
      inativos,
      offline,
      consumo: consumoFormatado,
      tempMedia: mediaTemp !== null ? `${mediaTemp}°C` : "-",
    };
  }, [equipamentos]);

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
      addNotification({
        type: "info",
        message: t('equipamentosPage.equipamentoDesligado').replace('{model}', eq.modelo).replace('{location}', eq.local),
      });
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
    addNotification({
      type: "info",
      message: t('equipamentosPage.equipamentoLigado').replace('{model}', eq.modelo).replace('{location}', eq.local),
    });
  };

  const changeSetpoint = (id, delta) => {
    const eq = equipamentos.find((e) => e.id === id);
    if (!eq || eq.status !== "Ativo") return;

    const next = clamp((eq.setpoint ?? 24) + delta, 16, 30);
    patchEquipamento(id, { setpoint: next });
    addNotification({
      type: "info",
      message: t('equipamentosPage.setpointAjustado').replace('{model}', eq.modelo).replace('{value}', next),
    });
  };

  const cycleModo = (id) => {
    const eq = equipamentos.find((e) => e.id === id);
    if (!eq || eq.status !== "Ativo") return;

    const order = ["auto", "cool", "heat", "fan", "dry"];
    const cur = eq.modo || "auto";
    const idx = order.indexOf(cur);
    const next = order[(idx + 1) % order.length];

    patchEquipamento(id, { modo: next });
    addNotification({
      type: "info",
      message: t('equipamentosPage.modoAlterado').replace('{model}', eq.modelo).replace('{mode}', formatModo(next)),
    });
  };

  return (
    <div className="app">
      <div className="equipamentos-page">
        <button
          className="btn-secondary"
          style={{ marginBottom: "20px" }}
          onClick={() => navigate(-1)}
        >
          {t('equipamentosPage.voltar')}

        </button>

        {/* HEADER */}
        <div className="page-header">
          <div>
            <h1 className="page-title">{t('equipamentosPage.title')}</h1>
            <p className="page-subtitle">{t('equipamentosPage.subtitle')}</p>
          </div>
        </div>

        {/* MINI DASHBOARD */}
        <div className="mini-dashboard">
          <div
            className={`dashboard-card total ${filtroStatus === "TODOS" ? "selecionado" : ""
              }`}
            onClick={() => setFiltroStatus("TODOS")}
          >
            <span className="dash-number">{resumo.total}</span>
            <span className="dash-label">{t('equipamentosPage.total')}</span>
          </div>
          <div
            className={`dashboard-card ativo ${filtroStatus === "Ativo" ? "selecionado" : ""
              }`}
            onClick={() => setFiltroStatus("Ativo")}
          >
            <span className="dash-number">{resumo.ativos}</span>
            <span className="dash-label">{t('equipamentosPage.ativos')}</span>
          </div>
          <div
            className={`dashboard-card inativo ${filtroStatus === "Inativo" ? "selecionado" : ""
              }`}
            onClick={() => setFiltroStatus("Inativo")}
          >
            <span className="dash-number">{resumo.inativos}</span>
            <span className="dash-label">{t('equipamentosPage.inativos')}</span>
          </div>
          <div
            className={`dashboard-card offline ${filtroStatus === "Offline" ? "selecionado" : ""
              }`}
            onClick={() => setFiltroStatus("Offline")}
          >
            <span className="dash-number">{resumo.offline}</span>
            <span className="dash-label">{t('equipamentosPage.offline')}</span>
          </div>
          <div className="dashboard-card consumo">
            <span className="dash-number">{resumo.consumo}</span>
            <span className="dash-label">{t('equipamentosPage.consumoAtual')}</span>
          </div>
          <div className="dashboard-card temperatura">
            <span className="dash-number">{resumo.tempMedia}</span>
            <span className="dash-label">{t('equipamentosPage.tempMedia')}</span>
          </div>
        </div>

        {/* AÇÕES */}
        <div className="equipamentos-toolbar">
          <div className="toolbar-left">
            <button
              className="btn-filtros"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
            >
              {t('equipamentosPage.filtros')}
            </button>

            {mostrarFiltros && (
              <>
                <div className="search-box">
                  <input
                    type="text"
                    placeholder={t('equipamentosPage.buscarPlaceholder')}
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>

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
                  {t('equipamentosPage.limpar')}
                </button>
              </>
            )}
          </div>

          <div className="toolbar-right">
            <button className="btn-primary" onClick={abrirModalCriacao}>
              {t('equipamentosPage.adicionarEquipamento')}
            </button>
          </div>
        </div>
        {/* GRID */}
        <div className="devices-grid">
          {equipamentosFiltrados.map((equipamento) => {
            const isOffline = equipamento.status === "Offline";
            const isActive = equipamento.status === "Ativo";
            const health = getHealthInfo(equipamento.status);
            const codigo = String(equipamento.id).padStart(3, "0");

            return (
              <div className="device-card" key={equipamento.id}>
                <div className="device-header">
                  <div className="device-title-group">
                    <span className="device-code">AC-{codigo}</span>
                    <h3 className="device-title">{equipamento.modelo}</h3>
                    <span className="device-capacity">{equipamento.capacidade}</span>
                  </div>
                  <div className="device-status">
                    <span
                      className={`status ${getStatusClass(equipamento.status)}`}
                    >
                      {equipamento.status}
                    </span>
                    <span className={`health-badge ${health.cls}`}>
                      {health.label}
                    </span>
                  </div>
                </div>

                <div className="device-meta">
                  <span className="meta-item">{equipamento.local}</span>
                  <span className="meta-divider">•</span>
                  <span className="meta-item">
                    {`${t('equipamentosPage.modoLabel')} ${formatModo(equipamento.modo)}`}
                  </span>
                </div>

                <div className="device-kpis">
                  <div className="kpi">
                    <span className="kpi-label">{t('equipamentosPage.tempAtual')}</span>
                    <span
                      className={`temp-badge ${getTempClass(
                        equipamento.temperaturaAtual
                      )}`}
                    >
                      {equipamento.temperaturaAtual}
                    </span>
                  </div>
                  <div className="kpi">
                    <span className="kpi-label">{t('equipamentosPage.setpoint')}</span>
                    <span className="kpi-value">
                      {equipamento.setpoint !== null &&
                        equipamento.setpoint !== undefined
                        ? `${equipamento.setpoint}°C`
                        : "-"}
                    </span>
                  </div>
                  <div className="kpi">
                    <span className="kpi-label">{t('equipamentosPage.consumo')}</span>
                    <span className="kpi-value">{equipamento.consumoAtual}</span>
                  </div>
                  <div className="kpi">
                    <span className="kpi-label">{t('equipamentosPage.capacidade')}</span>
                    <span className="kpi-value">{equipamento.capacidade}</span>
                  </div>
                </div>

                <div className="device-specs">
                  <div className="spec">
                    <span className="spec-label">{t('equipamentosPage.firmware')}</span>
                    <span className="spec-value">
                      {equipamento.firmware || "-"}
                    </span>
                  </div>
                  <div className="spec">
                    <span className="spec-label">{t('equipamentosPage.ultimoPing')}</span>
                    <span className="spec-value">
                      {equipamento.ultimoPing || "-"}
                    </span>
                  </div>
                  <div className="spec">
                    <span className="spec-label">{t('equipamentosPage.sensor')}</span>
                    <span
                      className={`spec-badge ${getSensorClass(
                        equipamento.saudeSensor,
                      )}`}
                    >
                      {equipamento.saudeSensor || "-"}
                    </span>
                  </div>
                </div>

                <div className="device-controls">
                  <button
                    className="btn-ctrl"
                    onClick={() => abrirModalEdicao(equipamento)}
                  >
                    {t('equipamentosPage.editar')}
                  </button>
                  <button
                    className={`btn-power ${isActive ? "on" : "off"}`}
                    disabled={isOffline}
                    onClick={() => togglePower(equipamento.id)}
                    title={
                      isOffline
                        ? t('equipamentosPage.equipamentoOffline')
                        : isActive
                          ? t('equipamentosPage.desligar')
                          : t('equipamentosPage.ligar')
                    }
                  >
                    {isActive ? t('equipamentosPage.desligar') : t('equipamentosPage.ligar')}
                  </button>

                  <button
                    className="btn-ctrl"
                    disabled={!isActive}
                    onClick={() => changeSetpoint(equipamento.id, -1)}
                    title={!isActive ? t('equipamentosPage.ativeEquipamento') : t('equipamentosPage.diminuirSetpoint')}
                  >
                    -
                  </button>

                  <button
                    className="btn-ctrl"
                    disabled={!isActive}
                    onClick={() => changeSetpoint(equipamento.id, +1)}
                    title={!isActive ? t('equipamentosPage.ativeEquipamento') : t('equipamentosPage.aumentarSetpoint')}
                  >
                    +
                  </button>

                  <button
                    className="btn-ctrl"
                    disabled={!isActive}
                    onClick={() => cycleModo(equipamento.id)}
                    title={!isActive ? t('equipamentosPage.ativeEquipamento') : t('equipamentosPage.trocarModo')}
                  >
                    {t('equipamentosPage.modo')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div
              className="modal-content modal-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2 className="modal-title">
                  {modoEdicao ? t('equipamentosPage.editarEquipamento') : t('equipamentosPage.adicionarNovo')}
                </h2>
                <button
                  className="modal-close"
                  onClick={() => setShowModal(false)}
                  aria-label={t('equipamentosPage.fecharModal')}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <p className="modal-description">
                  {t('equipamentosPage.descricaoModal')}
                </p>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>{t('equipamentosPage.nomeEquipamento')}</label>
                    <input
                      placeholder={t('equipamentosPage.nomePlaceholder')}
                      value={formEquipamento.nome}
                      onChange={(e) =>
                        setFormEquipamento({
                          ...formEquipamento,
                          nome: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('equipamentosPage.localizacao')}</label>
                    <input
                      placeholder={t('equipamentosPage.localPlaceholder')}
                      value={formEquipamento.local}
                      onChange={(e) =>
                        setFormEquipamento({
                          ...formEquipamento,
                          local: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('equipamentosPage.modeloLabel')}</label>
                    <input
                      placeholder={t('equipamentosPage.modeloPlaceholder')}
                      value={formEquipamento.modelo}
                      onChange={(e) =>
                        setFormEquipamento({
                          ...formEquipamento,
                          modelo: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('equipamentosPage.capacidadeBTU')}</label>
                    <input
                      placeholder={t('equipamentosPage.capacidadePlaceholder')}
                      value={formEquipamento.capacidade}
                      onChange={(e) =>
                        setFormEquipamento({
                          ...formEquipamento,
                          capacidade: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('equipamentosPage.numeroSerie')}</label>
                    <input
                      placeholder={t('equipamentosPage.seriePlaceholder')}
                      value={formEquipamento.numeroSerie}
                      onChange={(e) =>
                        setFormEquipamento({
                          ...formEquipamento,
                          numeroSerie: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('equipamentosPage.tipoIntegracao')}</label>
                    <select
                      value={formEquipamento.tipoIntegracao}
                      onChange={(e) =>
                        setFormEquipamento({
                          ...formEquipamento,
                          tipoIntegracao: e.target.value,
                        })
                      }
                    >
                      <option value="BRISE">BRISE</option>
                      <option value="SMART">SMART</option>
                    </select>
                  </div>

                  {formEquipamento.tipoIntegracao === "SMART" && (
                    <>
                      <div className="smart-info full-width">
                        {t('equipamentosPage.smartInfo')}
                      </div>
                      <div className="form-group full-width">
                        <label>{t('equipamentosPage.tokenSmartThings')}</label>
                        <input
                          placeholder={t('equipamentosPage.tokenPlaceholder')}
                          value={formEquipamento.token}
                          onChange={(e) =>
                            setFormEquipamento({
                              ...formEquipamento,
                              token: e.target.value,
                            })
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn-criar-equipamento"
                  onClick={salvarEquipamento}
                >
                  {modoEdicao ? t('equipamentosPage.salvarAlteracoes') : t('equipamentosPage.cadastrarEquipamento')}
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

