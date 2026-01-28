import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import "./automacoesModal.css";

export default function ModalRotinaHorario({ onClose }) {
  const { t } = useLanguage();

  function criarRotina() {
    alert("Rotina criada com sucesso (simulação)");
    onClose();
  }

  const dias = [
    { key: 'segunda', default: 'Segunda-feira' },
    { key: 'terca', default: 'Terça-feira' },
    { key: 'quarta', default: 'Quarta-feira' },
    { key: 'quinta', default: 'Quinta-feira' },
    { key: 'sexta', default: 'Sexta-feira' },
    { key: 'sabado', default: 'Sábado' },
    { key: 'domingo', default: 'Domingo' }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>{t('automacoes.modal.rotinaTitulo')}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <p className="modal-subtitle">
          {t('automacoes.modal.rotinaSubtitulo')}
        </p>

        <label>{t('automacoes.modal.nomeRotina')}</label>
        <input placeholder={t('automacoes.modal.placeholderRotina')} />

        <h4>{t('automacoes.modal.configDia')}</h4>

        {dias.map((dia) => (
          <div className="day-row" key={dia.key}>
            <span>{t(`automacoes.modal.dias.${dia.key}`)}</span>
            <span>▾</span>
          </div>
        ))}

        <label>{t('automacoes.modal.ambientes')}</label>
        <select>
          <option>{t('automacoes.modal.selecionarAmbientes')}</option>
        </select>

        <div className="exceptions">
          <span>{t('automacoes.modal.excecoes')}</span>
          <button className="btn-secondary">{t('automacoes.modal.adicionarExcecao')}</button>
        </div>

        <p className="hint">
          {t('automacoes.modal.nenhumaExcecao')}
        </p>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            {t('automacoes.modal.cancelar')}
          </button>
          <button className="btn-confirm" onClick={criarRotina}>
            {t('automacoes.modal.criarRotina')}
          </button>
        </div>
      </div>
    </div>
  );
}
