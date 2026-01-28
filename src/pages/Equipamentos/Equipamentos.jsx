<<<<<<< HEAD
import React, { useState } from "react";
import "./Equipamentos.css";
=======
import React, { useState } from 'react';
import NavBar from '../../components/NavBar';
import { useLanguage } from '../../context/LanguageContext';
import './Equipamentos.css';
>>>>>>> 66da59357fb6cc4a4876ddf07f797d039d9f417a

const Equipamentos = () => {
  const { t } = useLanguage();
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
<<<<<<< HEAD
    if (status === "Ativo") return "status-ativo";
    if (status === "Inativo") return "status-inativo";
    if (status === "Offline") return "status-offline";
    return "";
  };

  const limparFiltros = () => {
    setFiltroStatus("TODOS");
    setFiltroAmbiente("TODOS");
=======
    switch (status) {
      case 'Ativo': return 'status-ativo';
      case 'Inativo': return 'status-inativo';
      case 'Offline': return 'status-offline';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Ativo': return '●';
      case 'Inativo': return '●';
      case 'Offline': return '●';
      default: return '';
    }
>>>>>>> 66da59357fb6cc4a4876ddf07f797d039d9f417a
  };

  return (
    <div className="app">
<<<<<<< HEAD
      <div className="equipamentos-page">
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
=======
      {/* <NavBar /> */}
      <div className="equipamentos-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">{t('equipamentos.title')}</h1>
            <p className="page-subtitle">{t('equipamentos.subtitle')}</p>
          </div>
          <div className="header-right">
            <div className="ativos-count">
              <span className="status-dot ativo"></span>
              <span>Ativos: 6/8</span>
            </div>
            <button className="btn-primary" onClick={handleAdicionarEquipamento}>
              {t('equipamentos.adicionarEquipamento')}
            </button>
            <button className="btn-filtros">
              <span className="filtros-icon">☰</span>
              {t('equipamentos.filtros')}
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="table-container">
          <table className="equipamentos-table">
            <thead>
              <tr>
                <th>{t('equipamentos.modelo')}</th>
                <th>{t('equipamentos.status')}</th>
                <th>{t('equipamentos.local')}</th>
                <th>{t('equipamentos.capacidade')}</th>
                <th>{t('equipamentos.temperaturaAtual')}</th>
                <th>{t('equipamentos.consumoAtual')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {equipamentos.map((equipamento) => (
                <tr key={equipamento.id}>
                  <td className="modelo-cell">{equipamento.modelo}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(equipamento.status)}`}>
                      <span className="status-icon">{getStatusIcon(equipamento.status)}</span>
                      {equipamento.status}
                    </span>
                  </td>
                  <td>{equipamento.local}</td>
                  <td>{equipamento.capacidade}</td>
                  <td>{equipamento.temperaturaAtual}</td>
                  <td>{equipamento.consumoAtual}</td>
                  <td>
                    <button
                      className="btn-action"
                      onClick={() => handleEditarEquipamento(equipamento)}
                    >
                      <span className="action-icon">✏️</span>
                      {t('equipamentos.editar')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Adicionar Equipamento */}
        {showModal && (
          <div className="modal-overlay" onClick={handleFecharModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">{t('equipamentos.novoEquipamento')}</h2>
                <button className="modal-close" onClick={handleFecharModal}>✕</button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>{t('equipamentos.modelo')}</label>
                  <input
                    type="text"
                    placeholder={t('equipamentos.placeholderModelo')}
                    value={novoEquipamento.modelo}
                    onChange={(e) => setNovoEquipamento({ ...novoEquipamento, modelo: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>{t('equipamentos.local')}</label>
                  <input
                    type="text"
                    placeholder={t('equipamentos.placeholderLocal')}
                    value={novoEquipamento.local}
                    onChange={(e) => setNovoEquipamento({ ...novoEquipamento, local: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>{t('equipamentos.capacidade')}</label>
                  <input
                    type="text"
                    placeholder={t('equipamentos.placeholderCapacidade')}
                    value={novoEquipamento.capacidade}
                    onChange={(e) => setNovoEquipamento({ ...novoEquipamento, capacidade: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>{t('equipamentos.macAddress')}</label>
                  <input
                    type="text"
                    placeholder={t('equipamentos.placeholderMac')}
                    value={novoEquipamento.mac}
                    onChange={(e) => setNovoEquipamento({ ...novoEquipamento, mac: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>{t('equipamentos.enderecoIP')}</label>
                  <input
                    type="text"
                    placeholder={t('equipamentos.placeholderIp')}
                    value={novoEquipamento.ip}
                    onChange={(e) => setNovoEquipamento({ ...novoEquipamento, ip: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-criar-equipamento" onClick={handleCriarEquipamento}>
                  {t('equipamentos.adicionarEquipamentoBtn')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar Equipamento */}
        {showEditModal && equipamentoSelecionado && (
          <div className="modal-overlay" onClick={handleFecharEditModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">{t('equipamentos.editarEquipamento')}</h2>
                <button className="modal-close" onClick={handleFecharEditModal}>✕</button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>Modelo</label>
                  <input
                    type="text"
                    value={equipamentoSelecionado.modelo}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label>Local</label>
                  <input
                    type="text"
                    value={equipamentoSelecionado.local}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label>Capacidade</label>
                  <input
                    type="text"
                    value={equipamentoSelecionado.capacidade}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select className="select-status">
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-salvar-equipamento" onClick={handleFecharEditModal}>
                  {t('equipamentos.salvarAlteracoes')}
                </button>
              </div>
>>>>>>> 66da59357fb6cc4a4876ddf07f797d039d9f417a
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Equipamentos;
