import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Automacoes.css";

import {
  listarAutomacoes,
  criarAutomacao,
  identificarPerfilAutomacao,
  gerarNomeAutomacao,
  estimarEconomiaAutomacao,
  alterarStatusAutomacao,
} from "../../services/automacoesService";

import { AUTOMACAO_TEMPLATES } from "../../constants/automacaoTemplates";

/* =========================
   CONSTANTES
========================= */
const DIAS_SEMANA = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];

const EQUIPAMENTOS_DISPONIVEIS = [
  "Ar Condicionado 01",
  "Ar Condicionado 02",
  "Ar Condicionado 03",
];

const DESCRICOES_PERFIL = {
  "Economia Noturna":
    "Reduz o consumo desligando equipamentos automaticamente durante a noite.",
  "Economia por Inatividade":
    "Desliga os equipamentos quando não há pessoas no ambiente.",
  "Horário Comercial":
    "Mantém os equipamentos ativos apenas durante o horário de funcionamento.",
  "Automação Personalizada":
    "Regra criada manualmente conforme a necessidade do ambiente.",
};

const estadoInicialAutomacao = {
  templateId: null,
  tipo: "",
  ambiente: "",
  dias: [],
  inicio: "",
  fim: "",
  regra: "",
  equipamentos: [],
};

/* =========================
   HELPERS
========================= */
const gerarRegraAutomacao = (dados) => {
  if (dados.tipo === "HORARIO") {
    if (!dados.inicio || !dados.fim || !dados.dias.length) return "";
    return `${dados.dias.join(", ")} · ${dados.inicio} → ${dados.fim}`;
  }
  if (dados.tipo === "OCUPACAO") return dados.regra || "";
  return "";
};

const calcularImpactoAutomacao = (equipamentos = []) => {
  if (equipamentos.length >= 5) return "Alto impacto";
  if (equipamentos.length >= 3) return "Impacto médio";
  if (equipamentos.length > 0) return "Baixo impacto";
  return "Nenhum equipamento selecionado";
};
const atualizarRegra = (dados) => {
  return {
    ...dados,
    regra: gerarRegraAutomacao(dados),
  };
};

