import { useState } from "react";
import ModalRotinaHorario from "../../components/automacoes/ModalRotinaHorario";
import ModalOcupacao from "../../components/automacoes/ModalOcupacao";
import { useLanguage } from "../../context/LanguageContext";

import React from "react";
import "./automacoes.css";

export default function Automacoes() {
  const { t } = useLanguage();
  const [mostrarRotina, setMostrarRotina] = useState(false);
  const [mostrarOcupacao, setMostrarOcupacao] = useState(false);

  return (
    <div className="automacoes-container">
      <div className="automacoes-header">
        <div>
          <h1>{t('automacoes.title')}</h1>
          <p>{t('automacoes.subtitle')}</p>
        </div>

        <div className="automacoes-actions">
          <button
            className="btn-primary"
            onClick={() => setMostrarOcupacao(true)}
          >
            {t('automacoes.novaOcupacao')}
          </button>

          <button
            className="btn-secondary"
            onClick={() => setMostrarRotina(true)}
          >
            {t('automacoes.novaRotina')}
          </button>

        </div>
      </div>

      {/* AUTOMAÇÕES POR OCUPAÇÃO */}
      <div className="automacoes-card">
        <div className="automacoes-card-header">
          <div className="title">
            <span>👥</span>
            <h2>{t('automacoes.porOcupacao')}</h2>
          </div>

          <div className="status">
            <span className="ativo">0 {t('automacoes.ativas')}</span>
            <span className="inativo">0 {t('automacoes.inativas')}</span>
          </div>
        </div>

        <div className="automacoes-empty">
          {t('automacoes.nenhumaOcupacao')}
        </div>
      </div>

      {/* ROTINAS POR HORÁRIO */}
      <div className="automacoes-card">
        <div className="automacoes-card-header">
          <div className="title">
            <span>🕒</span>
            <h2>{t('automacoes.porHorario')}</h2>
          </div>

          <div className="status">
            <span className="ativo">0 {t('automacoes.ativas')}</span>
            <span className="inativo">0 {t('automacoes.inativas')}</span>
          </div>
        </div>

        <div className="automacoes-empty">
          {t('automacoes.nenhumaRotina')}
        </div>
      </div>
      {mostrarRotina && (
        <ModalRotinaHorario onClose={() => setMostrarRotina(false)} />
      )}

      {mostrarOcupacao && (
        <ModalOcupacao onClose={() => setMostrarOcupacao(false)} />
      )}

    </div>
  );
}
