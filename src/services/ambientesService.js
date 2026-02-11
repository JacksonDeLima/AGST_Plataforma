function getStorageKey(corporationId) {
  return `agst_mock_ambientes_${corporationId}`;
}

function loadAmbientes(corporationId) {
  const key = getStorageKey(corporationId);
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

function saveAmbientes(corporationId, data) {
  const key = getStorageKey(corporationId);
  localStorage.setItem(key, JSON.stringify(data));
}

export async function listarAmbientes(corporationId) {
  const data = loadAmbientes(corporationId);
  return Array.isArray(data) ? data : [];
}

export async function listAmbientes(corporationId) {
  return listarAmbientes(corporationId);
}

export async function getAmbienteById(ambienteId, corporationId) {
  const findInList = (list) =>
    Array.isArray(list)
      ? list.find((a) => String(a.id) === String(ambienteId))
      : null;

  let ambiente = null;

  if (corporationId) {
    const list = loadAmbientes(corporationId) || [];
    ambiente = findInList(list);
  } else {
    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key && key.startsWith("agst_mock_ambientes_")) {
          const raw = localStorage.getItem(key);
          const list = raw ? JSON.parse(raw) : null;
          ambiente = findInList(list);
          if (ambiente) break;
        }
      }
    } catch {}
  }

  if (!ambiente) {
    return { ok: false, message: "Ambiente nao encontrado" };
  }

  return { ok: true, data: ambiente };
}

export async function criarAmbiente(corporationId, payload) {
  const ambientes = loadAmbientes(corporationId);

  const novo = {
    id: Date.now(),
    ...payload,
  };

  ambientes.push(novo);
  saveAmbientes(corporationId, ambientes);

  return novo;
}

export async function createAmbiente(corporationId, payload) {
  return criarAmbiente(corporationId, payload);
}

export async function editarAmbiente(corporationId, id, payload) {
  const ambientes = loadAmbientes(corporationId);

  const idx = ambientes.findIndex((a) => String(a.id) === String(id));

  if (idx >= 0) {
    ambientes[idx] = { ...ambientes[idx], ...payload };
    saveAmbientes(corporationId, ambientes);
    return ambientes[idx];
  }

  return null;
}


export async function updateAmbiente(corporationId, ambienteId, changes) {
  return editarAmbiente(corporationId, ambienteId, changes);
}
export async function removerAmbiente(corporationId, ambienteId) {
  const ambientes = loadAmbientes(corporationId);

  const filtrados = ambientes.filter(
    (a) => String(a.id) !== String(ambienteId)
  );

  saveAmbientes(corporationId, filtrados);

  return true;
}

export async function excluirAmbiente(corporationId, ambienteId) {
  const ambientes = loadAmbientes(corporationId);

  const novaLista = ambientes.filter(
    (a) => String(a.id) !== String(ambienteId)
  );

  saveAmbientes(corporationId, novaLista);

  return true;
}

export async function deletarAmbiente(corporationId, ambienteId) {
  const ambientes = loadAmbientes(corporationId);

  const novaLista = ambientes.filter(
    (a) => String(a.id) !== String(ambienteId)
  );

  saveAmbientes(corporationId, novaLista);

  return true;
}