const Automacoes = () => {
  const navigate = useNavigate();

  const [automacoes, setAutomacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCriarModal, setShowCriarModal] = useState(false);
  const [passo, setPasso] = useState(0);
  const [loadingSalvar, setLoadingSalvar] = useState(false);
  const [erroForm, setErroForm] = useState("");

  const [novaAutomacao, setNovaAutomacao] = useState(estadoInicialAutomacao);

  /* =========================
     BUSCAR AUTOMAÇÕES
  ========================= */
  useEffect(() => {
    listarAutomacoes().then((dados) => {
      setAutomacoes(dados || []);
      setLoading(false);
    });
  }, []);

  /* =========================
     STATUS
  ========================= */
  const alternarStatus = async (automacao) => {
    const novoStatus = automacao.status === "ATIVA" ? "PAUSADA" : "ATIVA";
    await alterarStatusAutomacao(automacao.id, novoStatus);

    setAutomacoes((prev) =>
      prev.map((a) =>
        a.id === automacao.id ? { ...a, status: novoStatus } : a,
      ),
    );
  };

  /* =========================
     DUPLICAR
  ========================= */
  const duplicarAutomacao = (automacao) => {
    setNovaAutomacao({
      ...estadoInicialAutomacao,
      tipo: automacao.tipo,
      dias: automacao.dias || [],
      inicio: automacao.inicio || "",
      fim: automacao.fim || "",
      regra: automacao.regra || "",
      equipamentos: automacao.equipamentos || [],
    });
    setPasso(1);
    setShowCriarModal(true);
  };

  /* =========================
     SALVAR
  ========================= */
  const salvarNovaAutomacao = async () => {
    if (
      !novaAutomacao.tipo ||
      !novaAutomacao.ambiente ||
      !novaAutomacao.regra ||
      !novaAutomacao.equipamentos.length
    ) {
      setErroForm("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoadingSalvar(true);

    const criada = await criarAutomacao({
      ...novaAutomacao,
      nome: gerarNomeAutomacao(novaAutomacao),
      status: "ATIVA",
    });

    setAutomacoes((prev) => [...prev, criada]);
    setLoadingSalvar(false);
    setShowCriarModal(false);
    setNovaAutomacao(estadoInicialAutomacao);
    setPasso(0);
  };

  if (loading) {
    return <div className="automacoes-page">Carregando...</div>;
  }

  return (
    <div className="automacoes-page">
      <header className="page-header">
        <div>
          <h1>Automações</h1>
          <p>Gerencie regras automáticas dos equipamentos</p>
        </div>

        <button
          className="btn-primary"
          onClick={() => {
            setNovaAutomacao(estadoInicialAutomacao);
            setPasso(0);
            setShowCriarModal(true);
          }}
        >
          Criar Automação
        </button>
      </header>

      {/* LISTA */}
      <div className="automacoes-list">
        {automacoes.map((a) => {
          const perfil = identificarPerfilAutomacao(a) || {};
          const perfilNome = perfil.perfil || "Automação Personalizada";
          const perfilClass = perfilNome.toLowerCase().replace(/\s+/g, "-");
          const descricaoPerfil =
            DESCRICOES_PERFIL[perfilNome] ||
            "Automação configurada manualmente.";

          const economia = estimarEconomiaAutomacao(a);

          return (
            <div className="automacao-card" key={a.id}>
              <div className="automacao-top-actions">
                <div className="automacao-status-wrapper">
                  <span
                    className={`automacao-perfil perfil-${perfilClass}`}
                    title={descricaoPerfil}
                  >
                    {perfilNome}
                  </span>

                  <span
                    className={`status-text ${
                      a.status === "ATIVA" ? "ativa" : "pausada"
                    }`}
                  >
                    {a.status === "ATIVA" ? "Ativa" : "Pausada"}
                  </span>
                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    checked={a.status === "ATIVA"}
                    onChange={() => alternarStatus(a)}
                  />
                  <span className="slider" />
                </label>
              </div>

              <h3 className="automacao-nome">{gerarNomeAutomacao(a)}</h3>
              <p className="automacao-descricao">{descricaoPerfil}</p>
              <p className="automacao-regra">{a.regra}</p>

              {economia?.kwh > 0 && (
                <div className="automacao-economia">
                  Economia estimada:
                  <strong>
                    {" "}
                    {economia.kwh} kWh / mês · R$ {economia.valor}
                  </strong>
                </div>
              )}

              <div className="automacao-actions">
                <button
                  className="btn-secondary"
                  onClick={() => navigate(`/automacoes/${a.id}`)}
                >
                  Detalhes
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => duplicarAutomacao(a)}
                >
                  Duplicar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= MODAL CRIAR ================= */}
      {showCriarModal && (
        <div className="modal-overlay" onClick={() => setShowCriarModal(false)}>
          <div
            className="modal-content modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Criar Automação</h2>
              <p>Passo {passo + 1} de 5</p>
            </div>

            <div className="modal-body">
              {passo === 0 && (
                <>
                  <h3>Escolha um modelo</h3>
                  <div className="template-grid">
                    {AUTOMACAO_TEMPLATES.map((tpl) => (
                      <div
                        key={tpl.id}
                        className={`template-card ${
                          novaAutomacao.templateId === tpl.id
                            ? "selecionado"
                            : ""
                        }`}
                        onClick={() =>
                          setNovaAutomacao({
                            ...estadoInicialAutomacao,
                            templateId: tpl.id,
                            tipo: tpl.tipo,
                            dias: tpl.dias || [],
                            inicio: tpl.inicio || "",
                            fim: tpl.fim || "",
                            regra: gerarRegraAutomacao(tpl),
                          })
                        }
                      >
                        <h4>{tpl.nome}</h4>
                        <p>{tpl.descricao}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {passo === 1 && (
                <>
                  <h3>Ambiente</h3>
                  <input
                    placeholder="Ex: Sala de Reunião"
                    value={novaAutomacao.ambiente}
                    onChange={(e) =>
                      setNovaAutomacao({
                        ...novaAutomacao,
                        ambiente: e.target.value,
                      })
                    }
                  />
                </>
              )}
              {/* PASSO 2 — DIAS E HORÁRIO */}
              {passo === 2 && (
                <>
                  <label className="form-label">Dias da semana</label>

                  <div className="dias-grid">
                    {DIAS_SEMANA.map((dia) => (
                      <label key={dia} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={novaAutomacao.dias.includes(dia)}
                          onChange={() => {
                            const dias = novaAutomacao.dias.includes(dia)
                              ? novaAutomacao.dias.filter((d) => d !== dia)
                              : [...novaAutomacao.dias, dia];

                            setNovaAutomacao({
                              ...novaAutomacao,
                              dias,
                              regra: gerarRegraAutomacao({
                                ...novaAutomacao,
                                dias,
                              }),
                            });
                          }}
                        />
                        <span>{dia}</span>
                      </label>
                    ))}
                  </div>

                  <label className="form-label">Horário</label>

                  <div className="horario-grid">
                    <input
                      type="time"
                      value={novaAutomacao.inicio}
                      onChange={(e) =>
                        setNovaAutomacao({
                          ...novaAutomacao,
                          inicio: e.target.value,
                          regra: gerarRegraAutomacao({
                            ...novaAutomacao,
                            inicio: e.target.value,
                          }),
                        })
                      }
                    />

                    <span className="horario-separador">até</span>

                    <input
                      type="time"
                      value={novaAutomacao.fim}
                      onChange={(e) =>
                        setNovaAutomacao({
                          ...novaAutomacao,
                          fim: e.target.value,
                          regra: gerarRegraAutomacao({
                            ...novaAutomacao,
                            fim: e.target.value,
                          }),
                        })
                      }
                    />
                  </div>
                </>
              )}

              {/* PASSO 3 — EQUIPAMENTOS */}
              {passo === 3 && (
                <>
                  <h3>Equipamentos</h3>

                  <div className="equipamentos-grid">
                    {EQUIPAMENTOS_DISPONIVEIS.map((eq) => (
                      <label key={eq} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={novaAutomacao.equipamentos.includes(eq)}
                          onChange={() => {
                            const equipamentos =
                              novaAutomacao.equipamentos.includes(eq)
                                ? novaAutomacao.equipamentos.filter(
                                    (e) => e !== eq,
                                  )
                                : [...novaAutomacao.equipamentos, eq];

                            setNovaAutomacao({
                              ...novaAutomacao,
                              equipamentos,
                            });
                          }}
                        />
                        <span>{eq}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}

              {passo === 4 && (
                <>
                  <h3>Resumo</h3>
                  <div className="resumo-box">
                    <p>
                      <strong>Nome:</strong> {gerarNomeAutomacao(novaAutomacao)}
                    </p>
                    <p>
                      <strong>Regra:</strong> {novaAutomacao.regra}
                    </p>
                    <p>
                      <strong>Impacto:</strong>{" "}
                      {calcularImpactoAutomacao(novaAutomacao.equipamentos)}
                    </p>
                  </div>
                </>
              )}

              {erroForm && <p className="form-error">{erroForm}</p>}
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowCriarModal(false)}
              >
                Cancelar
              </button>

              {passo < 4 && (
                <button
                  className="btn-primary"
                  onClick={() => setPasso(passo + 1)}
                >
                  Próximo
                </button>
              )}

              {passo === 4 && (
                <button
                  className="btn-primary"
                  disabled={loadingSalvar}
                  onClick={salvarNovaAutomacao}
                >
                  Criar Automação
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Automacoes;
