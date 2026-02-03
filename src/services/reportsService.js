// src/services/reportsService.js
import { httpRequest } from "./httpClient";

export async function getUsersByCorporation() {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  if (!token) {
    throw new Error("Token não encontrado");
  }

  // 1️⃣ Buscar corporações
  const corpResponse = await httpRequest("/corporations", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // 🔥 CORREÇÃO CRÍTICA
  const corporations = Array.isArray(corpResponse)
    ? corpResponse
    : corpResponse?.data || [];

  const result = [];

  for (const corp of corporations) {
    // Se existir controle por role, mantenha
    if (corp.role && corp.role !== "admin") continue;

    // 2️⃣ Buscar membros
    const membersResponse = await httpRequest(
      `/corporations/${corp.id}/members`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const members = Array.isArray(membersResponse)
      ? membersResponse
      : membersResponse?.data || [];

    if (members.length === 0) continue;

    // 3️⃣ Estatísticas
    const admins = members.filter(m => m.role === "admin").length;
    const users = members.filter(m => m.role === "user").length;
    const pending = members.filter(
      m => m.member_status === "pending"
    ).length;

    result.push({
      corporationId: corp.id,
      corporationName: corp.name,
      members,
      stats: {
        total: members.length,
        admins,
        users,
        pending,
      },
    });
  }

  return result;
}

export async function getEnergyConsumptionReport() {
  // 👉 Estrutura pensada para API real
  return {
    summary: {
      totalKwh: 1680,
      avgPerDevice: 210,
      avgEfficiency: 1.45,
      outOfScheduleDevices: 3,
    },

    timeline: [
      { date: "01/09", kwh: 210 },
      { date: "02/09", kwh: 230 },
      { date: "03/09", kwh: 250 },
      { date: "04/09", kwh: 310 },
      { date: "05/09", kwh: 280 },
      { date: "06/09", kwh: 200 },
    ],

    byDevice: [
      { name: "AC Sala", kwh: 420, efficiency: 1.9 },
      { name: "AC Escritório", kwh: 380, efficiency: 1.4 },
      { name: "AC Reunião", kwh: 290, efficiency: 1.1 },
      { name: "AC Recepção", kwh: 240, efficiency: 1.0 },
      { name: "Servidor", kwh: 350, efficiency: 2.2 },
    ],

    byEnvironment: [
      { name: "Sala", value: 420 },
      { name: "Escritório", value: 380 },
      { name: "Reunião", value: 290 },
      { name: "Recepção", value: 240 },
      { name: "Infraestrutura", value: 350 },
    ],

    alerts: [
      { device: "AC Sala", type: "Fora do horário" },
      { device: "Servidor", type: "Consumo elevado contínuo" },
    ],
  };
}