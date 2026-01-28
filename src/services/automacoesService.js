

let automacoesMock = [
  {
    id: 1,
    nome: "Economia Noturna",
    tipo: "HORARIO",
    status: "ATIVA",
    ambiente: "Escritório Gerência",
    regra: "Seg–Sex · 22h → 06h",
    equipamentos: ["Ar 01", "Ar 02", "Ar 03"],
    dias: ["SEG", "TER", "QUA", "QUI", "SEX"],
    inicio: "22:00",
    fim: "06:00",
    executando: true,
  },
  {
    id: 2,
    nome: "Desligar por Inatividade",
    tipo: "OCUPACAO",
    status: "ATIVA",
    ambiente: "Sala de Reunião",
    regra: "20 minutos sem movimento",
    equipamentos: ["Ar 02"],
    dias: ["SEG", "TER", "QUA", "QUI", "SEX"],
    inicio: "08:00",
    fim: "18:00",
    executando: false,
  },
];

// ===============================
// 🔹 CRIAR AUTOMAÇÃO
// ===============================
export async function criarAutomacao(dados) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const nova = {
        id: Date.now(),
        nome: dados.nome || "Nova Automação",
        status: "ATIVA",
        executando: false,
        ...dados,
      };

      automacoesMock.push(nova); // ✅ IMPORTANTE
      resolve(nova);
    }, 800);
  });
}

// ===============================
// 🔹 LISTAR AUTOMAÇÕES
// ===============================
export function listarAutomacoes() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...automacoesMock]);
    }, 500);
  });
}

// ===============================
// 🔹 BUSCAR DETALHES
// ===============================
export function buscarAutomacaoPorId(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const automacao = automacoesMock.find(
        (a) => String(a.id) === String(id)
      );

      if (!automacao) {
        reject("Automação não encontrada");
      } else {
        resolve({ ...automacao });
      }
    }, 500);
  });
}

// ===============================
// 🔹 EDITAR AUTOMAÇÃO
// ===============================
export function editarAutomacao(id, payload) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = automacoesMock.findIndex(
        (a) => String(a.id) === String(id)
      );

      if (index === -1) {
        reject("Automação não encontrada");
        return;
      }

      automacoesMock[index] = {
        ...automacoesMock[index],
        ...payload,
      };

      resolve({ ...automacoesMock[index] });
    }, 500);
  });
}

// ===============================
// 🔹 PAUSAR / ATIVAR
// ===============================
export function alterarStatusAutomacao(id, status) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const automacao = automacoesMock.find(
        (a) => String(a.id) === String(id)
      );

      if (!automacao) {
        reject("Automação não encontrada");
        return;
      }

      automacao.status = status;
      automacao.executando = status === "ATIVA";

      resolve({ ...automacao });
    }, 500);
  });
}

// ===============================
// 🔹 HISTÓRICO
// ===============================
export function buscarHistoricoAutomacao(_id) {
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
    }, 600);
  });
}
