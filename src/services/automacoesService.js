
let MOCK_AUTOMACOES = [
  {
    id: 1,
    ambienteId: 1,
    nome: "Economia Noturna",
    perfil: "economia",
    ativa: true,
    executando: true,
    status: "ATIVA",
    economiaKwhMes: 648,
    economiaReaisMes: 583,
    sobrepostaPor: null,
    criadoEm: "2026-01-10T22:00:00",
  },
  {
    id: 2,
    ambienteId: 1,
    nome: "Desligar por Inatividade",
    perfil: "inatividade",
    ativa: true,
    executando: false,
    status: "ATIVA",
    economiaKwhMes: 144,
    economiaReaisMes: 130,
    sobrepostaPor: "Economia Noturna",
    criadoEm: "2026-01-12T08:00:00",
  },
];

// ===============================
// LISTAR
// ===============================
export async function listarAutomacoes(ambienteId) {
  return MOCK_AUTOMACOES.filter(
    (a) => String(a.ambienteId) === String(ambienteId)
  );
}

// ===============================
// BUSCAR POR ID
// ===============================
export async function buscarAutomacaoPorId(id) {
  return MOCK_AUTOMACOES.find((a) => String(a.id) === String(id)) || null;
}

// ===============================
// CRIAR
// ===============================
export async function criarAutomacao(payload) {
  const nova = {
    id: Date.now(),
    ativa: true,
    executando: false,
    status: "ATIVA",
    criadoEm: new Date().toISOString(),
    ...payload,
  };

  MOCK_AUTOMACOES.push(nova);
  return nova;
}

// ===============================
// EDITAR
// ===============================
export async function editarAutomacao(id, payload) {
  MOCK_AUTOMACOES = MOCK_AUTOMACOES.map((a) =>
    String(a.id) === String(id) ? { ...a, ...payload } : a
  );

  return buscarAutomacaoPorId(id);
}

// ===============================
// ATIVAR / DESATIVAR
// ===============================
export async function alterarStatusAutomacao(id, ativa) {
  return editarAutomacao(id, {
    ativa,
    status: ativa ? "ATIVA" : "PAUSADA",
  });
}

// ===============================
// PERFIL
// ===============================
export function identificarPerfilAutomacao(template) {
  return template?.perfil || "custom";
}

// ===============================
// NOME PADRAO
// ===============================
export function gerarNomeAutomacao(template) {
  return template?.nome || "Nova automacao";
}

// ===============================
// ECONOMIA
// ===============================
export function estimarEconomiaAutomacao(template) {
  return {
    kwhMes: template?.economiaKwhMes || 0,
    reaisMes: template?.economiaReaisMes || 0,
  };
}

// ===============================
// HISTORICO
// ===============================
export async function buscarHistoricoAutomacao() {
  return [
    { data: "2026-01-15", evento: "Executada com sucesso" },
    { data: "2026-01-16", evento: "Ignorada (ambiente pausado)" },
  ];
}
