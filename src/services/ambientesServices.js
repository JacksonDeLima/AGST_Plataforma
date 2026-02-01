// ================================
// MOCK DE AMBIENTES (API-READY)
// ================================

const MOCK_AMBIENTES = [
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
    pausado: false,
    temperatura: 27,
    potencia: 0,
    equipamentos: [
      { id: 5, nome: "Samsung 5", ligado: false },
    ],
  },
  {
    id: 4,
    nome: "Auditório Principal",
    status: "MANUTENCAO",
    pausado: false,
    temperatura: 24,
    potencia: 0,
    equipamentos: [
      { id: 6, nome: "Samsung 6", ligado: false },
    ],
  },
];

// ================================
// FUNÇÕES (CONTRATO DE API)
// ================================

export function listarAmbientes() {
  return Promise.resolve(MOCK_AMBIENTES);
}

export function buscarAmbientePorId(id) {
  return Promise.resolve(
    MOCK_AMBIENTES.find((ambiente) => ambiente.id === id)
  );
}

export function pausarAmbiente(id) {
  const ambiente = MOCK_AMBIENTES.find((a) => a.id === id);
  if (ambiente) ambiente.pausado = true;
  return Promise.resolve(ambiente);
}

export function retomarAmbiente(id) {
  const ambiente = MOCK_AMBIENTES.find((a) => a.id === id);
  if (ambiente) ambiente.pausado = false;
  return Promise.resolve(ambiente);
}
