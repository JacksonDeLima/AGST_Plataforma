import { useState } from "react";
import ModalRotinaHorario from "../../components/automacoes/ModalRotinaHorario";
import ModalOcupacao from "../../components/automacoes/ModalOcupacao";

import React from "react";
import "./automacoes.css";

export default function Automacoes() {
  const [mostrarRotina, setMostrarRotina] = useState(false);
  const [mostrarOcupacao, setMostrarOcupacao] = useState(false);

  return (
    <div className="automacoes-container">
      <div className="automacoes-header">
        <div>
          <h1>Automações</h1>
          <p>Crie e gerencie automações inteligentes para seus equipamentos</p>
        </div>

        <div className="automacoes-actions">
            <button
  className="btn-primary"
  onClick={() => setMostrarOcupacao(true)}
>
  Nova Automação por Ocupação
</button>

<button
  className="btn-secondary"
  onClick={() => setMostrarRotina(true)}
>
  Nova Rotina por Horário
</button>

        </div>
      </div>

      {/* AUTOMAÇÕES POR OCUPAÇÃO */}
      <div className="automacoes-card">
        <div className="automacoes-card-header">
          <div className="title">
            <span>👥</span>
            <h2>Automações por Ocupação</h2>
          </div>

          <div className="status">
            <span className="ativo">0 Ativas</span>
            <span className="inativo">0 Inativas</span>
          </div>
        </div>

        <div className="automacoes-empty">
          Nenhuma automação por ocupação configurada.
        </div>
      </div>

      {/* ROTINAS POR HORÁRIO */}
      <div className="automacoes-card">
        <div className="automacoes-card-header">
          <div className="title">
            <span>🕒</span>
            <h2>Rotinas por Horário</h2>
          </div>

          <div className="status">
            <span className="ativo">0 Ativas</span>
            <span className="inativo">0 Inativas</span>
          </div>
        </div>

        <div className="automacoes-empty">
          Nenhuma rotina por horário configurada.
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
