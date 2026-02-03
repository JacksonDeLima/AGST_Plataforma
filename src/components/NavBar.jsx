// src/components/NavBar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  MapPin,
  Package,
  Snowflake,
  BarChart3,
  Users,
  Siren,
  Settings,
  UserCircle2,
  Loader2,
  LogOut,
  KeyRound,
  UserCog,
  Trash2,
  Mail,
} from "lucide-react";
import "./NavBar.css";

import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import {
  createCorporation,
  listCorporationMembers,
} from "../services/corporationsService";

// âœ… Logo (ajuste o caminho se necessÃ¡rio)
import AppLogo from "../assets/logo.svg";

// âœ… User endpoints
import {
  forgotPassword,
  updateMe,
  changeMyPassword,
  deleteMe,
} from "../services/usersService";

/** ===== Helpers CNPJ ===== */
function onlyDigits(s = "") {
  return String(s).replace(/\D/g, "");
}

function formatCNPJ(value = "") {
  const v = onlyDigits(value).slice(0, 14);
  const p1 = v.slice(0, 2);
  const p2 = v.slice(2, 5);
  const p3 = v.slice(5, 8);
  const p4 = v.slice(8, 12);
  const p5 = v.slice(12, 14);
  let out = p1;
  if (p2) out += `.${p2}`;
  if (p3) out += `.${p3}`;
  if (p4) out += `/${p4}`;
  if (p5) out += `-${p5}`;
  return out;
}

function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || "C";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase();
}

/** ===== Helpers Role ===== */
function getUserId(user) {
  return String(user?.id ?? user?.user_id ?? user?.uid ?? "");
}

