import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Automacoes.css";

import {
  listarAutomacoes,
  criarAutomacao,
  editarAutomacao,
  identificarPerfilAutomacao,
  gerarNomeAutomacao,
  estimarEconomiaAutomacao,
  alterarStatusAutomacao,
  deletarAutomacao,
} from "../../services/automacoesService";
import { getAmbienteById, listarAmbientes } from "../../services/ambientesService";
import { useAmbiente } from "../../context/AmbienteContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../../components/ConfirmDialog";

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
    "Desliga os equipamentos quando nÃ£o hÃ¡ pessoas no ambiente.",
  "HorÃ¡rio Comercial":
    "MantÃ©m os equipamentos ativos apenas durante o horÃ¡rio de funcionamento.",
  "AutomaÃ§Ã£o Personalizada":
    "Regra criada manualmente conforme a necessidade do ambiente.",
};

const estadoInicialAutomacao = {
  templateId: null,
  tipo: "",
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
      return `${dados.dias.join(", ")} Â· ${dados.inicio} â†’ ${dados.fim}`;

    case "OCUPACAO":
      return dados.regra || "";

    case "PERSONALIZADA":
      // nÃ£o define nada automaticamente
      return dados.regra || "";

    default:
      return "";
  }
};

const calcularImpactoAutomacao = (equipamentos = []) => {
  if (equipamentos.length >= 5) return "Alto impacto";
  if (equipamentos.length >= 3) return "Impacto mÃ©dio";
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
  const location = useLocation();
  const { ambienteId: ambienteAtivoId } = useAmbiente();
  const { corporationId } = useAuth();
  const { addNotification } = useToast();

  const params = new URLSearchParams(location.search);
  const ambienteIdUrl = params.get("ambienteId");
  const ambienteIdFinal = ambienteIdUrl || ambienteAtivoId;

  const [ambienteAtivo, setAmbienteAtivo] = useState(null);
  const [loadingAmbiente, setLoadingAmbiente] = useState(true);
  const [ambientesDisponiveis, setAmbientesDisponiveis] = useState([]);
  const [loadingAmbientesDisponiveis, setLoadingAmbientesDisponiveis] =
    useState(true);
  const [ambienteSelecionadoId, setAmbienteSelecionadoId] = useState("");

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const ambientePausado = ambienteAtivo ? ambienteAtivo.pausado : false;
  const isPersonalizada = novaAutomacao.tipo === "PERSONALIZADA";

  useEffect(() => {
    if (ambienteIdUrl && ambienteIdUrl !== ambienteAtivoId) {
      // sincroniza URL com contexto
      localStorage.setItem("agst_active_ambiente_id", ambienteIdUrl);
    }
  }, [ambienteIdUrl, ambienteAtivoId]);

  useEffect(() => {
    if (!corporationId) {
      setAmbientesDisponiveis([]);
      setLoadingAmbientesDisponiveis(false);
      return;
    }

    setLoadingAmbientesDisponiveis(true);
    listarAmbientes(corporationId)
      .then((lista) => {
        setAmbientesDisponiveis(Array.isArray(lista) ? lista : []);
      })
      .catch(() => {
        setAmbientesDisponiveis([]);
      })
      .finally(() => {
        setLoadingAmbientesDisponiveis(false);
      });
  }, [corporationId]);

  const abrirAmbienteSelecionado = () => {
    if (!ambienteSelecionadoId) return;
    navigate(`/automacoes?ambienteId=${ambienteSelecionadoId}`);
  };

  /* =========================
     BUSCAR AMBIENTE
  ========================= */
  useEffect(() => {
    if (!ambienteIdFinal) {
      setAmbienteAtivo(null);
      setLoadingAmbiente(false);
      return;
    }

    setLoadingAmbiente(true);

    getAmbienteById(ambienteIdFinal)
      .then((res) => {
        if (!res.ok) {
          setAmbienteAtivo(null);
          return;
        }

        setAmbienteAtivo(res.data || null);
      })
      .catch(() => {
        setAmbienteAtivo(null);
      })
      .finally(() => {
        setLoadingAmbiente(false);
      });
  }, [ambienteIdFinal]);
  /* =========================
     BUSCAR AUTOMAÃ‡Ã•ES
  ========================= */
  useEffect(() => {
    listarAutomacoes(corporationId, ambienteIdFinal).then((dados) => {
      setAutomacoes(dados || []);
      setLoading(false);
    });
  }, [corporationId, ambienteIdFinal]);

  const excluirAutomacao = (automacao) => {
    setConfirmTarget(automacao);
    setConfirmOpen(true);
  };

  const confirmarExclusaoAutomacao = async () => {
    if (!confirmTarget) return;

    await deletarAutomacao(confirmTarget.id, corporationId, ambienteIdFinal);

    addNotification({
      type: "info",
      message: `AutomaÃ§Ã£o "${gerarNomeAutomacao(confirmTarget)}" excluÃ­da.`,
    });

    setAutomacoes((prev) =>
      prev.filter((a) => String(a.id) !== String(confirmTarget.id)),
    );

    setConfirmOpen(false);
    setConfirmTarget(null);
  };
  /* =========================
     STATUS
  ========================= */
  const alternarStatus = async (automacao) => {
    const novoStatus = automacao.status === "ATIVA" ? "PAUSADA" : "ATIVA";

    await alterarStatusAutomacao(
      automacao.id,
      novoStatus,
      corporationId,
      ambienteIdFinal,
    );

    setAutomacoes((prev) =>
      prev.map((a) =>
        a.id === automacao.id ? { ...a, status: novoStatus } : a,
      ),
    );

    addNotification({
      type: "info",
      message: `AutomaÃ§Ã£o "${gerarNomeAutomacao(automacao)}" ${
        novoStatus === "ATIVA" ? "ativada" : "pausada"
      }.`,
    });
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
      ambiente: "", // ForÃ§a o usuÃ¡rio a definir o novo ambiente
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
      alert("Informe um nome para a automaÃ§Ã£o.");
      return false;
    }

    if (!acaoSelecionada) {
      alert("Selecione uma aÃ§Ã£o para a automaÃ§Ã£o.");
      return false;
    }

    const temCondicao =
      horarioInicio || diasSelecionados?.length > 0 || tempoInatividade;

    if (!temCondicao) {
      alert("Defina pelo menos uma condiÃ§Ã£o para a automaÃ§Ã£o.");
      return false;
    }

    return true;
  }

  function getStatusAutomacao(automacao, ambienteAtivo, automacaoExecutando) {
    if (ambientePausado) {
      return {
        titulo: "Pausada",
        descricao: "AutomaÃ§Ãµes pausadas manualmente",
        tipo: "pausada",
      };
    }

    // Ambiente em manutenÃ§Ã£o
    if (ambienteAtivo.status === "MANUTENCAO") {
      return {
        titulo: "Bloqueada",
        descricao: "Ambiente em manutenÃ§Ã£o",
        tipo: "bloqueada",
      };
    }

    // Ambiente offline
    if (ambienteAtivo.status === "OFFLINE") {
      return {
        titulo: "Pausada",
        descricao: "Ambiente offline",
        tipo: "pausada",
      };
    }

    // AutomaÃ§Ã£o que estÃ¡ mandando agora
    if (automacao.id === automacaoExecutando?.id) {
      return {
        titulo: "Executando agora",
        descricao: "",
        tipo: "executando",
      };
    }

    // AutomaÃ§Ã£o ativa, mas perdeu prioridade
    return {
      titulo: "Ativa, mas nÃ£o executando",
      descricao: automacaoExecutando
        ? `Sobreposta por: ${automacaoExecutando.nome}`
        : "Aguardando condiÃ§Ã£o de maior prioridade",
      tipo: "sobreposta",
    };
  }

  const salvarAutomacao = async () => {
    if (novaAutomacao.tipo === "PERSONALIZADA") {
      const valido = validarAutomacaoPersonalizada();
      if (!valido) return;
    }

    if (
      !novaAutomacao.tipo ||
      !novaAutomacao.regra ||
      !novaAutomacao.equipamentos.length
    ) {
      setErroForm("Preencha todos os campos obrigatÃ³rios.");
      return;
    }

    setLoadingSalvar(true);

    if (modoModal === "EDITAR" && automacaoEditando) {
      await editarAutomacao(
        automacaoEditando.id,
        novaAutomacao,
        corporationId,
        ambienteIdFinal,
      );

      setAutomacoes((prev) =>
        prev.map((a) =>
          a.id === automacaoEditando.id ? { ...a, ...novaAutomacao } : a,
        ),
      );

      addNotification({
        type: "success",
        message: `AutomaÃ§Ã£o "${gerarNomeAutomacao(novaAutomacao)}" atualizada.`,
      });
    } else {
      const criada = await criarAutomacao(corporationId, ambienteIdFinal, {
        ...novaAutomacao,
        nome: gerarNomeAutomacao(novaAutomacao),
        status: "ATIVA",
        ambienteId: ambienteIdFinal,
      });

      setAutomacoes((prev) => [...prev, criada]);

      addNotification({
        type: "success",
        message: `AutomaÃ§Ã£o "${gerarNomeAutomacao(novaAutomacao)}" criada.`,
      });
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

  if (!corporationId) {
    return (
      <div className="automacoes-page">
        <div className="empty-state">
          <h2>Selecione uma corporaÃ§Ã£o</h2>
          <p>Escolha uma corporaÃ§Ã£o ativa para visualizar as automaÃ§Ãµes.</p>
        </div>
      </div>
    );
  }

  if (!ambienteIdFinal) {
    return (
      <div className="automacoes-page">
        <div className="empty-state">
          <h2>Selecione um ambiente</h2>
          <p>Escolha um ambiente para visualizar e criar automacoes.</p>

          <div className="ambiente-picker">
            <label className="form-label">Ambientes criados</label>

            {loadingAmbientesDisponiveis && (
              <p className="texto-suave">Carregando ambientes...</p>
            )}

            {!loadingAmbientesDisponiveis &&
              ambientesDisponiveis.length === 0 && (
                <p className="texto-suave">
                  Nenhum ambiente criado ainda.
                </p>
              )}

            {!loadingAmbientesDisponiveis &&
              ambientesDisponiveis.length > 0 && (
                <div className="ambiente-picker-row">
                  <select
                    value={ambienteSelecionadoId}
                    onChange={(e) => setAmbienteSelecionadoId(e.target.value)}
                  >
                    <option value="">Selecione um ambiente</option>
                    {ambientesDisponiveis.map((ambiente) => (
                      <option key={ambiente.id} value={ambiente.id}>
                        {ambiente.nome}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn-primary"
                    disabled={!ambienteSelecionadoId}
                    onClick={abrirAmbienteSelecionado}
                  >
                    Acessar ambiente
                  </button>
                </div>
              )}
          </div>
        </div>

        <div className="templates-preview">
          <h3>Modelos de automacao</h3>
          <p className="texto-suave">
            Exemplos para configurar rapidamente suas automacoes.
          </p>

          <div className="template-grid">
            {AUTOMACAO_TEMPLATES.map((tpl) => (
              <div key={tpl.id} className="template-card template-preview">
                <h4>{tpl.nome}</h4>
                <p>{tpl.descricao}</p>
              </div>
            ))}

            <div className="template-card template-preview">
              <h4>Personalizada (Manual)</h4>
              <p>
                Crie uma automacao totalmente personalizada, definindo
                horarios, dias e configuracoes manualmente.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading || loadingAmbiente) {
    return (
      <div className="automacoes-page">
        <div className="empty-state">
          <h3>Carregando automacoes...</h3>
          <p>Aguarde alguns instantes.</p>
        </div>
      </div>
    );
  }

  // ðŸ”’ SeguranÃ§a extra: ambiente invÃ¡lido
  if (ambienteIdFinal && !ambienteAtivo && !loadingAmbiente) {
    localStorage.removeItem("agst_active_ambiente_id");
  }

  if (!ambienteAtivo) {
    return (
      <div className="automacoes-page">
        <div className="empty-state">
          <h2>Ambiente nÃƒÂ£o encontrado</h2>
          <p>Esse ambiente nÃƒÂ£o existe ou foi removido.</p>
        </div>
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
        â† Voltar
      </button>
      <header className="page-header">
        <div>
          <h1>AutomaÃ§Ãµes</h1>
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
          <p>Gerencie regras automÃ¡ticas dos equipamentos</p>
        </div>

        <button className="btn-primary" onClick={abrirModalCriar}>
          Criar AutomaÃ§Ã£o
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
            <option value="HorÃ¡rio Comercial">HorÃ¡rio Comercial</option>
            <option value="AutomaÃ§Ã£o Personalizada">
              AutomaÃ§Ã£o Personalizada
            </option>
            <option value="PERSONALIZADA">Personalizada (Manual)</option>
          </select>
        </div>
      </div>

      {(ambienteAtivo.status === "OFFLINE" ||
        ambienteAtivo.status === "MANUTENCAO") && (
        <div className="alerta-ambiente">
          <strong>AutomaÃ§Ãµes indisponÃ­veis</strong>
          <p>
            {ambienteAtivo.status === "OFFLINE"
              ? "O ambiente estÃ¡ offline e nÃ£o pode executar automaÃ§Ãµes."
              : "O ambiente estÃ¡ em manutenÃ§Ã£o e as automaÃ§Ãµes estÃ£o bloqueadas."}
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
            identificarPerfilAutomacao(a)?.perfil || "AutomaÃ§Ã£o Personalizada";

          if (filtroPerfil !== "TODOS" && perfil !== filtroPerfil) {
            return false;
          }

          return true;
        }).length === 0 && (
          <div className="empty-state">
            <h3>Nenhuma automaÃ§Ã£o encontrada</h3>
            <p>
              {filtroStatus !== "TODAS" || filtroPerfil !== "TODOS"
                ? "Tente ajustar os filtros ou criar uma nova automaÃ§Ã£o."
                : "Crie sua primeira automaÃ§Ã£o para este ambiente."}
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
              "AutomaÃ§Ã£o Personalizada";

            if (filtroPerfil !== "TODOS" && perfil !== filtroPerfil) {
              return false;
            }

            return true;
          })
          .map((a) => {
            const perfil = identificarPerfilAutomacao(a) || {};
            const perfilNome = perfil.perfil || "AutomaÃ§Ã£o Personalizada";
            const perfilClass = perfilNome.toLowerCase().replace(/\s+/g, "-");
            const descricaoPerfil =
              DESCRICOES_PERFIL[perfilNome] ||
              "AutomaÃ§Ã£o configurada manualmente.";

            const economia = estimarEconomiaAutomacao(a);

            const statusInfo = getStatusAutomacao(
              a,
              ambienteAtivo,
              automacaoExecutando,
            );

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
                  <strong>
                    {statusInfo.tipo === "executando" && "âš¡ "}
                    {statusInfo.titulo}
                  </strong>
                  {statusInfo.descricao && (
                    <div className="status-descricao">
                      {statusInfo.descricao}
                    </div>
                  )}
                </div>

                {economia?.kwh > 0 && (
                  <div className="automacao-economia">
                    Economia estimada:
                    <strong>
                      {" "}
                      {economia.kwh} kWh / mÃªs Â· R$ {economia.valor}
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
                  <button
                    className="btn-danger"
                    onClick={() => excluirAutomacao(a)}
                  >
                    Excluir
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
              <h2>Criar AutomaÃ§Ã£o</h2>
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
                        novaAutomacao.tipo === "PERSONALIZADA"
                          ? "selecionado"
                          : ""
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
                        Crie uma automaÃ§Ã£o totalmente personalizada, definindo
                        horÃ¡rios, dias e configuraÃ§Ãµes manualmente.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {passo === 1 && <></>}
              {/* PASSO 2 â€” DIAS E HORÃRIO */}
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

                  <label className="form-label">HorÃ¡rio</label>

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

                    <span className="horario-separador">atÃ©</span>

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

              {/* PASSO 3 â€” EQUIPAMENTOS */}
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
                  PrÃ³ximo
                </button>
              )}

              {passo === 4 && (
                <button
                  className="btn-primary"
                  disabled={loadingSalvar}
                  onClick={salvarAutomacao}
                >
                  {modoModal === "EDITAR"
                    ? "Salvar AlteraÃ§Ãµes"
                    : "Criar AutomaÃ§Ã£o"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir automaÃ§Ã£o"
        message={
          confirmTarget
            ? `Tem certeza que deseja excluir a automaÃ§Ã£o \"${gerarNomeAutomacao(
                confirmTarget,
              )}\"?`
            : "Tem certeza que deseja excluir esta automaÃ§Ã£o?"
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmarExclusaoAutomacao}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmTarget(null);
        }}
      />
    </div>
  );
};

export default Automacoes;




