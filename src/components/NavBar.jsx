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
} from "lucide-react";
import "./NavBar.css";

import { useAuth } from "../context/AuthContext.jsx";
import { createCorporation, listCorporationMembers } from "../services/corporationsService";

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
  } = useAuth();

  const loadingCorps = status === "loading";
  const [wsOpen, setWsOpen] = useState(false);
  const [showAddCorp, setShowAddCorp] = useState(false);

  const [createState, setCreateState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const [newCorp, setNewCorp] = useState({ name: "", tax_id: "" });

  const wsRef = useRef(null);

  // ✅ corp ativa (vem do /corporations, sem role)
  const activeCorp = useMemo(() => {
    const cid = String(corporationId ?? "");
    return (
      corporations?.find((c) => String(c.id) === cid) ||
      corporations?.[0] ||
      null
    );
  }, [corporations, corporationId]);

  // ✅ cache de roles por corp: { [corpId]: "admin" | "user" | ... }
  const [corpRoles, setCorpRoles] = useState({});
  const [roleLoading, setRoleLoading] = useState(false);

  // ✅ resolve role do usuário na corp ativa
  useEffect(() => {
    const cid = String(corporationId ?? "");
    const uid = getUserId(user);

    if (!cid || !uid) return;

    // 1) cache já tem role
    if (corpRoles[cid] !== undefined) return;

    // 2) se é owner_id da corp ativa, já libera sem bater em /members
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
          // cacheia como null pra não ficar chamando infinito
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

  // ✅ Pode gerir usuários se:
  // - role == admin/owner/super_admin (vem do /members)
  // - OU é owner_id (vem do /corporations)
  const canManageUsers = useMemo(() => {
    const uid = getUserId(user);
    const isOwner = uid && String(activeCorp?.owner_id) === uid;
    return isOwner || isAdminRole(activeRole);
  }, [user, activeCorp?.owner_id, activeRole]);

  // Fechar dropdown clicando fora
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

  // ✅ Seleciona corp (sem navegar)
  const handleSelectCorp = async (id) => {
    const nextId = String(id);
    setWsOpen(false);

    // se já está na mesma, só fecha e navega (opcional)
    if (String(corporationId) === nextId) {
      navigate("/dashboard", { replace: true });
      return;
    }

    // troca a corporação (persiste + atualiza contexto)
    await setActiveCorporation(nextId);

    // ✅ vai para dashboard
    navigate("/dashboard", {
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
      setCreateState({ loading: false, error: "Informe o nome fantasia.", success: "" });
      return;
    }
    if (taxDigits.length !== 14) {
      setCreateState({ loading: false, error: "CNPJ deve conter 14 dígitos.", success: "" });
      return;
    }

    setCreateState({ loading: true, error: "", success: "" });

    const res = await createCorporation({ name, tax_id: taxDigits });
    if (!res.ok) {
      setCreateState({ loading: false, error: res.message || "Erro ao criar corporação.", success: "" });
      return;
    }

    const createdId = String(res.data?.id || "");
    if (createdId) {
      await setActiveCorporation(createdId);
      await bootstrap();

      setCreateState({ loading: false, error: "", success: "✅ Corporação criada com sucesso!" });
      setShowAddCorp(false);

      navigate(location.pathname, { replace: true });
      return;
    }

    setCreateState({ loading: false, error: "", success: "✅ Corporação criada com sucesso!" });
    setShowAddCorp(false);
  };

  const userName = user?.full_name || user?.name || user?.email || "Usuário";

  return (
    <aside className="navbar">
      <h1 className="logo">Dashboard</h1>
      <p className="subtitle">Visão geral</p>

      {/* Workspace / Corporação */}
      <div className="workspace" ref={wsRef}>
        <div className="workspace-label">Workspace</div>

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
              {loadingCorps ? "Carregando..." : activeCorp?.name || "Sem corporação"}
            </span>
            <span className="workspace-hint">
              {loadingCorps
                ? "Aguarde..."
                : roleLoading
                  ? "Carregando permissões..."
                  : "Trocar corporação"}
            </span>
          </span>

          <ChevronDown className={`workspace-caret ${wsOpen ? "open" : ""}`} size={18} />
        </button>

        {wsOpen && (
          <div className="workspace-menu" role="menu" aria-label="Selecionar corporação">
            <div className="workspace-menu-head">
              <span>Minhas corporações</span>
              <button type="button" className="workspace-add" onClick={handleOpenAdd}>
                + Adicionar
              </button>
            </div>

            <div className="workspace-list">
              {!corporations || corporations.length === 0 ? (
                <div className="muted small" style={{ padding: 8 }}>
                  Nenhuma corporação vinculada.
                </div>
              ) : (
                corporations.map((c) => {
                  const selected = String(c.id) === String(corporationId);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="menuitem"
                      className={`workspace-item ${selected ? "selected" : ""}`}
                      onClick={() => handleSelectCorp(c.id)}
                    >
                      <span className="workspace-item-avatar">{initials(c.name)}</span>
                      <span className="workspace-item-name" title={c.name}>
                        {c.name}
                      </span>
                      {selected && <span className="workspace-item-check">✓</span>}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      <nav className="nav">
        <Link to="/dashboard" className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}>
          <span className="nav-ico"><MapPin size={18} /></span>
          Ambientes
        </Link>

        <Link to="/equipamentos" className={`nav-item ${isActive("/equipamentos") ? "active" : ""}`}>
          <span className="nav-ico"><Package size={18} /></span>
          Equipamentos
        </Link>

        <Link to="/automacoes" className={`nav-item ${isActive("/automacoes") ? "active" : ""}`}>
          <span className="nav-ico"><Snowflake size={18} /></span>
          Automações
        </Link>

        <Link to="/relatorios" className={`nav-item ${isActive("/relatorios") ? "active" : ""}`}>
          <span className="nav-ico"><BarChart3 size={18} /></span>
          Relatórios
        </Link>

        {/* ✅ Agora funciona: owner_id OU role admin vindo do /members */}
        {canManageUsers && (
          <Link to="/gerir-usuarios" className={`nav-item ${isActive("/gerir-usuarios") ? "active" : ""}`}>
            <span className="nav-ico"><Users size={18} /></span>
            Gerir usuários
          </Link>
        )}

        <Link to="/alarmes" className={`nav-item ${isActive("/alarmes") ? "active" : ""}`}>
          <span className="nav-ico"><Siren size={18} /></span>
          Alarmes
        </Link>

        <Link to="/configuracoes" className={`nav-item ${isActive("/configuracoes") ? "active" : ""}`}>
          <span className="nav-ico"><Settings size={18} /></span>
          Configurações
        </Link>
      </nav>

      <div className="user-section" title={user?.email || ""}>
        <div className="user-avatar"><UserCircle2 size={22} /></div>
        <span className="user-name">{userName}</span>
      </div>

      {showAddCorp && (
        <div className="ws-modal-overlay" onClick={handleCloseAdd} role="dialog" aria-modal="true">
          <div className="ws-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ws-modal-head">
              <div>
                <h3>Criar corporação</h3>
                <p>Ao criar, você vira owner automaticamente (API define owner_id).</p>
              </div>
              <button
                type="button"
                className="ws-modal-close"
                onClick={handleCloseAdd}
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <div className="ws-modal-body">
              <div className="ws-field">
                <label>Nome fantasia</label>
                <input
                  value={newCorp.name}
                  onChange={(e) => setNewCorp((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Ex: Tech Solutions Ltda."
                  autoFocus
                />
              </div>

              <div className="ws-field">
                <label>CNPJ</label>
                <input
                  value={formatCNPJ(newCorp.tax_id)}
                  onChange={(e) => setNewCorp((s) => ({ ...s, tax_id: e.target.value }))}
                  placeholder="12.345.678/0001-90"
                  inputMode="numeric"
                />
              </div>

              {createState.error ? <div className="ws-error">{createState.error}</div> : null}
              {createState.success ? <div className="ws-success">{createState.success}</div> : null}
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
    </aside>
  );
};

export default NavBar;