function isAdminRole(role) {
  const r = String(role || "").toLowerCase();
  return r === "admin" || r === "owner" || r === "super_admin";
}

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    status,
    user,
    corporations,
    corporationId,
    setActiveCorporation,
    bootstrap,
    logout, // (se existir no seu AuthContext)
  } = useAuth();

  const loadingCorps = status === "loading";
  const [wsOpen, setWsOpen] = useState(false);
  const [showAddCorp, setShowAddCorp] = useState(false);

  const { t } = useLanguage();

  const [createState, setCreateState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const [newCorp, setNewCorp] = useState({ name: "", tax_id: "" });

  const wsRef = useRef(null);

  // âœ… corp ativa (vem do /corporations, sem role)
  const activeCorp = useMemo(() => {
    const cid = String(corporationId ?? "");
    return (
      corporations?.find((c) => String(c.id) === cid) ||
      corporations?.[0] ||
      null
    );
  }, [corporations, corporationId]);

  // âœ… cache de roles por corp: { [corpId]: "admin" | "user" | ... }
  const [corpRoles, setCorpRoles] = useState({});
  const [roleLoading, setRoleLoading] = useState(false);

  // âœ… resolve role do usuÃ¡rio na corp ativa
  useEffect(() => {
    const cid = String(corporationId ?? "");
    const uid = getUserId(user);

    if (!cid || !uid) return;

    // 1) cache jÃ¡ tem role
    if (corpRoles[cid] !== undefined) return;

    // 2) se Ã© owner_id da corp ativa, jÃ¡ libera sem bater em /members
    if (String(activeCorp?.owner_id) === uid) {
      setCorpRoles((prev) => ({ ...prev, [cid]: "owner" }));
      return;
    }

    // 3) buscar role via /members
    (async () => {
      setRoleLoading(true);
      try {
        const res = await listCorporationMembers(cid);

        if (!res?.ok) {
          // cacheia como null pra nÃ£o ficar chamando infinito
          setCorpRoles((prev) => ({ ...prev, [cid]: null }));
          return;
        }

        const members = Array.isArray(res.data) ? res.data : [];
        const me = members.find((m) => String(m.user_id) === uid);

        const role = me?.role ?? null;
        setCorpRoles((prev) => ({ ...prev, [cid]: role }));
      } catch (e) {
        setCorpRoles((prev) => ({ ...prev, [cid]: null }));
      } finally {
        setRoleLoading(false);
      }
    })();
  }, [corporationId, user, activeCorp?.owner_id, corpRoles]);

  const activeRole = corpRoles[String(corporationId ?? "")];

  // âœ… Pode gerir usuÃ¡rios se:
  // - role == admin/owner/super_admin (vem do /members)
  // - OU Ã© owner_id (vem do /corporations)
  const canManageUsers = useMemo(() => {
    const uid = getUserId(user);
    const isOwner = uid && String(activeCorp?.owner_id) === uid;
    return isOwner || isAdminRole(activeRole);
  }, [user, activeCorp?.owner_id, activeRole]);

  // Fechar dropdown workspace clicando fora
  useEffect(() => {
    function handleOutside(e) {
      if (!wsRef.current) return;
      if (!wsRef.current.contains(e.target)) setWsOpen(false);
    }
    if (wsOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [wsOpen]);

  function isActive(path) {
    return location.pathname === path;
  }

  // âœ… Seleciona corp (sem navegar)
  const handleSelectCorp = async (id) => {
    const nextId = String(id);
    setWsOpen(false);

    if (String(corporationId) === nextId) {
      navigate("/ambientes", { replace: true });
      return;
    }

    await setActiveCorporation(nextId);

    navigate("/ambientes", {
      replace: true,
      state: { fromWorkspaceSwitch: true, corporationId: nextId },
    });
  };

  const handleOpenAdd = () => {
    setWsOpen(false);
    setCreateState({ loading: false, error: "", success: "" });
    setNewCorp({ name: "", tax_id: "" });
    setShowAddCorp(true);
  };

  const handleCloseAdd = () => {
    if (createState.loading) return;
    setShowAddCorp(false);
    setCreateState({ loading: false, error: "", success: "" });
    setNewCorp({ name: "", tax_id: "" });
  };

  const handleCreateCorp = async () => {
    const name = newCorp.name.trim();
    const taxDigits = onlyDigits(newCorp.tax_id);

    if (!name) {
      setCreateState({
        loading: false,
        error: "Informe o nome fantasia.",
        success: "",
      });
      return;
    }
    if (taxDigits.length !== 14) {
      setCreateState({
        loading: false,
        error: "CNPJ deve conter 14 dÃ­gitos.",
        success: "",
      });
      return;
    }

    setCreateState({ loading: true, error: "", success: "" });

    const res = await createCorporation({ name, tax_id: taxDigits });
    if (!res.ok) {
      setCreateState({
        loading: false,
        error: res.message || "Erro ao criar corporaÃ§Ã£o.",
        success: "",
      });
      return;
    }

    const createdId = String(res.data?.id || "");
    if (createdId) {
      await setActiveCorporation(createdId);
      await bootstrap();

      setCreateState({
        loading: false,
        error: "",
        success: "âœ… CorporaÃ§Ã£o criada com sucesso!",
      });
      setShowAddCorp(false);

      navigate(location.pathname, { replace: true });
      return;
    }

    setCreateState({
      loading: false,
      error: "",
      success: "âœ… CorporaÃ§Ã£o criada com sucesso!",
    });
    setShowAddCorp(false);
  };

  const userName = user?.full_name || user?.name || user?.email || "UsuÃ¡rio";

  // =========================
  // ===== Menu do usuÃ¡rio ===
  // =========================
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const [modalForgot, setModalForgot] = useState(false);
  const [modalProfile, setModalProfile] = useState(false);
  const [modalChangePass, setModalChangePass] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);

  const [uiMsg, setUiMsg] = useState({ type: "", text: "" });

  const [forgotEmail, setForgotEmail] = useState(user?.email || "");
  const [profileName, setProfileName] = useState(
    user?.full_name || user?.name || ""
  );
  const [passForm, setPassForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [deletePass, setDeletePass] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  // manter valores sync com user
  useEffect(() => {
    setForgotEmail(user?.email || "");
    setProfileName(user?.full_name || user?.name || "");
  }, [user?.email, user?.full_name, user?.name]);

  function openModal(kind) {
    setUiMsg({ type: "", text: "" });
    setUserMenuOpen(false);

    if (kind === "forgot") {
      setForgotEmail(user?.email || "");
      setModalForgot(true);
    }
    if (kind === "profile") {
      setProfileName(user?.full_name || user?.name || "");
      setModalProfile(true);
    }
    if (kind === "changePass") {
      setPassForm({ current: "", next: "", confirm: "" });
      setModalChangePass(true);
    }
    if (kind === "delete") {
      setDeletePass("");
      setModalDelete(true);
    }
  }

  function closeAllModals() {
    if (actionLoading) return;
    setModalForgot(false);
    setModalProfile(false);
    setModalChangePass(false);
    setModalDelete(false);
    setUiMsg({ type: "", text: "" });
  }

  // Fechar menu user clicando fora
  useEffect(() => {
    function handleOutside(e) {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    }
    if (userMenuOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [userMenuOpen]);

  async function handleForgotPassword() {
    const email = String(forgotEmail || "").trim();
    if (!email) {
      setUiMsg({ type: "error", text: "Informe um e-mail." });
      return;
    }

    setActionLoading(true);
    setUiMsg({ type: "", text: "" });
    try {
      const res = await forgotPassword(email);

      // resposta genÃ©rica (nÃ£o revelar se existe)
      if (!res.ok) {
        setUiMsg({
          type: "success",
          text: "Se o e-mail existir, um link serÃ¡ enviado.",
        });
      } else {
        setUiMsg({
          type: "success",
          text: "Se o e-mail existir, um link serÃ¡ enviado.",
        });
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpdateProfile() {
    const full_name = String(profileName || "").trim();
    if (!full_name) {
      setUiMsg({ type: "error", text: "Informe seu nome." });
      return;
    }

    setActionLoading(true);
    setUiMsg({ type: "", text: "" });
    try {
      const res = await updateMe({ full_name });
      if (!res.ok) {
        setUiMsg({
          type: "error",
          text: res.message || "Falha ao atualizar perfil.",
        });
        return;
      }

      setUiMsg({ type: "success", text: "Perfil atualizado!" });

      // âœ… atualiza contexto
      await bootstrap();
      closeAllModals();
    } finally {
      setActionLoading(false);
    }
  }

  function isStrongPass(p) {
    const s = String(p || "");
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(s);
  }

  async function handleChangePassword() {
    const current = passForm.current;
    const next = passForm.next;
    const confirm = passForm.confirm;

    if (!current || !next || !confirm) {
      setUiMsg({ type: "error", text: "Preencha todos os campos." });
      return;
    }
    if (next !== confirm) {
      setUiMsg({ type: "error", text: "As novas senhas nÃ£o conferem." });
      return;
    }
    if (!isStrongPass(next)) {
      setUiMsg({
        type: "error",
        text:
          "Nova senha fraca. Use 8+ caracteres com maiÃºscula, minÃºscula, nÃºmero e especial.",
      });
      return;
    }

    setActionLoading(true);
    setUiMsg({ type: "", text: "" });
    try {
      const res = await changeMyPassword({
        password: current,
        new_password: next,
      });
      if (!res.ok) {
        setUiMsg({
          type: "error",
          text: res.message || "Falha ao alterar senha.",
        });
        return;
      }
      setUiMsg({ type: "success", text: "Senha alterada com sucesso!" });
      closeAllModals();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteUser() {
    const pass = String(deletePass || "");
    if (!pass) {
      setUiMsg({ type: "error", text: "Informe sua senha atual." });
      return;
    }

    setActionLoading(true);
    setUiMsg({ type: "", text: "" });
    try {
      const res = await deleteMe(pass);
      if (!res.ok) {
        setUiMsg({
          type: "error",
          text: res.message || "NÃ£o foi possÃ­vel excluir a conta.",
        });
        return;
      }

      // logout local + redirect
      if (typeof logout === "function") {
        await logout();
      } else {
        try {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        } catch { }
      }

      navigate("/login", { replace: true });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleLogout() {
    setUserMenuOpen(false);

    if (typeof logout === "function") {
      await logout();
    } else {
      try {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      } catch { }
    }

    navigate("/login", { replace: true });
  }

  return (
    <aside className="navbar">
      {/* âœ… Brand com logo */}
      <Link to="/ambientes" className="brand" aria-label="Ir para o Dashboard">
        <img src={AppLogo} alt="Logo" className="brand-logo" />

      </Link>

      {/* Workspace / CorporaÃ§Ã£o */}
      <div className="workspace" ref={wsRef}>
        <div className="workspace-label">{t('nav.workspace')}</div>

        <button
          type="button"
          className="workspace-btn"
          onClick={() => setWsOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={wsOpen}
          disabled={loadingCorps}
        >
          <span className="workspace-avatar">
            {loadingCorps ? (
              <Loader2 size={16} className="spin" />
            ) : (
              initials(activeCorp?.name)
            )}
          </span>

          <span className="workspace-meta">
            <span className="workspace-name" title={activeCorp?.name}>
              {loadingCorps
                ? t('nav.carregando')
                : activeCorp?.name || "Sem corporaÃ§Ã£o"}
            </span>
            <span className="workspace-hint">
              {loadingCorps
                ? t('nav.aguarde')
                : roleLoading
                  ? t('nav.carregandoPermissoes')
                  : t('nav.trocarCorporacao')}
            </span>
          </span>

          <ChevronDown
            className={`workspace-caret ${wsOpen ? "open" : ""}`}
            size={18}
          />
        </button>

        {wsOpen && (
          <div
            className="workspace-menu"
            role="menu"
            aria-label="Selecionar corporaÃ§Ã£o"
          >
            <div className="workspace-menu-head">
              <span>{t('nav.minhasCorporacoes')}</span>
              <button
                type="button"
                className="workspace-add"
                onClick={handleOpenAdd}
              >
                {t('nav.adicionar')}
              </button>
            </div>

            <div className="workspace-list">
              {!corporations || corporations.length === 0 ? (
                <div className="muted small" style={{ padding: 8 }}>
                  {t('nav.nenhumaCorporacao')}
                </div>
              ) : (
                corporations.map((c) => {
                  const selected = String(c.id) === String(corporationId);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="menuitem"
                      className={`workspace-item ${selected ? "selected" : ""
                        }`}
                      onClick={() => handleSelectCorp(c.id)}
                    >
                      <span className="workspace-item-avatar">
                        {initials(c.name)}
                      </span>
                      <span className="workspace-item-name" title={c.name}>
                        {c.name}
                      </span>
                      {selected && (
                        <span className="workspace-item-check">âœ“</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      <nav className="nav">
        <Link
          to="/ambientes"
          className={`nav-item ${isActive("/ambientes") ? "active" : ""}`}
        >
          <span className="nav-ico">
            <MapPin size={18} />
          </span>
          {t('nav.ambientes')}
        </Link>

        <Link
          to="/equipamentos"
          className={`nav-item ${isActive("/equipamentos") ? "active" : ""}`}
        >
          <span className="nav-ico">
            <Package size={18} />
          </span>
          {t('nav.equipamentos')}
        </Link>

        <Link
          to="/automacoes"
          className={`nav-item ${isActive("/automacoes") ? "active" : ""}`}
        >
          <span className="nav-ico">
            <Snowflake size={18} />
          </span>
          {t('nav.automacoes')}
        </Link>

        <Link
          to="/relatorios"
          className={`nav-item ${isActive("/relatorios") ? "active" : ""}`}
        >
          <span className="nav-ico">
            <BarChart3 size={18} />
          </span>
          {t('nav.relatorios')}
        </Link>

        {/* âœ… Agora funciona: owner_id OU role admin vindo do /members */}
        {canManageUsers && (
          <Link
            to="/gerir-usuarios"
            className={`nav-item ${isActive("/gerir-usuarios") ? "active" : ""
              }`}
          >
            <span className="nav-ico">
              <Users size={18} />
            </span>
            {t('nav.usuarios')}
          </Link>
        )}

        <Link
          to="/alarmes"
          className={`nav-item ${isActive("/alarmes") ? "active" : ""}`}
        >
          <span className="nav-ico">
            <Siren size={18} />
          </span>
          {t('nav.alarmes')}
        </Link>

        <Link
          to="/configuracoes"
          className={`nav-item ${isActive("/configuracoes") ? "active" : ""
            }`}
        >
          <span className="nav-ico">
            <Settings size={18} />
          </span>
          {t('nav.configuracoes')}
        </Link>
      </nav>

      {/* =======================
          ===== User menu =======
          ======================= */}
      <div className="user-area" ref={userMenuRef}>
        <button
          type="button"
          className="user-section"
          title={user?.email || ""}
          onClick={() => setUserMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={userMenuOpen}
        >
          <div className="user-avatar">
            <UserCircle2 size={22} />
          </div>
          <span className="user-name">{userName}</span>
          <ChevronDown
            size={18}
            className={`user-caret ${userMenuOpen ? "open" : ""}`}
          />
        </button>

        {userMenuOpen && (
          <div className="user-menu" role="menu" aria-label="Menu do usuÃ¡rio">
            <button
              className="user-menu-item"
              role="menuitem"
              onClick={() => openModal("forgot")}
            >
              <Mail size={16} /> {t('userMenu.solicitarRedefinicao')}
            </button>

            <button
              className="user-menu-item"
              role="menuitem"
              onClick={() => openModal("profile")}
            >
              <UserCog size={16} /> {t('userMenu.atualizarPerfil')}
            </button>

            <button
              className="user-menu-item"
              role="menuitem"
              onClick={() => openModal("changePass")}
            >
              <KeyRound size={16} /> {t('userMenu.alterarSenha')}
            </button>

            <button
              className="user-menu-item danger"
              role="menuitem"
              onClick={() => openModal("delete")}
            >
              <Trash2 size={16} /> {t('userMenu.excluirUsuario')}
            </button>

            <div className="user-menu-sep" />

            <button
              className="user-menu-item"
              role="menuitem"
              onClick={handleLogout}
            >
              <LogOut size={16} /> {t('userMenu.sair')}
            </button>
          </div>
        )}
      </div>

      {/* ============================
          ===== Modal Criar Corp =====
          ============================ */}
      {showAddCorp && (
        <div
          className="ws-modal-overlay"
          onClick={handleCloseAdd}
          role="dialog"
          aria-modal="true"
        >
          <div className="ws-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ws-modal-head">
              <div>
                <h3>Criar corporaÃ§Ã£o</h3>
                <p>
                  Ao criar, vocÃª vira owner automaticamente (API define owner_id).
                </p>
              </div>
              <button
                type="button"
                className="ws-modal-close"
                onClick={handleCloseAdd}
                aria-label="Fechar"
              >
                âœ•
              </button>
            </div>

            <div className="ws-modal-body">
              <div className="ws-field">
                <label>Nome fantasia</label>
                <input
                  value={newCorp.name}
                  onChange={(e) =>
                    setNewCorp((s) => ({ ...s, name: e.target.value }))
                  }
                  placeholder="Ex: Tech Solutions Ltda."
                  autoFocus
                />
              </div>

              <div className="ws-field">
                <label>CNPJ</label>
                <input
                  value={formatCNPJ(newCorp.tax_id)}
                  onChange={(e) =>
                    setNewCorp((s) => ({ ...s, tax_id: e.target.value }))
                  }
                  placeholder="12.345.678/0001-90"
                  inputMode="numeric"
                />
              </div>

              {createState.error ? (
                <div className="ws-error">{createState.error}</div>
              ) : null}
              {createState.success ? (
                <div className="ws-success">{createState.success}</div>
              ) : null}
            </div>

            <div className="ws-modal-footer">
              <button
                type="button"
                className="btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCreateCorp();
                }}
                disabled={createState.loading}
              >
                {createState.loading ? "Criando..." : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================
          ===== Modais do usuÃ¡rio ====
          ============================ */}
      {(modalForgot || modalProfile || modalChangePass || modalDelete) && (
        <div
          className="ws-modal-overlay"
          onClick={closeAllModals}
          role="dialog"
          aria-modal="true"
        >
          <div className="ws-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ws-modal-head">
              <div>
                <h3>
                  {modalForgot && "Solicitar redefiniÃ§Ã£o de senha"}
                  {modalProfile && "Atualizar perfil"}
                  {modalChangePass && "Alterar senha"}
                  {modalDelete && "Excluir usuÃ¡rio"}
                </h3>

                {modalDelete ? (
                  <p>Esta aÃ§Ã£o Ã© irreversÃ­vel. Confirme com sua senha atual.</p>
                ) : modalForgot ? (
                  <p>Enviaremos um link se o e-mail existir e estiver ativo.</p>
                ) : null}
              </div>

              <button
                type="button"
                className="ws-modal-close"
                onClick={closeAllModals}
                aria-label="Fechar"
                disabled={actionLoading}
              >
                âœ•
              </button>
            </div>

            <div className="ws-modal-body">
              {modalForgot && (
                <div className="ws-field">
                  <label>E-mail</label>
                  <input
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="seu@email.com"
                    inputMode="email"
                    autoFocus
                  />
                </div>
              )}

              {modalProfile && (
                <>
                  <div className="ws-field">
                    <label>Nome completo</label>
                    <input
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Seu nome"
                      autoFocus
                    />
                  </div>
                  <div className="muted small" style={{ marginTop: 6 }}>
                    E-mail: {user?.email || "-"}
                  </div>
                </>
              )}

              {modalChangePass && (
                <>
                  <div className="ws-field">
                    <label>Senha atual</label>
                    <input
                      type="password"
                      value={passForm.current}
                      onChange={(e) =>
                        setPassForm((s) => ({ ...s, current: e.target.value }))
                      }
                      placeholder="Senha atual"
                      autoFocus
                    />
                  </div>

                  <div className="ws-field">
                    <label>Nova senha</label>
                    <input
                      type="password"
                      value={passForm.next}
                      onChange={(e) =>
                        setPassForm((s) => ({ ...s, next: e.target.value }))
                      }
                      placeholder="Nova senha"
                    />
                  </div>

                  <div className="ws-field">
                    <label>Confirmar nova senha</label>
                    <input
                      type="password"
                      value={passForm.confirm}
                      onChange={(e) =>
                        setPassForm((s) => ({ ...s, confirm: e.target.value }))
                      }
                      placeholder="Repita a nova senha"
                    />
                  </div>
                </>
              )}

              {modalDelete && (
                <div className="ws-field">
                  <label>Senha atual</label>
                  <input
                    type="password"
                    value={deletePass}
                    onChange={(e) => setDeletePass(e.target.value)}
                    placeholder="Digite sua senha para confirmar"
                    autoFocus
                  />
                </div>
              )}

              {uiMsg.text ? (
                <div className={uiMsg.type === "error" ? "ws-error" : "ws-success"}>
                  {uiMsg.text}
                </div>
              ) : null}
            </div>

            <div className="ws-modal-footer">
              {modalForgot && (
                <button
                  className="btn-primary"
                  onClick={handleForgotPassword}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Enviando..." : "Enviar link"}
                </button>
              )}

              {modalProfile && (
                <button
                  className="btn-primary"
                  onClick={handleUpdateProfile}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Salvando..." : "Salvar"}
                </button>
              )}

              {modalChangePass && (
                <button
                  className="btn-primary"
                  onClick={handleChangePassword}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Alterando..." : "Alterar"}
                </button>
              )}

              {modalDelete && (
                <button
                  className="btn-danger"
                  onClick={handleDeleteUser}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Excluindo..." : "Excluir conta"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default NavBar;

