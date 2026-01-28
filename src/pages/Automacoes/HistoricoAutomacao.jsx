import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./HistoricoAutomacao.css";

import { buscarHistoricoAutomacao } from "../../services/automacoesService";

const HistoricoAutomacao = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [historico, setHistorico] = useState([]);

  // =========================
  // BUSCAR HISTÓRICO (SERVICE)
  // =========================
  useEffect(() => {
    buscarHistoricoAutomacao(id).then((dados) => {
      setHistorico(dados);
      setLoading(false);
    });
  }, [id]);

  // =========================
  // RENDER
  // =========================
  return (
    <div className="historico-page">
      <button
        className="btn-secondary"
        onClick={() => navigate(`/automacoes/${id}`)}
      >
        ← Voltar para Detalhes
      </button>

      <h1>Histórico de Execuções</h1>

      {loading && (
        <p className="historico-loading">Carregando histórico...</p>
      )}

      {!loading && historico.length === 0 && (
        <div className="historico-vazio">
          <p>📭 Nenhuma execução registrada ainda</p>
        </div>
      )}

      {!loading && historico.length > 0 && (
        <div className="timeline">
          {historico.map((item) => (
            <div key={item.id} className="timeline-item">
              <div
                className={`timeline-icon ${
                  item.status === "SUCESSO" ? "sucesso" : "erro"
                }`}
              >
                {item.status === "SUCESSO" ? "✅" : "❌"}
              </div>

              <div className="timeline-content">
                <span className="timeline-date">{item.data}</span>
                <p className="timeline-message">{item.mensagem}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoricoAutomacao;
