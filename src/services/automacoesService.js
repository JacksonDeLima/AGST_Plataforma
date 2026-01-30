// ===============================
// 🔹 MOCK DATA (FONTE ÚNICA)
// ===============================
let automacoesMock = [
  {
    id: 1,
    nome: "Economia Noturna",
    tipo: "HORARIO",
    status: "ATIVA",
    ambiente: "Escritório Gerência",
    regra: "SEG, TER, QUA, QUI, SEX · 22:00 → 06:00",
    equipamentos: ["Ar 01", "Ar 02", "Ar 03"],
    executando: true,
    dias: ["SEG", "TER", "QUA", "QUI", "SEX"],
    inicio: "22:00",
    fim: "06:00",
  },
  {
    id: 2,
    nome: "Desligar por Inatividade",
    tipo: "OCUPACAO",
    status: "ATIVA",
    ambiente: "Sala de Reunião",
    regra: "20 minutos sem movimento",
    equipamentos: ["Ar 02"],
    executando: false,
    dias: [],
    inicio: "",
    fim: "",
  },
];

// ===============================
// 🔹 LISTAR AUTOMAÇÕES
// ===============================
export function listarAutomacoes() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...automacoesMock]);
    }, 400);
  });
}

// ===============================
// 🔹 BUSCAR POR ID
// ===============================
export function buscarAutomacaoPorId(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        automacoesMock.find((a) => String(a.id) === String(id))
      );
    }, 400);
  });
}

// ===============================
// 🔹 CRIAR AUTOMAÇÃO
// ===============================
export function criarAutomacao(dados) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const nova = {
        id: Date.now(),
        status: "ATIVA",
        executando: false,
        ...dados,
      };

      automacoesMock.push(nova);
      resolve(nova);
    }, 600);
  });
}

// ===============================
// 🔹 EDITAR AUTOMAÇÃO
// ===============================
export function editarAutomacao(id, payload) {
  return new Promise((resolve) => {
    setTimeout(() => {
      automacoesMock = automacoesMock.map((a) =>
        String(a.id) === String(id) ? { ...a, ...payload } : a
      );
      resolve({ sucesso: true });
    }, 500);
  });
}

// ===============================
// 🔹 ALTERAR STATUS
// ===============================
export function alterarStatusAutomacao(id, status) {
  return new Promise((resolve) => {
    setTimeout(() => {
      automacoesMock = automacoesMock.map((a) =>
        String(a.id) === String(id) ? { ...a, status } : a
      );
      resolve({ sucesso: true });
    }, 400);
  });
}

// ===============================
// 🔹 HISTÓRICO
// ===============================
export function buscarHistoricoAutomacao() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          data: "27/01/2026 22:00",
          status: "SUCESSO",
          mensagem: "Equipamentos desligados",
        },
        {
          id: 2,
          data: "26/01/2026 22:00",
          status: "ERRO",
          mensagem: "Ar-condicionado 02 offline",
        },
      ]);
    }, 500);
  });
}

// ===============================
// 🔹 IDENTIFICAR PERFIL DA AUTOMAÇÃO (ÚNICA)
// ===============================
export function identificarPerfilAutomacao(automacao) {
  if (!automacao) {
    return {
      perfil: "Desconhecida",
      impacto: "Indefinido",
      prioridade: "baixa",
    };
  }

  // ECONOMIA NOTURNA
  if (
    automacao.tipo === "HORARIO" &&
    automacao.inicio &&
    automacao.inicio >= "18:00"
  ) {
    return {
      perfil: "Economia Noturna",
      impacto: "Médio",
      prioridade: "media",
    };
  }

  // HORÁRIO COMERCIAL
  if (
    automacao.tipo === "HORARIO" &&
    automacao.inicio >= "07:00" &&
    automacao.fim <= "19:00"
  ) {
    return {
      perfil: "Horário Comercial",
      impacto: "Baixo",
      prioridade: "baixa",
    };
  }

  // OCUPAÇÃO
  if (automacao.tipo === "OCUPACAO") {
    return {
      perfil: "Economia por Inatividade",
      impacto: "Médio",
      prioridade: "media",
    };
  }

  return {
    perfil: "Automação Personalizada",
    impacto: "Baixo",
    prioridade: "baixa",
  };
}

// ===============================
// 🔹 GERAR NOME AUTOMÁTICO (ÚNICO)
// ===============================
export function gerarNomeAutomacao(automacao) {
  if (!automacao) return "Automação";

  if (automacao.nome && automacao.nome.trim() !== "") {
    return automacao.nome;
  }

  const ambiente = automacao.ambiente || "Ambiente";

  if (
    automacao.tipo === "HORARIO" &&
    automacao.inicio &&
    automacao.inicio >= "18:00"
  ) {
    return `Economia Noturna — ${ambiente}`;
  }

  if (
    automacao.tipo === "HORARIO" &&
    automacao.inicio >= "07:00" &&
    automacao.fim <= "19:00"
  ) {
    return `Horário Comercial — ${ambiente}`;
  }

  if (automacao.tipo === "OCUPACAO") {
    return `Desligamento por Inatividade — ${ambiente}`;
  }

  return `Automação — ${ambiente}`;
}
// ===============================
// 🔹 ESTIMATIVA DE ECONOMIA
// ===============================
export function estimarEconomiaAutomacao(automacao) {
  if (!automacao || !automacao.equipamentos?.length) {
    return { kwh: 0, valor: 0 };
  }

  const consumoPorHora = 1.2; // kWh por equipamento
  const tarifa = 0.9; // R$ por kWh

  let horasDia = 0;

  if (automacao.tipo === "HORARIO") horasDia = 6;
  if (automacao.tipo === "OCUPACAO") horasDia = 4;

  const kwhMes =
    automacao.equipamentos.length *
    consumoPorHora *
    horasDia *
    30;

  const valor = kwhMes * tarifa;

  return {
    kwh: Math.round(kwhMes),
    valor: Math.round(valor),
  };
}
