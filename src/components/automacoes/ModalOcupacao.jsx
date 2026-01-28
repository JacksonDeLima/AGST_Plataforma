import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import "./automacoesModal.css";

export default function ModalOcupacao({ onClose }) {
  const { t } = useLanguage();

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>{t('automacoes.modal.ocupacaoTitulo')}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <p className="modal-subtitle">
          {t('automacoes.modal.ocupacaoSubtitulo')}
        </p>

        <label>{t('automacoes.modal.nomeAutomacao')}</label>
        <input placeholder={t('automacoes.modal.placeholderOcupacao')} />

        <label>{t('automacoes.modal.tempoInatividade')}</label>
        <input type="range" min="5" max="60" />
        <div className="range-labels">
          <span>{t('automacoes.modal.min5')}</span>
          <span>{t('automacoes.modal.min20')}</span>
          <span>{t('automacoes.modal.min60')}</span>
        </div>

        <div className="toggle">
          <span>{t('automacoes.modal.religarMovimento')}</span>
          <input type="checkbox" defaultChecked />
        </div>

        <div className="toggle">
          <span>{t('automacoes.modal.respeitarHorarios')}</span>
          <input type="checkbox" defaultChecked />
        </div>

        <label>{t('automacoes.modal.ambientesControlados')}</label>
        <div className="empty-box">{t('automacoes.modal.nenhumAmbiente')}</div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            {t('automacoes.modal.cancelar')}
          </button>
          <button className="btn-confirm">{t('automacoes.modal.criarAutomacao')}</button>
        </div>
      </div>
    </div>
  );
}
