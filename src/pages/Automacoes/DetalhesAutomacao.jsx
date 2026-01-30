import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./DetalhesAutomacao.css";

import AutomacaoForm from "../../components/automacoes/AutomacaoForm";
import { calcularImpactoAutomacaoDetalhado } from "../../utils/calcularImpactoAutomacao";

import {
  buscarAutomacaoPorId,
  editarAutomacao,
  alterarStatusAutomacao,
  buscarHistoricoAutomacao,
} from "../../services/automacoesService";
const LOGS_MOCK = [
  {
    id: 1,
    data: "27/01/2026 22:00",
    titulo: "Execução automática",
    detalhes: {
      device: "Ar Condicionado 01",
      acao: "Desligar",
      resultado: "Sucesso",
      duracao: "120 ms",
    },
  },
  {
    id: 2,
    data: "26/01/2026 22:00",
    titulo: "Execução automática",
    detalhes: {
      device: "Ar Condicionado 02",
      acao: "Desligar",
      resultado: "Erro",
      erro: "Dispositivo offline",
    },
  },
];

const DetalhesAutomacao = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // =========================
  // STATES
  // =========================
  const [logAberto, setLogAberto] = useState(null);

  const [automacao, setAutomacao] = useState(null);
  const [loading, setLoading] = useState(true);

  const [historico, setHistorico] = useState([]);
  const [loadingHistorico, setLoadingHistorico] = useState(true);

  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [mostrarEdicao, setMostrarEdicao] = useState(false);
  const [toast, setToast] = useState("");

  // =========================
  // BUSCAR AUTOMAÇÃO
  // =========================
  useEffect(() => {
    async function carregar() {
      const dados = await buscarAutomacaoPorId(id);
      setAutomacao(dados);
      setLoading(false);
    }

    carregar();
  }, [id]);

  useEffect(() => {
    buscarHistoricoAutomacao(id).then((dados) => {
      setHistorico(dados || []);
      setLoadingHistorico(false);
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
    const novoStatus = automacao.status === "ATIVA" ? "PAUSADA" : "ATIVA";

    await alterarStatusAutomacao(id, novoStatus);

    setAutomacao((prev) => ({
      ...prev,
      status: novoStatus,
    }));

    setMostrarConfirmacao(false);
    mostrarToast("Status da automação atualizado");
  };

  const salvarEdicao = async (dadosForm) => {
    await editarAutomacao(id, dadosForm);

    setAutomacao((prev) => ({
      ...prev,
      ambiente: dadosForm.ambiente,
      dias: dadosForm.dias,
      inicio: dadosForm.inicio,
      fim: dadosForm.fim,
      equipamentos: dadosForm.equipamentos,
      regra: dadosForm.regra,
    }));

    setMostrarEdicao(false);
    mostrarToast("Automação editada com sucesso");
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return <p style={{ padding: 32 }}>Carregando automação...</p>;
  }

  if (!automacao) {
    return <p style={{ padding: 32 }}>Automação não encontrada</p>;
  }
  const impacto = calcularImpactoAutomacaoDetalhado({
    dias: automacao?.dias,
    inicio: automacao?.horarioInicio || automacao?.inicio,
    fim: automacao?.horarioFim || automacao?.fim,
    equipamentos: automacao?.equipamentos,
  });

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
            automacao.status === "ATIVA" ? "status-ativa" : "status-pausada"
          }`}
        >
          {automacao.status === "ATIVA" ? "🟢 Ativa" : "🟡 Pausada"}
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
            {automacao.inicio} → {automacao.fim}
          </span>
        </div>

        <h3 className="section-title">Equipamentos afetados</h3>
        <ul className="equipamentos-list">
          {(automacao.equipamentos || []).map((e, i) => (
            <li key={i}>✔ {e}</li>
          ))}
        </ul>
        <h3 className="section-title">Histórico de Execuções</h3>

        {loadingHistorico ? (
          <p style={{ marginTop: 8 }}>Carregando histórico...</p>
        ) : historico.length === 0 ? (
          <p style={{ marginTop: 8, color: "#6b7280" }}>
            Nenhuma execução registrada.
          </p>
        ) : (
          <div className="historico-list">
            {historico.map((h) => (
              <div
                key={h.id}
                className={`historico-item ${
                  h.status === "SUCESSO"
                    ? "historico-sucesso"
                    : "historico-erro"
                }`}
              >
                <span className="historico-data">{h.data}</span>

                <span className="historico-status">
                  {h.status === "SUCESSO" ? "✅ Sucesso" : "❌ Erro"}
                </span>

                <span className="historico-msg">{h.mensagem}</span>
              </div>
            ))}
          </div>
        )}
        <h3 className="section-title">Logs Técnicos</h3>

        <div className="logs-list">
          {LOGS_MOCK.map((log) => {
            const aberto = logAberto === log.id;

            return (
              <div key={log.id} className="log-item">
                <div
                  className="log-header"
                  onClick={() => setLogAberto(aberto ? null : log.id)}
                >
                  <span className="log-toggle">{aberto ? "▼" : "▶"}</span>

                  <span className="log-title">
                    {log.data} — {log.titulo}
                  </span>
                </div>

                {aberto && (
                  <div className="log-body">
                    <p>
                      <strong>Dispositivo:</strong> {log.detalhes.device}
                    </p>
                    <p>
                      <strong>Ação:</strong> {log.detalhes.acao}
                    </p>
                    <p>
                      <strong>Resultado:</strong> {log.detalhes.resultado}
                    </p>

                    {log.detalhes.duracao && (
                      <p>
                        <strong>Duração:</strong> {log.detalhes.duracao}
                      </p>
                    )}

                    {log.detalhes.erro && (
                      <p className="log-erro">
                        <strong>Erro:</strong> {log.detalhes.erro}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {impacto && (
          <div className="impact-preview">
            <h3>💡 Impacto da Automação</h3>

            <div className="impact-row">
              <span>⏱ Horas por dia</span>
              <strong>{impacto.horasPorDia}h</strong>
            </div>

            <div className="impact-row">
              <span>📅 Dias por mês</span>
              <strong>{impacto.diasPorMes} dias</strong>
            </div>

            <hr />

            <div className="impact-row">
              <span>⚡ Energia economizada</span>
              <strong>{impacto.economiaKwh} kWh / mês</strong>
            </div>

            <div className="impact-row">
              <span>💰 Economia financeira</span>
              <strong>R$ {impacto.economiaReais} / mês</strong>
            </div>

            <div className="impact-row">
              <span>📉 Redução estimada</span>
              <strong>{impacto.percentual}%</strong>
            </div>
          </div>
        )}

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
              automacao.status === "ATIVA" ? "pausar" : "ativar"
            }`}
            onClick={() => setMostrarConfirmacao(true)}
          >
            {automacao.status === "ATIVA" ? "⏸ Pausar" : "▶ Ativar"}
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
              <strong>
                {automacao.status === "ATIVA" ? "pausar" : "ativar"}
              </strong>{" "}
              esta automação?
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

      {/* MODAL EDITAR */}
      {mostrarEdicao && (
        <div className="modal-overlay">
          <div className="modal-content modal-lg">
            <h3>Editar Automação</h3>

            <AutomacaoForm
              initialData={{
                ambiente: automacao.ambiente,
                dias: automacao.dias,
                inicio: automacao.inicio,
                fim: automacao.fim,
                equipamentos: automacao.equipamentos,
                tipo: automacao.tipo,
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
