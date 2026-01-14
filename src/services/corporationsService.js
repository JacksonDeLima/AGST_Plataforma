// src/services/corporationsService.js
import { httpRequest } from "./httpClient";
import { endpoints } from "../config/endpoints";
import { buildApiUrl } from "../config/apiconfig";

const DEBUG_CORP = true;

function getAccessToken() {
  return localStorage.getItem("access_token");
}

function maskToken(token) {
  if (!token) return "MISSING";
  if (token.length < 16) return "SHORT_TOKEN";
  return `${token.slice(0, 10)}...${token.slice(-6)}`;
}

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ⚠️ decode simples do JWT (somente pra UI/role; não valida assinatura)
function decodeJwtPayload(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getCurrentUserIdFromToken() {
  const token = getAccessToken();
  const payload = decodeJwtPayload(token);
  // ajuste conforme seu backend: id | user_id | sub
  return payload?.id ?? payload?.user_id ?? payload?.sub ?? null;
}

function parseHttpError(err) {
  const status = err?.status;

  // data pode ser objeto (json) OU string (html/text)
  const apiMsg =
    (typeof err?.data === "object" && err?.data
      ? (err.data.message || err.data.error || err.data.detail)
      : null) ||
    (typeof err?.data === "string" && err.data.trim()
      ? err.data
      : null);

  if (status === 400) return apiMsg || "Dados inválidos. Verifique os campos.";
  if (status === 401) return apiMsg || "Não autorizado. Token ausente ou inválido.";
  if (status === 403) return apiMsg || "Acesso negado para esta corporação.";
  if (status === 404) return apiMsg || "Corporação/usuário não encontrado.";
  if (status === 409) return apiMsg || "Conflito (já existe/ já é membro).";
  if (status === 500) return apiMsg || "Erro interno na API (500). Veja o Response no Network.";

  return apiMsg || "Erro ao comunicar com a API. Veja Network/Console.";
}


export async function listCorporations() {
  const token = getAccessToken();
  const t = `GET /corporations #${Date.now()}`;

  if (DEBUG_CORP) {
    console.groupCollapsed("🏢 [Corporations] GET /corporations");
    console.log("token:", maskToken(token));
    console.log("endpoint:", endpoints.corporations.list);
    console.time(t);
  }

  try {
    const data = await httpRequest(endpoints.corporations.list, {
      method: "GET",
      headers: { ...authHeaders() },
    });

    if (DEBUG_CORP) {
      console.timeEnd(t);
      console.log("response:", data);
      console.groupEnd();
    }

    return { ok: true, data: Array.isArray(data) ? data : [] };
  } catch (err) {
    if (DEBUG_CORP) {
      console.timeEnd(t);
      console.error("error raw:", err);
      console.log("parsed message:", parseHttpError(err));
      console.groupEnd();
    }
    return { ok: false, message: parseHttpError(err), error: err };
  }
}

export async function createCorporation({ name, tax_id }) {
  const token = getAccessToken();
  const t = `POST /corporations #${Date.now()}`;

  if (DEBUG_CORP) {
    console.groupCollapsed("🏢 [Corporations] POST /corporations");
    console.log("token:", maskToken(token));
    console.log("endpoint:", endpoints.corporations.create);
    console.log("payload:", { name, tax_id });
    console.time(t);
  }

  try {
    const data = await httpRequest(endpoints.corporations.create, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ name, tax_id }),
    });

    if (DEBUG_CORP) {
      console.timeEnd(t);
      console.log("response:", data);
      console.groupEnd();
    }

    return { ok: true, data };
  } catch (err) {
    if (DEBUG_CORP) {
      console.timeEnd(t);
      console.error("error raw:", err);
      console.log("parsed message:", parseHttpError(err));
      console.groupEnd();
    }
    return { ok: false, message: parseHttpError(err), error: err };
  }
}

export async function getCorporation(corporationId) {
  const token = getAccessToken();
  const t = `GET /corporations/${corporationId} #${Date.now()}`;

  if (DEBUG_CORP) {
    console.groupCollapsed(`🏢 [Corporations] GET /corporations/${corporationId}`);
    console.log("token:", maskToken(token));
    console.log("endpoint:", endpoints.corporations.get(corporationId));
    console.time(t);
  }

  try {
    const data = await httpRequest(endpoints.corporations.get(corporationId), {
      method: "GET",
      headers: { ...authHeaders() },
    });

    if (DEBUG_CORP) {
      console.timeEnd(t);
      console.log("response:", data);
      console.groupEnd();
    }

    return { ok: true, data };
  } catch (err) {
    if (DEBUG_CORP) {
      console.timeEnd(t);
      console.error("error raw:", err);
      console.log("parsed message:", parseHttpError(err));
      console.groupEnd();
    }
    return { ok: false, message: parseHttpError(err), error: err };
  }
}

