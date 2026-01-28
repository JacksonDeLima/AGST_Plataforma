import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./DetalhesAutomacao.css";

import AutomacaoForm from "../../components/automacoes/AutomacaoForm";

import {
  buscarAutomacaoPorId,
  editarAutomacao,
  alterarStatusAutomacao,
} from "../../services/automacoesService";

const DetalhesAutomacao = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // =========================
  // STATES
  // =========================
  const [automacao, setAutomacao] = useState(null);
  const [status, setStatus] = useState("ATIVA");
  const [loading, setLoading] = useState(true);

  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [mostrarEdicao, setMostrarEdicao] = useState(false);
  const [toast, setToast] = useState("");

  // =========================
  // BUSCAR AUTOMAÇÃO
  // =========================
  useEffect(() => {
    buscarAutomacaoPorId(id).then((dados) => {
      setAutomacao(dados);
      setStatus(dados.status || "ATIVA");
      setLoading(false);
    });
  }, [id]);

  // =========================
  // HELPERS
  // =========================
  const mostrarToast = (mensagem) => {
    setToast(mensagem);
    setTimeout(() => setToast(""), 3000);
  };

  // =========================
  // AÇÕES
  // =========================
  const confirmarAlteracaoStatus = async () => {
    const novoStatus = status === "ATIVA" ? "PAUSADA" : "ATIVA";

    await alterarStatusAutomacao(id, novoStatus);

    setStatus(novoStatus);
    setMostrarConfirmacao(false);
    mostrarToast("Status da automação atualizado");
  };

  const salvarEdicao = async (dadosForm) => {
    await editarAutomacao(id, dadosForm);

    setAutomacao({
      ...automacao,
      ambiente: dadosForm.ambiente,
      dias: dadosForm.dias,
      horarioInicio: dadosForm.inicio,
      horarioFim: dadosForm.fim,
      equipamentos: dadosForm.equipamentos,
    });

    setMostrarEdicao(false);
    mostrarToast("Automação editada com sucesso");
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return <p style={{ padding: 32 }}>Carregando automação...</p>;
  }

  // =========================
  // RENDER
  // =========================
  return (
    <div className="automacao-detalhes-page">
      <button className="btn-secondary" onClick={() => navigate("/automacoes")}>
        ← Voltar
      </button>

      {/* HEADER */}
      <div className="detalhes-header">
        <h1>{automacao.nome}</h1>

        <span
          className={`status-badge ${
            status === "ATIVA" ? "status-ativa" : "status-pausada"
          }`}
        >
          {status === "ATIVA" ? "🟢 Ativa" : "🟡 Pausada"}
        </span>
      </div>

      {/* CARD */}
      <div className="detalhes-box">
        <div className="info-row">
          <span className="info-label">Tipo</span>
          <span className="info-value">
            {automacao.tipo === "HORARIO"
              ? "⏰ Por Horário"
              : "👤 Por Ocupação"}
          </span>
        </div>

        <div className="info-row">
          <span className="info-label">Ambiente</span>
          <span className="info-value">{automacao.ambiente}</span>
        </div>

        <div className="info-row">
          <span className="info-label">Dias</span>
          <span className="info-value">
            {(automacao.dias || []).join(", ")}
          </span>
        </div>

        <div className="info-row">
          <span className="info-label">Horário</span>
          <span className="info-value">
            {automacao.horarioInicio} → {automacao.horarioFim}
          </span>
        </div>

        <h3 className="section-title">Equipamentos afetados</h3>
        <ul className="equipamentos-list">
          {automacao.equipamentos.map((e, i) => (
            <li key={i}>✔ {e}</li>
          ))}
        </ul>

        {/* AÇÕES */}
        <div className="detalhes-actions">
          <button
            className="btn-secondary"
            onClick={() => setMostrarEdicao(true)}
          >
            ✏️ Editar Automação
          </button>

          <button
            className={`btn-toggle ${
              status === "ATIVA" ? "pausar" : "ativar"
            }`}
            onClick={() => setMostrarConfirmacao(true)}
          >
            {status === "ATIVA" ? "⏸ Pausar" : "▶ Ativar"}
          </button>

          <button
            className="btn-secondary"
            onClick={() => navigate(`/automacoes/${id}/historico`)}
          >
            Histórico
          </button>
        </div>
      </div>

      {/* MODAL CONFIRMAR STATUS */}
      {mostrarConfirmacao && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmar ação</h3>

            <p>
              Deseja{" "}
              <strong>{status === "ATIVA" ? "pausar" : "ativar"}</strong> esta
              automação?
            </p>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setMostrarConfirmacao(false)}
              >
                Cancelar
              </button>

              <button
                className="btn-primary"
                onClick={confirmarAlteracaoStatus}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR (USANDO FORM AVANÇADO) */}
      {mostrarEdicao && (
        <div className="modal-overlay">
          <div className="modal-content modal-lg">
            <h3>Editar Automação</h3>

            <AutomacaoForm
              initialData={{
                ambiente: automacao.ambiente,
                dias: automacao.dias,
                inicio: automacao.horarioInicio,
                fim: automacao.horarioFim,
                equipamentos: automacao.equipamentos,
              }}
              onCancel={() => setMostrarEdicao(false)}
              onSave={salvarEdicao}
            />
          </div>
        </div>
      )}

      {toast && <div className="toast-success">{toast}</div>}
    </div>
  );
};

export default DetalhesAutomacao;
