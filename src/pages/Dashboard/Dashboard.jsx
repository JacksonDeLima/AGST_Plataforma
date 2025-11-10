import React, { useState } from 'react';
import NavBar from '../../components/NavBar';
import './Dashboard.css';

const Dashboard = () => {
  const [ambientes] = useState([
    { id: 1, nome: 'Escritório Gerência', tipo: 'Sala', temperatura: 22, potencia: 10.5, status: 'online' },
    { id: 2, nome: 'Sala de Reuniões A', tipo: 'Sala', temperatura: 23, potencia: 9.5, status: 'online' },
    { id: 3, nome: 'Sala de Reuniões B', tipo: 'Sala', temperatura: 27, potencia: 0, status: 'offline' },
    { id: 4, nome: 'Escritório A', tipo: 'Sala', temperatura: 26, potencia: 0, status: 'offline' },
    { id: 5, nome: 'Escritório B', tipo: 'Sala', temperatura: 26, potencia: 0, status: 'offline' },
  ]);

  return (
    <div className="app">
      <NavBar />

      <main className="main-content">

        {/* Header */}
        <header className="header">
          <div className="header-actions">
            <button className="btn-secondary">+ Criar Grupo</button>
            <button className="btn-primary">+ Adicionar Ambiente</button>
          </div>
        </header>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Equipamentos Ativos</p>
            <div className="stat-value-row">
              <span className="stat-icon">📦</span>
              <span className="stat-value">6/8</span>
            </div>
          </div>

          <div className="stat-card">
            <p className="stat-label">Temperatura Média</p>
            <div className="stat-value-row">
              <span className="stat-icon">🌡️</span>
              <span className="stat-value">23°C</span>
            </div>
          </div>

          <div className="stat-card">
            <p className="stat-label">Consumo Atual</p>
            <div className="stat-value-row">
              <span className="stat-icon">⚡</span>
              <span className="stat-value">20.1 kW</span>
            </div>
          </div>

          <div className="stat-card">
            <p className="stat-label">Gasto Acumulado Hoje</p>
            <div className="stat-value-row">
              <span className="stat-icon">💰</span>
              <span className="stat-value">153 kWh | R$ 86,40</span>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span>Ambientes</span>
          <span className="separator">/</span>
          <span className="current">Filial 12</span>
        </div>

        {/* Lista de Ambientes */}
        <div className="ambientes-grid">
          {ambientes.map((ambiente) => (
            <div key={ambiente.id} className="ambiente-card">
              <div className="ambiente-header">
                <h3 className="ambiente-nome">{ambiente.nome}</h3>
                <button className="ambiente-menu">⚙️</button>
              </div>
              <p className="ambiente-tipo">{ambiente.tipo}</p>
              <div className="ambiente-info">
                <div className="info-row">
                  <span className="info-label">Temperatura atual</span>
                  <span className="info-value temperatura">{ambiente.temperatura}°C</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Potência</span>
                  <span className="info-value">{ambiente.potencia} kW</span>
                </div>
              </div>

              <button className="btn-controlar">
                Controlar 🔧
              </button>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
