import React from "react";
import "./automacoesModal.css";

export default function ModalOcupacao({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>👥 Nova Automação por Ocupação</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <p className="modal-subtitle">
          Configure uma automação baseada em detecção de presença
        </p>

        <label>Nome da Automação</label>
        <input placeholder="Ex: Ocupação Escritório" />

        <label>Tempo de inatividade para desligar</label>
        <input type="range" min="5" max="60" />
        <div className="range-labels">
          <span>5 min</span>
          <span>20 min</span>
          <span>60 min</span>
        </div>

        <div className="toggle">
          <span>Religar ao detectar movimento</span>
          <input type="checkbox" defaultChecked />
        </div>

        <div className="toggle">
          <span>Respeitar horários das rotinas</span>
          <input type="checkbox" defaultChecked />
        </div>

        <label>Ambientes controlados</label>
        <div className="empty-box">Nenhum ambiente disponível</div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-confirm">Criar Automação</button>
        </div>
      </div>
    </div>
  );
}
