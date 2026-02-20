import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./GerirUsuarios.css";
import { useLanguage } from "../../context/LanguageContext";
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
  const { t } = useLanguage();
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
      setErrorMsg(t('gerirUsuariosPage.semPermissaoGerir'));
      return;
    }

    setLoadingMembers(true);
    setErrorMsg("");

    try {
      const res = await listCorporationMembers(selectedCorpId);

      if (!res?.ok) {
        setUsuarios([]);
        setErrorMsg(res?.message || t('gerirUsuariosPage.erroCarregar'));
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
          ? t('gerirUsuariosPage.erroPermissao403')
          : e?.message || t('gerirUsuariosPage.erroCarregar')
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
      setActionMsg(t('gerirUsuariosPage.tokenReenviado'));
    } catch (e) {
      setActionMsg(t('gerirUsuariosPage.falhaReenviarToken').replace('{error}', e?.message || 'erro'));
    } finally {
      setActionLoading(false);
    }
  };

  const onActivateUser = async () => {
    if (!selectedUser?.email) return;

    const token = activationToken.trim();
    if (!token) {
      setActionMsg(t('gerirUsuariosPage.informeToken'));
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

      setActionMsg(t('gerirUsuariosPage.usuarioAtivado'));
      await loadMembers();
    } catch (e) {
      setActionMsg(t('gerirUsuariosPage.falhaAtivar').replace('{error}', e?.message || 'erro'));
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
      setActionMsg(t('gerirUsuariosPage.redefinicaoEnviada'));
    } catch (e) {
      setActionMsg(t('gerirUsuariosPage.falhaRedefinicao').replace('{error}', e?.message || 'erro'));
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

      setActionMsg(t('gerirUsuariosPage.usuarioRemovido'));
      await loadMembers();
      closeDrawer();
    } catch (e) {
      setActionMsg(t('gerirUsuariosPage.falhaRemover').replace('{error}', e?.message || 'erro'));
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
      setAddState({ loading: false, error: t('gerirUsuariosPage.informeNome'), success: "" });
      return;
    }
    if (!isValidEmail(email)) {
      setAddState({ loading: false, error: t('gerirUsuariosPage.informeEmail'), success: "" });
      return;
    }
    if (role !== "user" && role !== "admin") {
      setAddState({ loading: false, error: t('gerirUsuariosPage.perfilInvalido'), success: "" });
      return;
    }
    if (password.length < 6) {
      setAddState({
        loading: false,
        error: t('gerirUsuariosPage.senhaMinima'),
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

      setAddState({ loading: false, error: "", success: t('gerirUsuariosPage.membroAdicionado') });
      await loadMembers();

      setTimeout(() => {
        setAddOpen(false);
      }, 500);
    } catch (e) {
      setAddState({
        loading: false,
        error: e?.message || t('gerirUsuariosPage.erroAdicionar'),
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
            {t('gerirUsuariosPage.voltar')}
          </button>
          {/* HEADER */}
          <div className="page-header">
            <div className="header-left">
              <h1 className="page-title">{t('gerirUsuariosPage.title')}</h1>
              <p className="page-subtitle">{t('gerirUsuariosPage.subtitle')}</p>

              <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 12, opacity: 0.8 }}>{t('gerirUsuariosPage.corporacao')}</span>

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
                    <option value="">{t('gerirUsuariosPage.carregandoPermissoes')}</option>
                  ) : manageableCorps.length === 0 ? (
                    <option value="">{t('gerirUsuariosPage.semPermissao')}</option>
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
                    ? t('gerirUsuariosPage.carregando')
                    : canManageThisCorp
                      ? t('gerirUsuariosPage.ativosCount').replace('{active}', ativos).replace('{total}', total)
                      : t('gerirUsuariosPage.semPermissaoLabel')}
                </span>
              </div>

              <button
                className="btn-primary"
                disabled={!selectedCorpId || !canManageThisCorp}
                onClick={openAddModal}
              >
                {t('gerirUsuariosPage.adicionarUsuario')}
              </button>

              <button className="btn-filtros" disabled={!canManageThisCorp}>
                <span className="filtros-icon">☰</span>
                {t('gerirUsuariosPage.filtros')}
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
                  <path d="m21 21-4.34-4.34" />
                  <circle cx="11" cy="11" r="8" />
                </svg>
              </span>
              <input
                type="text"
                placeholder={t('gerirUsuariosPage.buscar')}
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
                  <th>{t('gerirUsuariosPage.usuario')}</th>
                  <th>{t('gerirUsuariosPage.email')}</th>
                  <th>{t('gerirUsuariosPage.perfil')}</th>
                  <th>{t('gerirUsuariosPage.status')}</th>
                  <th>{t('gerirUsuariosPage.vinculo')}</th>
                  <th>{t('gerirUsuariosPage.ultimoAcesso')}</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {loadingMembers ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 16, opacity: 0.8 }}>
                      {t('gerirUsuariosPage.carregandoUsuarios')}
                    </td>
                  </tr>
                ) : !canManageThisCorp ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 16, opacity: 0.8 }}>
                      {t('gerirUsuariosPage.semPermissaoVer')}
                    </td>
                  </tr>
                ) : usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 16, opacity: 0.8 }}>
                      {t('gerirUsuariosPage.nenhumUsuario')}
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => openUserActions(u)}
                      style={{ cursor: "pointer" }}
                      title={t('gerirUsuariosPage.cliqueAcoes')}
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
                          <span className="editar-icon">✏️</span> {t('gerirUsuariosPage.acoes')}
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
                    <h3 className="gu-modal-title">{t('gerirUsuariosPage.adicionarMembro')}</h3>
                    <p className="gu-modal-subtitle">{t('gerirUsuariosPage.corpId').replace('{id}', selectedCorpId)}</p>
                  </div>

                  <button className="gu-modal-close" onClick={closeAddModal} title={t('gerirUsuariosPage.fechar')}>
                    ✕
                  </button>
                </div>

                <div className="gu-modal-body">
                  <div className="gu-field">
                    <label>{t('gerirUsuariosPage.nomeCompleto')}</label>
                    <input
                      value={addForm.full_name}
                      onChange={(e) => setAddForm((s) => ({ ...s, full_name: e.target.value }))}
                      placeholder={t('gerirUsuariosPage.nomePlaceholder')}
                      disabled={addState.loading}
                    />
                  </div>

                  <div className="gu-field">
                    <label>{t('gerirUsuariosPage.emailLabel')}</label>
                    <input
                      value={addForm.email}
                      onChange={(e) => setAddForm((s) => ({ ...s, email: e.target.value }))}
                      placeholder={t('gerirUsuariosPage.emailPlaceholder')}
                      disabled={addState.loading}
                    />
                  </div>

                  <div className="gu-modal-grid two">
                    <div className="gu-field">
                      <label>{t('gerirUsuariosPage.perfilLabel')}</label>
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
                      <label>{t('gerirUsuariosPage.senhaInicial')}</label>
                      <input
                        type="password"
                        value={addForm.password}
                        onChange={(e) => setAddForm((s) => ({ ...s, password: e.target.value }))}
                        placeholder={t('gerirUsuariosPage.senhaPlaceholder')}
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
                    {t('gerirUsuariosPage.cancelar')}
                  </button>

                  <button className="btn-primary" onClick={onAddMember} disabled={addState.loading}>
                    {addState.loading ? t('gerirUsuariosPage.adicionando') : t('gerirUsuariosPage.adicionar')}
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
                      {t('gerirUsuariosPage.perfilInfo')} <b>{selectedUser.perfil}</b> • {t('gerirUsuariosPage.statusInfo')} <b>{selectedUser.user_status}</b> • {t('gerirUsuariosPage.vinculoInfo')}{" "}
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
                    title={t('gerirUsuariosPage.fechar')}
                  >
                    ✕
                  </button>
                </div>

                <hr style={{ borderColor: "rgba(255,255,255,0.08)" }} />

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button className="btn-primary" disabled={actionLoading} onClick={onSendResetPassword}>
                    {t('gerirUsuariosPage.enviarRedefinicao')}
                  </button>

                  {selectedUser.user_status === "pending" ? (
                    <>
                      <button className="btn-primary" disabled={actionLoading} onClick={onResendActivation}>
                        {t('gerirUsuariosPage.reenviarToken')}
                      </button>

                      <div
                        style={{
                          padding: 12,
                          borderRadius: 12,
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: "rgba(255,255,255,0.04)",
                        }}
                      >
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>{t('gerirUsuariosPage.ativarUsuario')}</div>
                        <input
                          value={activationToken}
                          onChange={(e) => setActivationToken(e.target.value)}
                          placeholder={t('gerirUsuariosPage.tokenPlaceholder')}
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
                          {t('gerirUsuariosPage.ativar')}
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
                    {t('gerirUsuariosPage.removerCorporacao')}
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
          title={t('gerirUsuariosPage.confirmarRemocao')}
          message={
            selectedUser
              ? t('gerirUsuariosPage.confirmarRemocaoMsg').replace('{name}', selectedUser.nome).replace('{id}', selectedCorpId)
              : t('gerirUsuariosPage.confirmarRemocaoMsg')
          }
          confirmText={t('gerirUsuariosPage.remover')}
          cancelText={t('gerirUsuariosPage.cancelar')}
          onConfirm={confirmRemoveFromCorporation}
          onCancel={() => setConfirmRemoveOpen(false)}
        />
      </div>
    </div>
  );
};

export default GerirUsuarios;



