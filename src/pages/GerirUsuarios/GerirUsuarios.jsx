import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./GerirUsuarios.css";
import { API_BASE_URL } from "../../config/apiConfig";

import { useAuth } from "../../context/AuthContext.jsx";
import { listCorporationMembers } from "../../services/corporationsService";
import ConfirmDialog from "../../components/ConfirmDialog";

/** =================== Helpers =================== */
const getToken = () => localStorage.getItem("access_token");

function isAdminRole(role) {
  const r = String(role || "").toLowerCase();
  return r === "admin" || r === "owner" || r === "super_admin";
}

function getUserId(user) {
  return String(user?.id ?? user?.user_id ?? user?.uid ?? "");
}

function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

async function apiRequest(path, { method = "GET", body, auth = true } = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!res.ok) {
    const msg =
      (data && (data.error || data.message)) ||
      `Erro HTTP ${res.status} em ${method} ${path}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

function formatDateBR(iso) {
  if (!iso) return "â€”";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "â€”";
  return d.toLocaleDateString("pt-BR");
}

const GerirUsuarios = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");

  // âœ… Workspace do NavBar
  const {
    user,
    corporations: corporationsCtx,
    corporationId,
    setActiveCorporation,
  } = useAuth();

  const corporations = Array.isArray(corporationsCtx) ? corporationsCtx : [];
  const selectedCorpId = String(corporationId ?? "");

  const [usuarios, setUsuarios] = useState([]);
  const [loadingCorps, setLoadingCorps] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // âœ… sÃ³ mostrar corporaÃ§Ãµes onde o usuÃ¡rio Ã© admin/owner
  const [manageableMap, setManageableMap] = useState({}); // { [corpId]: true }
  const [loadingManageable, setLoadingManageable] = useState(true);

  // Drawer/Modal aÃ§Ãµes do usuÃ¡rio
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  // Form ativaÃ§Ã£o
  const [activationToken, setActivationToken] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  // âœ… Modal adicionar membro
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    full_name: "",
    email: "",
    role: "user",
    password: "",
  });
  const [addState, setAddState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const openAddModal = () => {
    setAddState({ loading: false, error: "", success: "" });
    setAddForm({ full_name: "", email: "", role: "user", password: "" });
    setAddOpen(true);
  };

  const closeAddModal = () => {
    if (addState.loading) return;
    setAddOpen(false);
  };

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedUser(null);
    setActivationToken("");
    setActionMsg("");
    setActionLoading(false);
  }, []);

  // corp ativa para owner_id
  const activeCorp = useMemo(() => {
    if (!selectedCorpId) return null;
    return corporations.find((c) => String(c.id) === String(selectedCorpId)) || null;
  }, [corporations, selectedCorpId]);

  // "loadingCorps" (se seu AuthContext tiver status, prefira usar)
  useEffect(() => {
    setLoadingCorps(false);
  }, []);

  // âœ… resolve quais corporaÃ§Ãµes podem ser geridas (admin/owner)
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoadingManageable(true);
      setErrorMsg("");

      const uid = getUserId(user);
      if (!uid || corporations.length === 0) {
        if (!alive) return;
        setManageableMap({});
        setLoadingManageable(false);
        return;
      }

      const checks = await Promise.all(
        corporations.map(async (c) => {
          const cid = String(c.id);

          // owner_id jÃ¡ libera
          if (String(c.owner_id) === uid) return [cid, true];

          // senÃ£o, consulta /members e pega role do usuÃ¡rio
          const res = await listCorporationMembers(cid);
          if (!res?.ok) return [cid, false];

          const members = Array.isArray(res.data) ? res.data : [];
          const me = members.find((m) => String(m.user_id) === uid);

          return [cid, isAdminRole(me?.role)];
        })
      );

      if (!alive) return;

      const map = {};
      for (const [cid, ok] of checks) {
        if (ok) map[cid] = true;
      }

      setManageableMap(map);
      setLoadingManageable(false);
    })();

    return () => {
      alive = false;
    };
  }, [corporations, user]);

  const manageableCorps = useMemo(() => {
    return corporations.filter((c) => manageableMap[String(c.id)]);
  }, [corporations, manageableMap]);

  // âœ… se corp atual nÃ£o Ã© gerenciÃ¡vel, troca para a primeira gerenciÃ¡vel
  useEffect(() => {
    if (loadingManageable) return;
    if (manageableCorps.length === 0) return;

    if (!selectedCorpId || !manageableMap[selectedCorpId]) {
      setActiveCorporation(String(manageableCorps[0].id));
    }
  }, [
    loadingManageable,
    manageableCorps,
    selectedCorpId,
    manageableMap,
    setActiveCorporation,
  ]);

  const canManageThisCorp = useMemo(() => {
    if (!selectedCorpId) return false;
    return Boolean(manageableMap[selectedCorpId]);
  }, [selectedCorpId, manageableMap]);

  const loadMembers = useCallback(async () => {
    if (loadingManageable) return;

    if (!selectedCorpId || !manageableMap[selectedCorpId]) {
      setUsuarios([]);
      setErrorMsg("VocÃª nÃ£o tem permissÃ£o para gerir usuÃ¡rios nesta corporaÃ§Ã£o.");
      return;
    }

    setLoadingMembers(true);
    setErrorMsg("");

    try {
      const res = await listCorporationMembers(selectedCorpId);

      if (!res?.ok) {
        setUsuarios([]);
        setErrorMsg(res?.message || "NÃ£o foi possÃ­vel carregar os usuÃ¡rios desta corporaÃ§Ã£o.");
        return;
      }

      const members = Array.isArray(res.data) ? res.data : [];

      const list = members.map((m) => ({
        id: m.user_id,
        nome: m.full_name || "â€”",
        email: m.email || "â€”",
        perfil: m.role || "user",
        ultimoAcesso: formatDateBR(m.created_at),
        member_status: m.member_status,
        user_status: m.user_status,
      }));

      setUsuarios(list);
    } catch (e) {
      setErrorMsg(
        e?.status === 403
          ? "VocÃª nÃ£o tem permissÃ£o para listar membros desta corporaÃ§Ã£o (apenas administradores)."
          : e?.message || "NÃ£o foi possÃ­vel carregar os usuÃ¡rios desta corporaÃ§Ã£o."
      );
      setUsuarios([]);
    } finally {
      setLoadingMembers(false);
    }
  }, [selectedCorpId, manageableMap, loadingManageable]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const usuariosFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return usuarios;

    return usuarios.filter(
      (u) =>
        String(u.nome || "").toLowerCase().includes(q) ||
        String(u.email || "").toLowerCase().includes(q)
    );
  }, [usuarios, busca]);

  const total = usuarios.length;
  const ativos = useMemo(() => {
    return usuarios.filter(
      (u) => u.member_status === "active" && u.user_status === "active"
    ).length;
  }, [usuarios]);

  const openUserActions = (u) => {
    if (!canManageThisCorp) return;
    setSelectedUser(u);
    setDrawerOpen(true);
    setActionMsg("");
    setActivationToken("");
  };

  // ------------------ AÃ‡Ã•ES ADMIN ------------------

  const onResendActivation = async () => {
    if (!selectedUser?.email) return;
    setActionLoading(true);
    setActionMsg("");

    try {
      await apiRequest(`/users/resend-activation`, {
        method: "POST",
        auth: false,
        body: { email: selectedUser.email },
      });
      setActionMsg("âœ… Token de ativaÃ§Ã£o reenviado com sucesso (verifique o e-mail do usuÃ¡rio).");
    } catch (e) {
      setActionMsg(`âŒ Falha ao reenviar token: ${e?.message || "erro"}`);
    } finally {
      setActionLoading(false);
    }
  };

  const onActivateUser = async () => {
    if (!selectedUser?.email) return;

    const token = activationToken.trim();
    if (!token) {
      setActionMsg("âš ï¸ Informe o token de ativaÃ§Ã£o.");
      return;
    }

    setActionLoading(true);
    setActionMsg("");

    try {
      await apiRequest(`/users/activate`, {
        method: "POST",
        auth: false,
        body: { email: selectedUser.email, token },
      });

      setActionMsg("âœ… UsuÃ¡rio ativado com sucesso.");
      await loadMembers();
    } catch (e) {
      setActionMsg(`âŒ Falha ao ativar: ${e?.message || "erro"}`);
    } finally {
      setActionLoading(false);
    }
  };

  const onSendResetPassword = async () => {
    if (!selectedUser?.email) return;
    setActionLoading(true);
    setActionMsg("");

    try {
      await apiRequest(`/users/forgot-password`, {
        method: "POST",
        auth: false,
        body: { email: selectedUser.email },
      });
      setActionMsg(
        "âœ… SolicitaÃ§Ã£o enviada. Se o usuÃ¡rio existir e estiver ativo, ele receberÃ¡ o e-mail de redefiniÃ§Ã£o."
      );
    } catch (e) {
      setActionMsg(`âŒ Falha ao solicitar redefiniÃ§Ã£o: ${e?.message || "erro"}`);
    } finally {
      setActionLoading(false);
    }
  };

  const onRemoveFromCorporation = () => {
    if (!selectedCorpId || !selectedUser?.id) return;
    setConfirmRemoveOpen(true);
  };

  const confirmRemoveFromCorporation = async () => {
    if (!selectedCorpId || !selectedUser?.id) return;

    setActionLoading(true);
    setActionMsg("");

    try {
      await apiRequest(
        /corporations//members/,
        {
          method: "DELETE",
          auth: true,
        }
      );

      setActionMsg("✅ Usuário removido da corporação.");
      await loadMembers();
      closeDrawer();
    } catch (e) {
      setActionMsg(❌ Falha ao remover: );
    } finally {
      setActionLoading(false);
      setConfirmRemoveOpen(false);
    }
  };
  // âœ… Adicionar membro (POST /corporations/:id/members)
  const onAddMember = async () => {
    if (!selectedCorpId) return;

    const full_name = String(addForm.full_name || "").trim();
    const email = String(addForm.email || "").trim();
    const role = String(addForm.role || "user").toLowerCase();
    const password = String(addForm.password || "").trim();

    setAddState({ loading: true, error: "", success: "" });

    if (!full_name) {
      setAddState({ loading: false, error: "Informe o nome completo.", success: "" });
      return;
    }
    if (!isValidEmail(email)) {
      setAddState({ loading: false, error: "Informe um e-mail vÃ¡lido.", success: "" });
      return;
    }
    if (role !== "user" && role !== "admin") {
      setAddState({ loading: false, error: "Perfil invÃ¡lido.", success: "" });
      return;
    }
    if (password.length < 6) {
      setAddState({
        loading: false,
        error: "A senha deve ter no mÃ­nimo 6 caracteres.",
        success: "",
      });
      return;
    }

    try {
      await apiRequest(`/corporations/${selectedCorpId}/members`, {
        method: "POST",
        auth: true,
        body: { email, full_name, role, password },
      });

      setAddState({ loading: false, error: "", success: "âœ… Membro adicionado com sucesso!" });
      await loadMembers();

      setTimeout(() => {
        setAddOpen(false);
      }, 500);
    } catch (e) {
      setAddState({
        loading: false,
        error: e?.message || "NÃ£o foi possÃ­vel adicionar o membro.",
        success: "",
      });
    }
  };

  return (
    <div className="app">
      <div className="main-content">
        <div className="gerir-usuarios-page">
          <button
            className="btn-secondary"
            style={{ marginBottom: "20px" }}
            onClick={() => navigate(-1)}
          >
            â† Voltar
          </button>
          {/* HEADER */}
          <div className="page-header">
            <div className="header-left">
              <h1 className="page-title">Gerir UsuÃ¡rios</h1>
              <p className="page-subtitle">Gerencie usuÃ¡rios e permissÃµes de acesso</p>

              <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 12, opacity: 0.8 }}>CorporaÃ§Ã£o:</span>

                <select
                  value={selectedCorpId}
                  onChange={(e) => setActiveCorporation(e.target.value)}
                  disabled={loadingManageable || manageableCorps.length === 0}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.06)",
                    color: "inherit",
                    outline: "none",
                  }}
                >
                  {loadingManageable ? (
                    <option value="">Carregando permissÃµes...</option>
                  ) : manageableCorps.length === 0 ? (
                    <option value="">Sem permissÃ£o em nenhuma corporaÃ§Ã£o</option>
                  ) : (
                    manageableCorps.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name} (#{c.id})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="header-right">
              <div className="ativos-count">
                <span className="status-dot ativo"></span>
                <span>
                  {loadingMembers
                    ? "Carregando..."
                    : canManageThisCorp
                      ? `Ativos: ${ativos}/${total}`
                      : "Sem permissÃ£o"}
                </span>
              </div>

              <button
                className="btn-primary"
                disabled={!selectedCorpId || !canManageThisCorp}
                onClick={openAddModal}
              >
                + Adicionar UsuÃ¡rio
              </button>

              <button className="btn-filtros" disabled={!canManageThisCorp}>
                <span className="filtros-icon">â˜°</span>
                Filtros
              </button>
            </div>
          </div>

          {/* ERRO */}
          {errorMsg ? (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 12,
                background: "rgba(255, 0, 0, 0.08)",
                border: "1px solid rgba(255, 0, 0, 0.2)",
              }}
            >
              {errorMsg}
            </div>
          ) : null}

          {/* BUSCA */}
          <div className="search-bar">
            <div className="search-input-wrapper">
              <span className="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-icon lucide-search">
                  <path d="m21 21-4.34-4.34"/>
                  <circle cx="11" cy="11" r="8"/>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Buscar"
                className="search-input"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                disabled={loadingMembers || !canManageThisCorp}
              />
            </div>
          </div>

          {/* TABELA */}
          <div className="table-container">
            <table className="gerir-usuarios-table">
              <thead>
                <tr>
                  <th>UsuÃ¡rio</th>
                  <th>Email</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th>VÃ­nculo</th>
                  <th>Ãšltimo Acesso</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {loadingMembers ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 16, opacity: 0.8 }}>
                      Carregando usuÃ¡rios...
                    </td>
                  </tr>
                ) : !canManageThisCorp ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 16, opacity: 0.8 }}>
                      VocÃª nÃ£o tem permissÃ£o para visualizar os membros desta corporaÃ§Ã£o.
                    </td>
                  </tr>
                ) : usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 16, opacity: 0.8 }}>
                      Nenhum usuÃ¡rio encontrado.
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => openUserActions(u)}
                      style={{ cursor: "pointer" }}
                      title="Clique para aÃ§Ãµes"
                    >
                      <td className="usuario-cell">{u.nome}</td>
                      <td className="email-cell">{u.email}</td>
                      <td>
                        <span className="perfil-badge">{u.perfil}</span>
                      </td>
                      <td>{u.user_status || "â€”"}</td>
                      <td>{u.member_status || "â€”"}</td>
                      <td>{u.ultimoAcesso}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-editar"
                          onClick={() => openUserActions(u)}
                          disabled={!canManageThisCorp}
                        >
                          <span className="editar-icon">âœï¸</span> AÃ§Ãµes
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* âœ… MODAL ADICIONAR MEMBRO */}
          {addOpen ? (
            <div className="gu-modal-backdrop" onClick={closeAddModal}>
              <div className="gu-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="gu-modal-head">
                  <div>
                    <h3 className="gu-modal-title">Adicionar membro</h3>
                    <p className="gu-modal-subtitle">CorporaÃ§Ã£o #{selectedCorpId}</p>
                  </div>

                  <button className="gu-modal-close" onClick={closeAddModal} title="Fechar">
                    âœ•
                  </button>
                </div>

                <div className="gu-modal-body">
                  <div className="gu-field">
                    <label>Nome completo</label>
                    <input
                      value={addForm.full_name}
                      onChange={(e) => setAddForm((s) => ({ ...s, full_name: e.target.value }))}
                      placeholder="Ex: Douglas Mello"
                      disabled={addState.loading}
                    />
                  </div>

                  <div className="gu-field">
                    <label>E-mail</label>
                    <input
                      value={addForm.email}
                      onChange={(e) => setAddForm((s) => ({ ...s, email: e.target.value }))}
                      placeholder="ex: usuario@email.com"
                      disabled={addState.loading}
                    />
                  </div>

                  <div className="gu-modal-grid two">
                    <div className="gu-field">
                      <label>Perfil</label>
                      <select
                        value={addForm.role}
                        onChange={(e) => setAddForm((s) => ({ ...s, role: e.target.value }))}
                        disabled={addState.loading}
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </div>

                    <div className="gu-field">
                      <label>Senha inicial</label>
                      <input
                        type="password"
                        value={addForm.password}
                        onChange={(e) => setAddForm((s) => ({ ...s, password: e.target.value }))}
                        placeholder="mÃ­n. 6 caracteres"
                        disabled={addState.loading}
                      />
                    </div>
                  </div>

                  {addState.error ? (
                    <div className="gu-modal-alert error">{addState.error}</div>
                  ) : null}

                  {addState.success ? (
                    <div className="gu-modal-alert success">{addState.success}</div>
                  ) : null}
                </div>

                <div className="gu-modal-footer">
                  <button className="gu-btn-ghost" onClick={closeAddModal} disabled={addState.loading}>
                    Cancelar
                  </button>

                  <button className="btn-primary" onClick={onAddMember} disabled={addState.loading}>
                    {addState.loading ? "Adicionando..." : "Adicionar"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}


          {/* DRAWER/MODAL DE AÃ‡Ã•ES */}
          {drawerOpen && selectedUser ? (
            <div
              className="user-actions-overlay"
              onClick={closeDrawer}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                justifyContent: "flex-end",
                zIndex: 9999,
              }}
            >
              <div
                className="user-actions-drawer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "420px",
                  maxWidth: "95vw",
                  height: "100%",
                  background: "rgba(15, 15, 18, 0.98)",
                  borderLeft: "1px solid rgba(255,255,255,0.08)",
                  padding: 18,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedUser.nome}</div>
                    <div style={{ opacity: 0.85, marginTop: 4 }}>{selectedUser.email}</div>
                    <div style={{ opacity: 0.75, marginTop: 6, fontSize: 12 }}>
                      Perfil: <b>{selectedUser.perfil}</b> â€¢ Status: <b>{selectedUser.user_status}</b> â€¢ VÃ­nculo:{" "}
                      <b>{selectedUser.member_status}</b>
                    </div>
                  </div>

                  <button
                    onClick={closeDrawer}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "inherit",
                      fontSize: 18,
                      cursor: "pointer",
                      opacity: 0.9,
                    }}
                    title="Fechar"
                  >
                    âœ•
                  </button>
                </div>

                <hr style={{ borderColor: "rgba(255,255,255,0.08)" }} />

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button className="btn-primary" disabled={actionLoading} onClick={onSendResetPassword}>
                    ðŸ” Enviar e-mail de redefiniÃ§Ã£o de senha
                  </button>

                  {selectedUser.user_status === "pending" ? (
                    <>
                      <button className="btn-primary" disabled={actionLoading} onClick={onResendActivation}>
                        âœ‰ï¸ Reenviar token de ativaÃ§Ã£o
                      </button>

                      <div
                        style={{
                          padding: 12,
                          borderRadius: 12,
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: "rgba(255,255,255,0.04)",
                        }}
                      >
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>Ativar usuÃ¡rio (informar token)</div>
                        <input
                          value={activationToken}
                          onChange={(e) => setActivationToken(e.target.value)}
                          placeholder="Token (ex: 123456)"
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: 10,
                            border: "1px solid rgba(255,255,255,0.12)",
                            background: "rgba(255,255,255,0.06)",
                            color: "inherit",
                            outline: "none",
                          }}
                          disabled={actionLoading}
                        />
                        <button
                          className="btn-primary"
                          style={{ marginTop: 10, width: "100%" }}
                          disabled={actionLoading}
                          onClick={onActivateUser}
                        >
                          âœ… Ativar agora
                        </button>
                        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 8 }}>
                          * O token expira em 7 dias. Use â€œReenviar tokenâ€ se necessÃ¡rio.
                        </div>
                      </div>
                    </>
                  ) : null}

                  <button
                    className="btn-danger"
                    disabled={actionLoading}
                    onClick={onRemoveFromCorporation}
                    style={{
                      background: "rgba(255,0,0,0.16)",
                      border: "1px solid rgba(255,0,0,0.25)",
                      color: "inherit",
                      padding: "10px 12px",
                      borderRadius: 12,
                      cursor: "pointer",
                    }}
                  >
                    ðŸ—‘ï¸ Remover usuÃ¡rio da corporaÃ§Ã£o
                  </button>
                </div>

                {actionMsg ? (
                  <div
                    style={{
                      marginTop: 6,
                      padding: 12,
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {actionMsg}
                  </div>
                ) : null}

                <div style={{ marginTop: "auto", opacity: 0.7, fontSize: 12 }}>
                  Dica: clique fora para fechar.
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <ConfirmDialog
          open={confirmRemoveOpen}
          title="Remover usuário"
          message={
            selectedUser
              ? `Tem certeza que deseja remover "${selectedUser.nome}" da corporação #${selectedCorpId}?`
              : "Tem certeza que deseja remover este usuário?"
          }
          confirmText="Remover"
          cancelText="Cancelar"
          onConfirm={confirmRemoveFromCorporation}
          onCancel={() => setConfirmRemoveOpen(false)}
        />
      </div>
    </div>
  );
};

export default GerirUsuarios;

