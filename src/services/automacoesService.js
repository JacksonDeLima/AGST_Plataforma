
// ===================================
// MOCK DE AUTOMACOES (API-READY)
// ===================================

const STORAGE_PREFIX = "agst_mock_automacoes_";

function getStorageKey(corporationId, ambienteId) {
  return `${STORAGE_PREFIX}${corporationId}_${ambienteId}`;
}

function loadAutomacoes(corporationId, ambienteId) {
  const key = getStorageKey(corporationId, ambienteId);
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

function saveAutomacoes(corporationId, ambienteId, data) {
  const key = getStorageKey(corporationId, ambienteId);
  localStorage.setItem(key, JSON.stringify(data));
}

function resolveIds(corporationId, ambienteId, payload) {
  const corpFromStorage = localStorage.getItem("agst_active_corporation_id");
  const ambFromStorage = localStorage.getItem("agst_active_ambiente_id");

  const corpId =
    corporationId || payload?.corporationId || corpFromStorage || "";
  const ambId = ambienteId || payload?.ambienteId || ambFromStorage || "";

  return {
    corpId: corpId ? String(corpId) : "",
    ambId: ambId ? String(ambId) : "",
  };
}

function findContextByAutomacaoId(automacaoId) {
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(STORAGE_PREFIX)) continue;

      const suffix = key.slice(STORAGE_PREFIX.length);
      const parts = suffix.split("_");
      if (parts.length < 2) continue;

      const corpId = parts[0];
      const ambId = parts.slice(1).join("_");
      const list = loadAutomacoes(corpId, ambId);
      const index = list.findIndex(
        (a) => String(a.id) === String(automacaoId)
      );

      if (index >= 0) {
        return { corpId, ambId, list, index };
      }
    }
  } catch {}

  return null;
}

let MOCK_AUTOMACOES = [
  {
    id: 1,
    ambienteId: 1,
    nome: "Economia Noturna",
    ativa: true,
    perfil: "economia",
    descricao: "Reduz consumo a noite",
    economia_kwh: 648,
    economia_reais: 583,
    status: "ATIVA",
  },
  {
    id: 2,
    ambienteId: 1,
    nome: "Desligar por Inatividade",
    ativa: true,
    perfil: "conforto",
    descricao: "Desliga apos inatividade",
    economia_kwh: 144,
    economia_reais: 130,
    status: "ATIVA",
  },
];

const MOCK_HISTORICO = {
  1: [
    { data: "2026-01-10", evento: "Executada com sucesso" },
    { data: "2026-01-12", evento: "Ignorada (ambiente pausado)" },
  ],
  2: [
    { data: "2026-01-11", evento: "Executada com sucesso" },
  ],
};

// LISTAR
export async function listarAutomacoes(corporationId, ambienteId) {
  if (ambienteId === undefined && corporationId) {
    const ids = resolveIds(null, corporationId, null);
    if (!ids.corpId || !ids.ambId) return [];
    return loadAutomacoes(ids.corpId, ids.ambId);
  }

  const ids = resolveIds(corporationId, ambienteId, null);
  if (!ids.corpId || !ids.ambId) return [];

  return loadAutomacoes(ids.corpId, ids.ambId);
}

// BUSCAR POR ID
export async function buscarAutomacaoPorId(id, corporationId, ambienteId) {
  const ids = resolveIds(corporationId, ambienteId, null);
  if (ids.corpId && ids.ambId) {
    const list = loadAutomacoes(ids.corpId, ids.ambId);
    return list.find((a) => String(a.id) === String(id)) || null;
  }

  const found = findContextByAutomacaoId(id);
  if (found) return found.list[found.index] || null;

  return MOCK_AUTOMACOES.find((a) => String(a.id) === String(id)) || null;
}

