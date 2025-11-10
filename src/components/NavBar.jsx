import { Link } from "react-router-dom";
import React from 'react';
import './NavBar.css';

const NavBar = () => {
  return (
    <aside className="navbar">
      <h1 className="logo">Dashboard</h1>
      <p className="subtitle">Visão geral</p>
      
      <nav className="nav">
        <Link to="/dashboard" className="nav-item">
          <span className="icon">📍</span>
          Ambientes
        </Link>
        <Link to="/equipamentos" className="nav-item">
          <span className="icon">📦</span>
          Equipamentos
        </Link>
        <a href="/automacoes" className="nav-item">
          <span className="icon">❄️</span>
          Automações
        </a>
        <a href="/relatorios" className="nav-item">
          <span className="icon">📊</span>
          Relatórios
        </a>
        <a href="/usuarios" className="nav-item">
          <span className="icon">👤</span>
          Gerir usuários
        </a>
        <a href="/alarmes" className="nav-item">
          <span className="icon">⚠️</span>
          Alarmes
        </a>
        <a href="/configuracoes" className="nav-item">
          <span className="icon">⚙️</span>
          Configurações
        </a>
      </nav>

      <div className="user-section">
        <div className="user-avatar">👤</div>
        <span className="user-name">Nome</span>
      </div>
    </aside>
  );
};

export default NavBar;