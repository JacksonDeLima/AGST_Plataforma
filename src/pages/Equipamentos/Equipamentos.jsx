import React, { useState } from "react";
import NavBar from "../../components/NavBar";
import "./Equipamentos.css";

const Equipamentos = () => {
  const [showModal, setShowModal] = useState(false);

  const [equipamentos] = useState([
    { id: 1, modelo: "Samsung", status: "Ativo", local: "Escritório Gerência", capacidade: "12000 BTU", temperaturaAtual: "23°C", consumoAtual: "5000 W" },
    { id: 2, modelo: "Samsung", status: "Ativo", local: "Escritório Gerência", capacidade: "16000 BTU", temperaturaAtual: "23°C", consumoAtual: "5000 W" },
    { id: 3, modelo: "Samsung", status: "Ativo", local: "Escritório Gerência", capacidade: "9000 BTU", temperaturaAtual: "23°C", consumoAtual: "5000 W" },
    { id: 4, modelo: "Samsung", status: "Ativo", local: "Escritório Gerência", capacidade: "9000 BTU", temperaturaAtual: "23°C", consumoAtual: "5000 W" },
    { id: 5, modelo: "Samsung", status: "Ativo", local: "Escritório Gerência", capacidade: "12000 BTU", temperaturaAtual: "23°C", consumoAtual: "5000 W" },
    { id: 6, modelo: "Samsung", status: "Ativo", local: "Escritório Gerência", capacidade: "16000 BTU", temperaturaAtual: "23°C", consumoAtual: "5000 W" },
    { id: 7, modelo: "Samsung", status: "Inativo", local: "Escritório Gerência", capacidade: "9000 BTU", temperaturaAtual: "26°C", consumoAtual: "0 W" },
    { id: 8, modelo: "Samsung", status: "Offline", local: "Escritório Gerência", capacidade: "9000 BTU", temperaturaAtual: "-", consumoAtual: "-" }
  ]);

  const getStatusClass = (status) => {
    switch (status) {
      case "Ativo": return "status-ativo";
      case "Inativo": return "status-inativo";
      case "Offline": return "status-offline";
      default: return "";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Ativo": return "●";
      case "Inativo": return "●";
      case "Offline": return "●";
      default: return "";
    }
  };

  return (
    <div className="app">
      <NavBar />

      <main className="main-content">
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

            {/* BOTÃO QUE ABRE O MODAL */}
            <button className="btn-primary" onClick={() => setShowModal(true)}>
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
                    <button className="btn-action">
                      <span className="action-icon">✏️</span>
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL – AGORA ESTÁ DENTRO DO RETURN */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Adicionar Equipamento</h2>

              <form className="modal-form">
                <label>Número de Série</label>
                <input type="text" placeholder="Ex: 123456" className="modal-input" />

                <label>Nome do Equipamento</label>
                <input type="text" placeholder="Ex: AC Escritório" className="modal-input" />

                <div className="modal-grid">
                  <div>
                    <label>Grupo 1</label>
                    <input type="text" className="modal-input" />
                  </div>
                  <div>
                    <label>Grupo 2</label>
                    <input type="text" className="modal-input" />
                  </div>
                </div>

                <div className="modal-grid">
                  <div>
                    <label>Grupo 3</label>
                    <input type="text" className="modal-input" />
                  </div>
                  <div>
                    <label>Grupo 4</label>
                    <input type="text" className="modal-input" />
                  </div>
                </div>

                <label>BTUs</label>
                <select className="modal-input">
                  <option>Selecione...</option>
                  <option>9000 BTU</option>
                  <option>12000 BTU</option>
                  <option>18000 BTU</option>
                  <option>24000 BTU</option>
                </select>

                <label>Usuário do Dispositivo</label>
                <input type="text" placeholder="Usuário" className="modal-input" />

                <label>Senha do Dispositivo</label>
                <input type="password" placeholder="Senha" className="modal-input" />

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-save">
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Equipamentos;
