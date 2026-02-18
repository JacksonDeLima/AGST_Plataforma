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
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

const GerirUsuarios = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");

  // ✅ Workspace do NavBar
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

  // ✅ só mostrar corporações onde o usuário é admin/owner
  const [manageableMap, setManageableMap] = useState({}); // { [corpId]: true }
  const [loadingManageable, setLoadingManageable] = useState(true);

  // Drawer/Modal ações do usuário
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  // Form ativação
  const [activationToken, setActivationToken] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  // ✅ Modal adicionar membro
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

  // ✅ resolve quais corporações podem ser geridas (admin/owner)
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

          // owner_id já libera
          if (String(c.owner_id) === uid) return [cid, true];

          // senão, consulta /members e pega role do usuário
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

  // ✅ se corp atual não é gerenciável, troca para a primeira gerenciável
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
      setErrorMsg("Você não tem permissão para gerir usuários nesta corporação.");
      return;
    }

    setLoadingMembers(true);
    setErrorMsg("");

    try {
      const res = await listCorporationMembers(selectedCorpId);

      if (!res?.ok) {
        setUsuarios([]);
        setErrorMsg(res?.message || "Não foi possível carregar os usuários desta corporação.");
        return;
      }

      const members = Array.isArray(res.data) ? res.data : [];

      const list = members.map((m) => ({
        id: m.user_id,
        nome: m.full_name || "—",
        email: m.email || "—",
        perfil: m.role || "user",
        ultimoAcesso: formatDateBR(m.created_at),
        member_status: m.member_status,
        user_status: m.user_status,
      }));

      setUsuarios(list);
    } catch (e) {
      setErrorMsg(
        e?.status === 403
          ? "Você não tem permissão para listar membros desta corporação (apenas administradores)."
          : e?.message || "Não foi possível carregar os usuários desta corporação."
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

  // ------------------ AÇÕES ADMIN ------------------

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
      setActionMsg("✅ Token de ativação reenviado com sucesso (verifique o e-mail do usuário).");
    } catch (e) {
      setActionMsg(`❌ Falha ao reenviar token: ${e?.message || "erro"}`);
    } finally {
      setActionLoading(false);
    }
  };

  const onActivateUser = async () => {
    if (!selectedUser?.email) return;

    const token = activationToken.trim();
    if (!token) {
      setActionMsg("⚠️ Informe o token de ativação.");
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

      setActionMsg("✅ Usuário ativado com sucesso.");
      await loadMembers();
    } catch (e) {
      setActionMsg(`❌ Falha ao ativar: ${e?.message || "erro"}`);
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
        "✅ Solicitação enviada. Se o usuário existir e estiver ativo, ele receberá o e-mail de redefinição."
      );
    } catch (e) {
      setActionMsg(`❌ Falha ao solicitar redefinição: ${e?.message || "erro"}`);
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
        `/corporations/${selectedCorpId}/members/${selectedUser.id}`,
        {
          method: "DELETE",
          auth: true,
        }
      );

      setActionMsg("✅ Usuário removido da corporação.");
      await loadMembers();
      closeDrawer();
    } catch (e) {
      setActionMsg(`❌ Falha ao remover: ${e?.message || "erro"}`);
    } finally {
      setActionLoading(false);
      setConfirmRemoveOpen(false);
    }
  };
  // Adicionar membro (POST /corporations/:id/members)
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
      setAddState({ loading: false, error: "Informe um e-mail válido.", success: "" });
      return;
    }
    if (role !== "user" && role !== "admin") {
      setAddState({ loading: false, error: "Perfil inválido.", success: "" });
      return;
    }
    if (password.length < 6) {
      setAddState({
        loading: false,
        error: "A senha deve ter no mínimo 6 caracteres.",
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

      setAddState({ loading: false, error: "", success: "✅ Membro adicionado com sucesso!" });
      await loadMembers();

      setTimeout(() => {
        setAddOpen(false);
      }, 500);
    } catch (e) {
      setAddState({
        loading: false,
        error: e?.message || "Não foi possível adicionar o membro.",
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
            ← Voltar
          </button>
          {/* HEADER */}
          <div className="page-header">
            <div className="header-left">
              <h1 className="page-title">Gerir Usuários</h1>
              <p className="page-subtitle">Gerencie usuários e permissões de acesso</p>

              <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 12, opacity: 0.8 }}>Corporação:</span>

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
                    <option value="">Carregando permissões...</option>
                  ) : manageableCorps.length === 0 ? (
                    <option value="">Sem permissão em nenhuma corporação</option>
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
                      : "Sem permissão"}
                </span>
              </div>

              <button
                className="btn-primary"
                disabled={!selectedCorpId || !canManageThisCorp}
                onClick={openAddModal}
              >
                + Adicionar Usuário
              </button>

              <button className="btn-filtros" disabled={!canManageThisCorp}>
                <span className="filtros-icon">☰</span>
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
                  <th>Usuário</th>
                  <th>Email</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th>Vínculo</th>
                  <th>Último Acesso</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {loadingMembers ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 16, opacity: 0.8 }}>
                      Carregando usuários...
                    </td>
                  </tr>
                ) : !canManageThisCorp ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 16, opacity: 0.8 }}>
                      Você não tem permissão para visualizar os membros desta corporação.
                    </td>
                  </tr>
                ) : usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 16, opacity: 0.8 }}>
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => openUserActions(u)}
                      style={{ cursor: "pointer" }}
                      title="Clique para ações"
                    >
                      <td className="usuario-cell">{u.nome}</td>
                      <td className="email-cell">{u.email}</td>
                      <td>
                        <span className="perfil-badge">{u.perfil}</span>
                      </td>
                      <td>{u.user_status || "—"}</td>
                      <td>{u.member_status || "—"}</td>
                      <td>{u.ultimoAcesso}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-editar"
                          onClick={() => openUserActions(u)}
                          disabled={!canManageThisCorp}
                        >
                          <span className="editar-icon">✏️</span> Ações
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ✅ MODAL ADICIONAR MEMBRO */}
          {addOpen ? (
            <div className="gu-modal-backdrop" onClick={closeAddModal}>
              <div className="gu-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="gu-modal-head">
                  <div>
                    <h3 className="gu-modal-title">Adicionar membro</h3>
                    <p className="gu-modal-subtitle">Corporação #{selectedCorpId}</p>
                  </div>

                  <button className="gu-modal-close" onClick={closeAddModal} title="Fechar">
                    ✕
                  </button>
                </div>

                <div className="gu-modal-body">
                  <div className="gu-field">
                    <label>Nome completo</label>
                    <input
                      value={addForm.full_name}
                      onChange={(e) => setAddForm((s) => ({ ...s, full_name: e.target.value }))}
                      placeholder="Nome completo"
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
                        placeholder="mín. 6 caracteres"
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


          {/* DRAWER/MODAL DE AÇÕES */}
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
                      Perfil: <b>{selectedUser.perfil}</b> • Status: <b>{selectedUser.user_status}</b> • Vínculo:{" "}
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
                    ✕
                  </button>
                </div>

                <hr style={{ borderColor: "rgba(255,255,255,0.08)" }} />

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button className="btn-primary" disabled={actionLoading} onClick={onSendResetPassword}>
                    🔐 Enviar e-mail de redefinição de senha
                  </button>

                  {selectedUser.user_status === "pending" ? (
                    <>
                      <button className="btn-primary" disabled={actionLoading} onClick={onResendActivation}>
                        ✉️ Reenviar token de ativação
                      </button>

                      <div
                        style={{
                          padding: 12,
                          borderRadius: 12,
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: "rgba(255,255,255,0.04)",
                        }}
                      >
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>Ativar usuário (informar token)</div>
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
                          ✅ Ativar agora
                        </button>
                        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 8 }}>
                          * O token expira em 7 dias. Use “Reenviar token” se necessário.
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
                    🗑️ Remover usuário da corporação
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



