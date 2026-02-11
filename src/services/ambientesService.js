function getStorageKey(corporationId) {
  return `agst:ambientes:${corporationId}`;
}

function loadFromStorage(corporationId) {
  try {
    const raw = localStorage.getItem(getStorageKey(corporationId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(corporationId, data) {
  localStorage.setItem(
    getStorageKey(corporationId),
    JSON.stringify(data)
  );
}

// ================================
// MOCK DE AMBIENTES (API-READY)
// ================================

let MOCK_AMBIENTES = [
  {
    id: 1,
    nome: "Escritório Gerência",
    status: "ONLINE",
    pausado: false,
    temperatura: 22,
    potencia: 10.5,
    equipamentos: [
      { id: 1, nome: "Samsung 1", ligado: true },
      { id: 2, nome: "Samsung 2", ligado: true },
    ],
    ultimaAtualizacao: "2026-01-31T14:20:00",
  },
  {
    id: 2,
    nome: "Sala de Reuniões A",
    status: "PARCIAL",
    pausado: false,
    temperatura: 23,
    potencia: 4.2,
    equipamentos: [
      { id: 3, nome: "Samsung 3", ligado: true },
      { id: 4, nome: "Samsung 4", ligado: false },
    ],
    ultimaAtualizacao: "2026-01-31T13:50:00",
  },
  {
    id: 3,
    nome: "Sala de Reuniões B",
    status: "OFFLINE",
    pausado: true,
    temperatura: null,
    potencia: null,
    equipamentos: [{ id: 5, nome: "Samsung 5", ligado: false }],
    ultimaAtualizacao: "2026-01-30T18:10:00",
  },
];

// ================================
// HELPERS
// ================================

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ================================
// SERVICES (API-READY)
// ================================

/**
 * Lista ambientes da corp ativa
 * (mock por enquanto)
 */
export function listAmbientes(corporationId) {
  if (!corporationId) return [];

  const stored = loadFromStorage(corporationId);
  if (stored) return stored;

  saveToStorage(corporationId, MOCK_AMBIENTES);
  return MOCK_AMBIENTES;
}

export function listarAmbientes(corporationId) {
  return listAmbientes(corporationId);
}

/**
 * Busca ambiente por ID
 */
export async function getAmbienteById(ambienteId, corporationId) {
  const findInList = (list) =>
    Array.isArray(list)
      ? list.find((a) => String(a.id) === String(ambienteId))
      : null;

  let ambiente = null;

  if (corporationId) {
    const list = loadFromStorage(corporationId) || [];
    ambiente = findInList(list);
  } else {
    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key && key.startsWith("agst:ambientes:")) {
          const raw = localStorage.getItem(key);
          const list = raw ? JSON.parse(raw) : null;
          ambiente = findInList(list);
          if (ambiente) break;
        }
      }
    } catch {}
  }

  if (!ambiente) {
    ambiente = findInList(MOCK_AMBIENTES);
  }

  if (!ambiente) {
    return { ok: false, message: "Ambiente nÃ£o encontrado" };
  }

  return { ok: true, data: ambiente };
}

/**
 * Cria novo ambiente
 */
export function createAmbiente(corporationId, ambiente) {
  const list = loadFromStorage(corporationId) || [];

  const novo = {
    id: Date.now(),
    status: "ATIVO",
    equipamentosTotal: 0,
    equipamentosLigados: 0,
    temperatura: null,
    potencia: null,
    ...ambiente,
  };

  const updated = [...list, novo];
  saveToStorage(corporationId, updated);

  return novo;
}

export async function updateAmbiente(corporationId, ambienteId, changes) {
  const list = loadFromStorage(corporationId) || [];

  const updated = list.map((a) =>
    a.id === ambienteId ? { ...a, ...changes } : a
  );

  saveToStorage(corporationId, updated);
  return { ok: true };
}