// CRIAR
export async function criarAutomacao(corporationId, ambienteId, payload) {
  let corpId = corporationId;
  let ambId = ambienteId;
  let data = payload;

  if (payload === undefined && typeof ambienteId === "object" && ambienteId) {
    data = ambienteId;
    ambId = data?.ambienteId;
  }

  if (payload === undefined && typeof corporationId === "object" && corporationId) {
    data = corporationId;
    corpId = null;
    ambId = data?.ambienteId;
  }

  const ids = resolveIds(corpId, ambId, data);
  if (!ids.corpId || !ids.ambId) return null;

  const lista = loadAutomacoes(ids.corpId, ids.ambId);

  const nova = {
    id: Date.now(),
    ativa: true,
    ...data,
  };

  lista.push(nova);
  saveAutomacoes(ids.corpId, ids.ambId, lista);

  return nova;
}

// EDITAR
export async function editarAutomacao(id, payload, corporationId, ambienteId) {
  const ids = resolveIds(corporationId, ambienteId, payload);

  if (ids.corpId && ids.ambId) {
    const lista = loadAutomacoes(ids.corpId, ids.ambId);
    const idx = lista.findIndex((a) => String(a.id) === String(id));

    if (idx >= 0) {
      lista[idx] = { ...lista[idx], ...payload };
      saveAutomacoes(ids.corpId, ids.ambId, lista);
      return lista[idx];
    }

    return null;
  }

  const found = findContextByAutomacaoId(id);
  if (!found) return null;

  found.list[found.index] = { ...found.list[found.index], ...payload };
  saveAutomacoes(found.corpId, found.ambId, found.list);

  return found.list[found.index];
}

// ATIVAR / DESATIVAR
export async function alterarStatusAutomacao(id, ativa, corporationId, ambienteId) {
  const status =
    typeof ativa === "string"
      ? ativa
      : ativa
      ? "ATIVA"
      : "PAUSADA";

  return editarAutomacao(
    id,
    { ativa: status === "ATIVA", status },
    corporationId,
    ambienteId
  );
}

// HISTORICO
export async function buscarHistoricoAutomacao(id) {
  return MOCK_HISTORICO[String(id)] || [];
}

// AUXILIARES (sync)
export function identificarPerfilAutomacao(automacao) {
  if (!automacao) {
    return {
      perfil: "Desconhecida",
      impacto: "Indefinido",
      prioridade: "baixa",
    };
  }

  if (
    automacao.tipo === "HORARIO" &&
    automacao.inicio &&
    automacao.inicio >= "18:00"
  ) {
    return {
      perfil: "Economia Noturna",
      impacto: "Medio",
      prioridade: "media",
    };
  }

  if (
    automacao.tipo === "HORARIO" &&
    automacao.inicio >= "07:00" &&
    automacao.fim <= "19:00"
  ) {
    return {
      perfil: "Horario Comercial",
      impacto: "Baixo",
      prioridade: "baixa",
    };
  }

  if (automacao.tipo === "OCUPACAO") {
    return {
      perfil: "Economia por Inatividade",
      impacto: "Medio",
      prioridade: "media",
    };
  }

  return {
    perfil: "Automacao Personalizada",
    impacto: "Baixo",
    prioridade: "baixa",
  };
}

export function gerarNomeAutomacao(template) {
  return template?.nome || "Nova automacao";
}

export function estimarEconomiaAutomacao() {
  return {
    kwh: 144,
    valor: 130,
  };
}
export async function limparAutomacoesDoAmbiente(corporationId, ambienteId) {
  const key = getStorageKey(corporationId, ambienteId);
  localStorage.removeItem(key);
}

export async function deletarAutomacao(id, corporationId, ambienteId) {
  const ids = resolveIds(corporationId, ambienteId, null);
  if (!ids.corpId || !ids.ambId) return false;

  const lista = loadAutomacoes(ids.corpId, ids.ambId);

  const novaLista = lista.filter(
    (a) => String(a.id) !== String(id)
  );

  saveAutomacoes(ids.corpId, ids.ambId, novaLista);

  return true;
}
