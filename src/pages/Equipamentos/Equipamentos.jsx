import React, { useState } from 'react';
import NavBar from '../../components/NavBar';
import './Equipamentos.css';

const Equipamentos = () => {
  const [equipamentos, setEquipamentos] = useState([
    {
      id: 1,
      modelo: 'Samsung',
      status: 'Ativo',
      local: 'Escritório Gerência',
      capacidade: '12000 BTU',
      temperaturaAtual: '23°C',
      consumoAtual: '5000 W'
    },
    {
      id: 2,
      modelo: 'Samsung',
      status: 'Ativo',
      local: 'Escritório Gerência',
      capacidade: '16000 BTU',
      temperaturaAtual: '23°C',
      consumoAtual: '5000 W'
    },
    {
      id: 3,
      modelo: 'Samsung',
      status: 'Ativo',
      local: 'Escritório Gerência',
      capacidade: '9000 BTU',
      temperaturaAtual: '23°C',
      consumoAtual: '5000 W'
    },
    {
      id: 4,
      modelo: 'Samsung',
      status: 'Ativo',
      local: 'Escritório Gerência',
      capacidade: '9000 BTU',
      temperaturaAtual: '23°C',
      consumoAtual: '5000 W'
    },
    {
      id: 5,
      modelo: 'Samsung',
      status: 'Ativo',
      local: 'Escritório Gerência',
      capacidade: '12000 BTU',
      temperaturaAtual: '23°C',
      consumoAtual: '5000 W'
    },
    {
      id: 6,
      modelo: 'Samsung',
      status: 'Ativo',
      local: 'Escritório Gerência',
      capacidade: '16000 BTU',
      temperaturaAtual: '23°C',
      consumoAtual: '5000 W'
    },
    {
      id: 7,
      modelo: 'Samsung',
      status: 'Inativo',
      local: 'Escritório Gerência',
      capacidade: '9000 BTU',
      temperaturaAtual: '26°C',
      consumoAtual: '0 W'
    },
    {
      id: 8,
      modelo: 'Samsung',
      status: 'Offline',
      local: 'Escritório Gerência',
      capacidade: '9000 BTU',
      temperaturaAtual: '-',
      consumoAtual: '-'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(null);
  const [novoEquipamento, setNovoEquipamento] = useState({
    modelo: '',
    local: '',
    capacidade: '',
    mac: '',
    ip: ''
  });

  const handleAdicionarEquipamento = () => {
    setShowModal(true);
  };

  const handleFecharModal = () => {
    setShowModal(false);
    setNovoEquipamento({
      modelo: '',
      local: '',
      capacidade: '',
      mac: '',
      ip: ''
    });
  };

  const handleCriarEquipamento = () => {
    if (novoEquipamento.modelo && novoEquipamento.local && novoEquipamento.capacidade) {
      const equipamento = {
        id: equipamentos.length + 1,
        modelo: novoEquipamento.modelo,
        status: 'Offline',
        local: novoEquipamento.local,
        capacidade: novoEquipamento.capacidade,
        temperaturaAtual: '-',
        consumoAtual: '-'
      };
      setEquipamentos([...equipamentos, equipamento]);
      handleFecharModal();
    }
  };

  const handleEditarEquipamento = (equipamento) => {
    setEquipamentoSelecionado(equipamento);
    setShowEditModal(true);
  };

  const handleFecharEditModal = () => {
    setShowEditModal(false);
    setEquipamentoSelecionado(null);
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Ativo': return 'status-ativo';
      case 'Inativo': return 'status-inativo';
      case 'Offline': return 'status-offline';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Ativo': return '●';
      case 'Inativo': return '●';
      case 'Offline': return '●';
      default: return '';
    }
  };

  return (
    <div className="app">
         <NavBar />
    <div className="equipamentos-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Equipamentos</h1>
          <p className="page-subtitle">Adicione ou gerencie seus equipamentos</p>
        </div>
        <div className="header-right">
          <div className="ativos-count">
            <span className="status-dot ativo"></span>
            <span>Ativos: 6/8</span>
          </div>
          <button className="btn-primary" onClick={handleAdicionarEquipamento}>
            + Adicionar Equipamento
          </button>
          <button className="btn-filtros">
            <span className="filtros-icon">☰</span>
            Filtros
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="table-container">
        <table className="equipamentos-table">
          <thead>
            <tr>
              <th>Modelo</th>
              <th>Status</th>
              <th>Local</th>
              <th>Capacidade</th>
              <th>Temperatura Atual</th>
              <th>Consumo Atual</th>
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
                    Editar
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
              <h2 className="modal-title">Novo Equipamento</h2>
              <button className="modal-close" onClick={handleFecharModal}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Modelo</label>
                <input
                  type="text"
                  placeholder="Ex: Samsung"
                  value={novoEquipamento.modelo}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, modelo: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Local</label>
                <input
                  type="text"
                  placeholder="Ex: Escritório Gerência"
                  value={novoEquipamento.local}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, local: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Capacidade</label>
                <input
                  type="text"
                  placeholder="Ex: 12000 BTU"
                  value={novoEquipamento.capacidade}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, capacidade: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>MAC Address</label>
                <input
                  type="text"
                  placeholder="Ex: 00:1A:2B:3C:4D:5E"
                  value={novoEquipamento.mac}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, mac: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Endereço IP</label>
                <input
                  type="text"
                  placeholder="Ex: 192.168.1.100"
                  value={novoEquipamento.ip}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, ip: e.target.value})}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-criar-equipamento" onClick={handleCriarEquipamento}>
                Adicionar Equipamento
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
              <h2 className="modal-title">Editar Equipamento</h2>
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
                Salvar Alterações
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