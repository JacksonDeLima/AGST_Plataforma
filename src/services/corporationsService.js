import { httpRequest } from "./httpClient";
import { endpoints } from "../config/endpoints";

function getAccessToken() {
  return localStorage.getItem("access_token");
}

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function parseHttpError(err) {
  // Tenta padronizar mensagem por status
  const status = err?.status || err?.response?.status;

  if (status === 401) return "Não autorizado. Faça login novamente.";
  if (status === 409) return "Já existe uma corporação com este CNPJ.";
  if (status === 400) return "Dados inválidos. Verifique Nome e CNPJ.";
  return "Não foi possível concluir a operação. Tente novamente.";
}

export async function listCorporations() {
  try {
    const data = await httpRequest(endpoints.corporations.list, {
      method: "GET",
      headers: {
        ...authHeaders(),
      },
    });

    // API retorna array
    return { ok: true, data: Array.isArray(data) ? data : [] };
  } catch (err) {
    return { ok: false, message: parseHttpError(err), error: err };
  }
}

export async function createCorporation({ name, tax_id }) {
  try {
    const payload = { name, tax_id };

    const data = await httpRequest(endpoints.corporations.create, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });

    // 201: { id, status, created_at }
    return { ok: true, data };
  } catch (err) {
    return { ok: false, message: parseHttpError(err), error: err };
  }
}