export async function listCorporationMembers(corporationId) {
  const token = getAccessToken();
  const t = `GET /corporations/${corporationId}/members #${Date.now()}`;

  if (DEBUG_CORP) {
    console.groupCollapsed(`👥 [Corporations] GET /corporations/${corporationId}/members`);
    console.log("token:", maskToken(token));
    console.log("endpoint:", endpoints.corporations.members(corporationId));
    console.time(t);
  }

  try {
    const data = await httpRequest(endpoints.corporations.members(corporationId), {
      method: "GET",
      headers: { ...authHeaders() },
    });

    if (DEBUG_CORP) {
      console.timeEnd(t);
      console.log("response:", data);
      console.groupEnd();
    }

    return { ok: true, data: Array.isArray(data) ? data : [] };
  } catch (err) {
    if (DEBUG_CORP) {
      console.timeEnd(t);
      console.error("error raw:", err);
      console.log("parsed message:", parseHttpError(err));
      console.groupEnd();
    }
    return { ok: false, message: parseHttpError(err), error: err };
  }
}

export async function addCorporationMember(corporationId, payload) {
  const token = getAccessToken();
  const endpoint = endpoints.corporations.addMember(corporationId);
  const url = buildApiUrl(endpoint);

  const t = `POST ${endpoint} #${Date.now()}`;

  // ✅ snapshot do request (sem vazar senha/token)
  const safePayload = { ...payload, password: payload?.password ? "******" : undefined };
  const safeHeaders = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${maskToken(token)}` : "(missing)",
  };

  if (DEBUG_CORP) {
    console.groupCollapsed(`➕👥 [Corporations] POST ${endpoint}`);
    console.log("endpoint:", endpoint);
    console.log("url:", url);
    console.log("headers:", safeHeaders);
    console.log("payload:", safePayload);
    console.time(t);
  }

  try {
    const data = await httpRequest(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(), // aqui vai o Bearer real
      },
      body: JSON.stringify(payload),
    });

    if (DEBUG_CORP) {
      console.timeEnd(t);
      console.log("response:", data);
    }

    return { ok: true, data };
  } catch (err) {
    if (DEBUG_CORP) {
      console.timeEnd(t);
      console.error("❌ error raw:", err);
      console.log("status:", err?.status);
      console.log("url:", err?.url || url);
      console.log("data:", err?.data);
      console.log("rawText:", err?.rawText);
      console.log("parsed message:", parseHttpError(err));
    }

    return { ok: false, message: parseHttpError(err), error: err };
  } finally {
    if (DEBUG_CORP) console.groupEnd();
  }
}

export async function transferCorporationOwnership(corporationId, payload) {
  const token = getAccessToken();
  const t = `PATCH /corporations/${corporationId} (transfer) #${Date.now()}`;

  if (DEBUG_CORP) {
    console.groupCollapsed(`🔁🏢 [Corporations] PATCH /corporations/${corporationId}`);
    console.log("token:", maskToken(token));
    console.log("endpoint:", endpoints.corporations.transfer(corporationId));
    console.log("payload:", { ...payload, current_owner_password: "******" });
    console.time(t);
  }

  try {
    const data = await httpRequest(endpoints.corporations.transfer(corporationId), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (DEBUG_CORP) {
      console.timeEnd(t);
      console.log("response:", data);
      console.groupEnd();
    }

    return { ok: true, data };
  } catch (err) {
    if (DEBUG_CORP) {
      console.timeEnd(t);
      console.error("error raw:", err);
      console.log("parsed message:", parseHttpError(err));
      console.groupEnd();
    }
    return { ok: false, message: parseHttpError(err), error: err };
  }
}

export async function deleteCorporation(corporationId) {
  const token = getAccessToken();
  const t = `DELETE /corporations/${corporationId} #${Date.now()}`;

  if (DEBUG_CORP) {
    console.groupCollapsed(`🗑️🏢 [Corporations] DELETE /corporations/${corporationId}`);
    console.log("token:", maskToken(token));
    console.log("endpoint:", endpoints.corporations.remove(corporationId));
    console.time(t);
  }

  try {
    // alguns httpClient devolvem vazio no 204 — tudo bem
    const data = await httpRequest(endpoints.corporations.remove(corporationId), {
      method: "DELETE",
      headers: { ...authHeaders() },
    });

    if (DEBUG_CORP) {
      console.timeEnd(t);
      console.log("response:", data);
      console.groupEnd();
    }

    return { ok: true, data };
  } catch (err) {
    if (DEBUG_CORP) {
      console.timeEnd(t);
      console.error("error raw:", err);
      console.log("parsed message:", parseHttpError(err));
      console.groupEnd();
    }
    return { ok: false, message: parseHttpError(err), error: err };
  }
}
