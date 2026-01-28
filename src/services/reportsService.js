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
