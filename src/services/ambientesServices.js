// src/services/ambientesServices.js

/**
 * ==============================
 * MOCK DE AMBIENTES (API-READY)
 * ==============================
 * Quando a API existir:
 * - basta trocar as funções internas por httpRequest(...)
 */

const STORAGE_KEY = "agst_mock_ambientes";

/**
 * Mock inicial (seed)
 */
const DEFAULT_AMBIENTES = [
  {
    id: 1,
    corporation_id: "1",
    nome: "Escritório Gerência",
    status: "ONLINE", // ONLINE | OFFLINE | PARCIAL | MANUTENCAO
    pausado: false,
    temperatura: 22,
    potencia: 10.5,
    equipamentos: [
      { id: 1, nome: "Samsung 1", ligado: true },
      { id: 2, nome: "Samsung 2", ligado: true },
    ],
    updated_at: "2026-01-31T14:20:00",
  },
  {
    id: 2,
    corporation_id: "1",
    nome: "Sala de Reuniões A",
    status: "PARCIAL",
    pausado: false,
    temperatura: 23,
    potencia: 4.2,
    equipamentos: [
      { id: 3, nome: "Samsung 3", ligado: true },
      { id: 4, nome: "Samsung 4", ligado: false },
    ],
    updated_at: "2026-01-31T13:50:00",
  },
];

/**
 * Helpers de storage
 */
function loadAll() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_AMBIENTES));
    return [...DEFAULT_AMBIENTES];
  }
  return JSON.parse(raw);
}

function saveAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * ==============================
 * API pública (usada pelas telas)
 * ==============================
 */

export async function listAmbientes(corporationId) {
  const all = loadAll();
  return {
    ok: true,
    data: all.filter(
      (a) => String(a.corporation_id) === String(corporationId)
    ),
  };
}

export async function getAmbienteById(id) {
  const all = loadAll();
  const ambiente = all.find((a) => String(a.id) === String(id));

  if (!ambiente) {
    return { ok: false, message: "Ambiente não encontrado." };
  }

  return { ok: true, data: ambiente };
}

export async function createAmbiente(corporationId, payload) {
  const all = loadAll();

  const novo = {
    id: Date.now(),
    corporation_id: String(corporationId),
    nome: payload.nome,
    status: "OFFLINE",
    pausado: false,
    temperatura: null,
    potencia: null,
    equipamentos: payload.equipamentos || [],
    updated_at: new Date().toISOString(),
  };

  all.push(novo);
  saveAll(all);

  return { ok: true, data: novo };
}

export async function updateAmbiente(id, payload) {
  const all = loadAll();
  const idx = all.findIndex((a) => String(a.id) === String(id));

  if (idx === -1) {
    return { ok: false, message: "Ambiente não encontrado." };
  }

  all[idx] = {
    ...all[idx],
    ...payload,
    updated_at: new Date().toISOString(),
  };

  saveAll(all);
  return { ok: true, data: all[idx] };
}

export async function deleteAmbiente(id) {
  const all = loadAll();
  const next = all.filter((a) => String(a.id) !== String(id));

  saveAll(next);
  return { ok: true };
}
