import React from "react";
import "./automacoesModal.css";

export default function ModalRotinaHorario({ onClose }) {
    function criarRotina() {
  alert("Rotina criada com sucesso (simulação)");
  onClose();
}

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>🕒 Nova Rotina por Horário</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <p className="modal-subtitle">
          Configure uma automação baseada em horários específicos
        </p>

        <label>Nome da Rotina</label>
        <input placeholder="Ex: Economia Noturna" />

        <h4>Configuração por Dia da Semana</h4>

        {[
          "Segunda-feira",
          "Terça-feira",
          "Quarta-feira",
          "Quinta-feira",
          "Sexta-feira",
          "Sábado",
          "Domingo",
        ].map((dia) => (
          <div className="day-row" key={dia}>
            <span>{dia}</span>
            <span>▾</span>
          </div>
        ))}

        <label>Ambientes</label>
        <select>
          <option>Selecionar ambientes</option>
        </select>

        <div className="exceptions">
          <span>📅 Exceções (Feriados / Dias Fechados)</span>
          <button className="btn-secondary">+ Adicionar</button>
        </div>

        <p className="hint">
          Nenhuma exceção configurada. Adicione feriados ou dias específicos.
        </p>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-confirm" onClick={criarRotina}>
            Criar Rotina
          </button>

        </div>
      </div>
    </div>
  );
}
