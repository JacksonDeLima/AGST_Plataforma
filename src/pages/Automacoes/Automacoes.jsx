import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Automacoes.css";

import {
  listarAutomacoes,
  criarAutomacao,
  editarAutomacao,
  identificarPerfilAutomacao,
  gerarNomeAutomacao,
  estimarEconomiaAutomacao,
  alterarStatusAutomacao,
} from "../../services/automacoesService";

import { AUTOMACAO_TEMPLATES } from "../../constants/automacaoTemplates";

const MOCK_AMBIENTES = [
  {
    id: 1,
    nome: "Escritório Gerência",
    status: "ONLINE",
    pausado: false,
  },
  {
    id: 2,
    nome: "Sala de Reuniões A",
    status: "PARCIAL",
    pausado: false,
  },
  {
    id: 3,
    nome: "Sala de Reuniões B",
    status: "OFFLINE",
    pausado: false,
  },
  {
    id: 4,
    nome: "Auditório Principal",
    status: "MANUTENCAO",
    pausado: false,
  },
];

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
const PRIORIDADE_AUTOMACAO = {
  INATIVIDADE: 1,
  NOTURNA: 2,
  HORARIO: 3,
  PERSONALIZADA: 4,
};

function getPrioridade(automacao) {
  return PRIORIDADE_AUTOMACAO[automacao.tipo] || 99;
}

