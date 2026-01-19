import React, { useState } from 'react';
import './Automacoes.css';
import NavBar from '../../components/NavBar';

const Automacoes = () => {
  const [automacoes] = useState([
    {
      id: 1,
      nome: 'Rotina',
      descricao: 'Ar-condicionado liga automaticamente',
      status: 'ativo'
    }
  ]);

  return (
    <div className="app">
      {/* <NavBar /> */}

      <div className="automacoes-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Automações</h1>
          <p className="page-subtitle">Crie e gerencie automações para seus equipamentos</p>
        </div>
      </div>

      {/* Estado Vazio */}
      {automacoes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="50" fill="#E0F2FE" opacity="0.5"/>
              <path d="M60 35V85M35 60H85" stroke="#0EA5E9" strokeWidth="6" strokeLinecap="round"/>
              <circle cx="60" cy="60" r="35" stroke="#0EA5E9" strokeWidth="3" strokeDasharray="5 5"/>
            </svg>
          </div>
          <h2 className="empty-state-title">Nenhuma automação criada</h2>
          <p className="empty-state-text">
            Crie automações para controlar seus equipamentos automaticamente
          </p>
          <button className="btn-criar-automacao">
            + Criar Automação
          </button>
        </div>
      ) : (
        <div className="automacoes-container">
          {/* Card de Rotina */}
          <div className="automacao-card">
            <div className="automacao-header">
              <div className="automacao-info">
                <div className="automacao-icon">⏰</div>
                <div>
                  <h3 className="automacao-nome">Rotina</h3>
                  <p className="automacao-descricao">
                    Ar-condicionado liga automaticamente
                  </p>
                </div>
              </div>
              <div className="automacao-status">
                <span className="status-badge ativo">Ativo</span>
              </div>
            </div>

            <button className="btn-criar-rotina">
              Criar
            </button>
          </div>
        </div>
      )}
    </div>
q    </div>
  );
};

export default Automacoes;