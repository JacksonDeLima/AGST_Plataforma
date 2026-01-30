export function calcularImpactoAutomacaoDetalhado(automacao) {
  if (!automacao) return null;

  const {
    dias = [],
    inicio,
    fim,
    equipamentos = [],
  } = automacao;

  if (!inicio || !fim || dias.length === 0 || equipamentos.length === 0) {
    return null;
  }

  // Premissas
  const CONSUMO_KWH_POR_HORA = 1.2;
  const CUSTO_KWH = 0.75;
  const FATOR_ECONOMIA = 0.25;

  // Horas por dia
  const inicioHora = Number(inicio.split(":")[0]);
  const fimHora = Number(fim.split(":")[0]);

  let horasPorDia = fimHora - inicioHora;
  if (horasPorDia <= 0) horasPorDia += 24;

  // Dias no mês (média)
  const diasPorMes = dias.length * 4;

  // Consumo total
  const consumoMensal =
    equipamentos.length *
    horasPorDia *
    diasPorMes *
    CONSUMO_KWH_POR_HORA;

  // Economia
  const economiaKwh = consumoMensal * FATOR_ECONOMIA;
  const economiaReais = economiaKwh * CUSTO_KWH;

  return {
    horasPorDia,
    diasPorMes,
    consumoMensal: consumoMensal.toFixed(1),
    economiaKwh: economiaKwh.toFixed(1),
    economiaReais: economiaReais.toFixed(2),
    percentual: FATOR_ECONOMIA * 100,
  };
}