const gerarRegraAutomacao = (dados) => {
  switch (dados.tipo) {
    case "HORARIO":
      if (!dados.inicio || !dados.fim || !dados.dias.length) return "";
      return `${dados.dias.join(", ")} · ${dados.inicio} → ${dados.fim}`;

    case "OCUPACAO":
      return dados.regra || "";

    case "PERSONALIZADA":
      // não define nada automaticamente
      return dados.regra || "";

    default:
      return "";
  }
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

  const params = new URLSearchParams(window.location.search);
  const ambienteId = Number(params.get("ambienteId"));
  const ambienteAtivo = MOCK_AMBIENTES.find((a) => a.id === ambienteId);

  const [automacoes, setAutomacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCriarModal, setShowCriarModal] = useState(false);
  const [passo, setPasso] = useState(0);
  const [modoModal, setModoModal] = useState("CRIAR"); // CRIAR | EDITAR
  const [automacaoEditando, setAutomacaoEditando] = useState(null);

  const [loadingSalvar, setLoadingSalvar] = useState(false);
  const [erroForm, setErroForm] = useState("");

  const [novaAutomacao, setNovaAutomacao] = useState(estadoInicialAutomacao);
  const [filtroStatus, setFiltroStatus] = useState("TODAS");
  const [filtroPerfil, setFiltroPerfil] = useState("TODOS");

  const ambientePausado = ambienteAtivo ? ambienteAtivo.pausado : false;
  const isPersonalizada = novaAutomacao.tipo === "PERSONALIZADA";

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
  const abrirModalCriar = () => {
    setModoModal("CRIAR");
    setAutomacaoEditando(null);
    setNovaAutomacao(estadoInicialAutomacao);
    setPasso(0);
    setShowCriarModal(true);
  };

  const abrirModalEditar = (automacao) => {
    setModoModal("EDITAR");
    setAutomacaoEditando(automacao);

    setNovaAutomacao({
      templateId: automacao.templateId || null,
      tipo: automacao.tipo,
      ambiente: automacao.ambiente || "",
      dias: automacao.dias || [],
      inicio: automacao.inicio || "",
      fim: automacao.fim || "",
      regra: automacao.regra || "",
      equipamentos: automacao.equipamentos || [],
    });

    setPasso(1); // pula template
    setShowCriarModal(true);
  };

  const abrirModalDuplicar = (automacao) => {
    setModoModal("DUPLICAR");
    setAutomacaoEditando(null);

    setNovaAutomacao({
      templateId: automacao.templateId || null,
      tipo: automacao.tipo,
      ambiente: "", // Força o usuário a definir o novo ambiente
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
  function validarAutomacaoPersonalizada() {
    // Mapeando para o estado atual (novaAutomacao)
    const nomeAutomacao = novaAutomacao.ambiente;
    const acaoSelecionada = novaAutomacao.equipamentos.length > 0;
    const horarioInicio = novaAutomacao.inicio;
    const diasSelecionados = novaAutomacao.dias;
    const tempoInatividade = null; // Campo futuro

    if (!nomeAutomacao || nomeAutomacao.trim() === "") {
      alert("Informe um nome para a automação.");
      return false;
    }

    if (!acaoSelecionada) {
      alert("Selecione uma ação para a automação.");
      return false;
    }

    const temCondicao =
      horarioInicio || diasSelecionados?.length > 0 || tempoInatividade;

    if (!temCondicao) {
      alert("Defina pelo menos uma condição para a automação.");
      return false;
    }

    return true;
  }

  function getStatusAutomacao(automacao, ambienteAtivo, automacaoExecutando) {
    if (ambientePausado) {
      return {
        titulo: "Pausada",
        descricao: "Automações pausadas manualmente",
        tipo: "pausada"
      };
    }

    // Ambiente em manutenção
    if (ambienteAtivo.status === "MANUTENCAO") {
      return {
        titulo: "Bloqueada",
        descricao: "Ambiente em manutenção",
        tipo: "bloqueada"
      };
    }

    // Ambiente offline
    if (ambienteAtivo.status === "OFFLINE") {
      return {
        titulo: "Pausada",
        descricao: "Ambiente offline",
        tipo: "pausada"
      };
    }

    // Automação que está mandando agora
    if (automacao.id === automacaoExecutando?.id) {
      return {
        titulo: "Executando agora",
        descricao: "",
        tipo: "executando"
      };
    }

    // Automação ativa, mas perdeu prioridade
    return {
      titulo: "Ativa, mas não executando",
      descricao: automacaoExecutando
        ? `Sobreposta por: ${automacaoExecutando.nome}`
        : "Aguardando condição de maior prioridade",
      tipo: "sobreposta"
    };
  }

  const salvarAutomacao = async () => {
    if (novaAutomacao.tipo === "PERSONALIZADA") {
      const valido = validarAutomacaoPersonalizada();
      if (!valido) return;
    }

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

    if (modoModal === "EDITAR" && automacaoEditando) {
      await editarAutomacao(automacaoEditando.id, novaAutomacao);

      setAutomacoes((prev) =>
        prev.map((a) =>
          a.id === automacaoEditando.id ? { ...a, ...novaAutomacao } : a,
        ),
      );
    } else {
      const criada = await criarAutomacao({
        ...novaAutomacao,
        nome: gerarNomeAutomacao(novaAutomacao),
        status: "ATIVA",
      });

      setAutomacoes((prev) => [...prev, criada]);
    }

    setLoadingSalvar(false);
    setShowCriarModal(false);
    setNovaAutomacao(estadoInicialAutomacao);
    setModoModal("CRIAR");
    setPasso(0);
  };

  const automacaoExecutando = automacoes
    .filter((a) => a.status === "ATIVA")
    .sort((a, b) => getPrioridade(a) - getPrioridade(b))[0];

  if (loading) {
    return <div className="automacoes-page">Carregando...</div>;
  }

  if (!ambienteAtivo) {
    return (
      <div className="automacoes-page">
        <p>Ambiente não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="automacoes-page">
      <button
        className="btn-secondary"
        style={{ marginBottom: "20px" }}
        onClick={() => navigate(-1)}
      >
        ← Voltar
      </button>
      <header className="page-header">
        <div>
          <h1>Automações</h1>
          <div className="ambiente-info-topo">
            <h2 className="ambiente-nome-topo">{ambienteAtivo.nome}</h2>

            <div className="ambiente-status-topo">
              <span
                className={`status-badge status-${ambienteAtivo.status.toLowerCase()}`}
              >
                {ambienteAtivo.status}
              </span>

              {ambienteAtivo.pausado && (
                <span className="status-badge status-pausado">Pausado</span>
              )}
            </div>
          </div>
          <p>Gerencie regras automáticas dos equipamentos</p>
        </div>

        <button className="btn-primary" onClick={abrirModalCriar}>
          Criar Automação
        </button>
      </header>

      {/* FILTROS */}
      <div className="filtros-container">
        <div className="filtros-box">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="TODAS">Status: Todas</option>
            <option value="ATIVA">Status: Ativas</option>
            <option value="PAUSADA">Status: Pausadas</option>
          </select>

          <select
            value={filtroPerfil}
            onChange={(e) => setFiltroPerfil(e.target.value)}
          >
            <option value="TODOS">Perfil: Todos</option>
            <option value="Economia Noturna">Economia Noturna</option>
            <option value="Economia por Inatividade">
              Economia por Inatividade
            </option>
            <option value="Horário Comercial">Horário Comercial</option>
            <option value="Automação Personalizada">
              Automação Personalizada
            </option>
            <option value="PERSONALIZADA">Personalizada (Manual)</option>
          </select>
        </div>
      </div>

      {(ambienteAtivo.status === "OFFLINE" ||
        ambienteAtivo.status === "MANUTENCAO") && (
        <div className="alerta-ambiente">
          <strong>Automações indisponíveis</strong>
          <p>
            {ambienteAtivo.status === "OFFLINE"
              ? "O ambiente está offline e não pode executar automações."
              : "O ambiente está em manutenção e as automações estão bloqueadas."}
          </p>
        </div>
      )}

      {/* LISTA */}
      <div className="automacoes-list">
        {automacoes.filter((a) => {
          // filtro por status
          if (filtroStatus !== "TODAS" && a.status !== filtroStatus) {
            return false;
          }

          // filtro por perfil
          const perfil =
            identificarPerfilAutomacao(a)?.perfil || "Automação Personalizada";

          if (filtroPerfil !== "TODOS" && perfil !== filtroPerfil) {
            return false;
          }

          return true;
        }).length === 0 && (
          <div className="empty-state">
            <h3>Nenhuma automação encontrada</h3>
            <p>
              {filtroStatus !== "TODAS" || filtroPerfil !== "TODOS"
                ? "Tente ajustar os filtros ou criar uma nova automação."
                : "Crie sua primeira automação para este ambiente."}
            </p>
          </div>
        )}

        {automacoes
          .filter((a) => {
            // filtro por status
            if (filtroStatus !== "TODAS" && a.status !== filtroStatus) {
              return false;
            }

            // filtro por perfil
            const perfil =
              identificarPerfilAutomacao(a)?.perfil ||
              "Automação Personalizada";

            if (filtroPerfil !== "TODOS" && perfil !== filtroPerfil) {
              return false;
            }

            return true;
          })
          .map((a) => {
            const perfil = identificarPerfilAutomacao(a) || {};
            const perfilNome = perfil.perfil || "Automação Personalizada";
            const perfilClass = perfilNome.toLowerCase().replace(/\s+/g, "-");
            const descricaoPerfil =
              DESCRICOES_PERFIL[perfilNome] ||
              "Automação configurada manualmente.";

            const economia = estimarEconomiaAutomacao(a);
            
            const statusInfo = getStatusAutomacao(a, ambienteAtivo, automacaoExecutando);

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
                      checked={!ambientePausado && a.status === "ATIVA"}
                      onChange={() => alternarStatus(a)}
                      disabled={ambientePausado}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <h3 className="automacao-nome">{gerarNomeAutomacao(a)}</h3>
                <p className="automacao-descricao">{descricaoPerfil}</p>
                <p className="automacao-regra">{a.regra}</p>

                <div className={`status-automacao ${statusInfo.tipo}`}>
                  <strong>{statusInfo.titulo}</strong>
                  {statusInfo.descricao && (
                    <div className="status-descricao">{statusInfo.descricao}</div>
                  )}
                </div>

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
                    onClick={() => abrirModalEditar(a)}
                  >
                    Editar
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={() => abrirModalDuplicar(a)}
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

                    <div
                      className={`template-card ${
                        novaAutomacao.tipo === "PERSONALIZADA" ? "selecionado" : ""
                      }`}
                      onClick={() =>
                        setNovaAutomacao({
                          ...estadoInicialAutomacao,
                          templateId: "personalizada",
                          tipo: "PERSONALIZADA",
                        })
                      }
                    >
                      <h4>Personalizada (Manual)</h4>
                      <p>
                        Crie uma automação totalmente personalizada, definindo horários,
                        dias e configurações manualmente.
                      </p>
                    </div>
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

                            setNovaAutomacao(
                              atualizarRegra({
                                ...novaAutomacao,
                                dias,
                              }),
                            );
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
                        setNovaAutomacao(
                          atualizarRegra({
                            ...novaAutomacao,
                            inicio: e.target.value,
                          }),
                        )
                      }
                    />

                    <span className="horario-separador">até</span>

                    <input
                      type="time"
                      value={novaAutomacao.fim}
                      onChange={(e) =>
                        setNovaAutomacao(
                          atualizarRegra({
                            ...novaAutomacao,
                            fim: e.target.value,
                          }),
                        )
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
                  onClick={salvarAutomacao}
                >
                  {modoModal === "EDITAR"
                    ? "Salvar Alterações"
                    : "Criar Automação"}
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
