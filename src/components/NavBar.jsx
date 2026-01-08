import { Link, useLocation } from "react-router-dom";
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

import { listCorporations, createCorporation } from "../../services/corporationsService";

const LS_ACTIVE_CORP = "agst_active_corporation_id";

/** ===== Helpers CNPJ ===== */
function onlyDigits(s = "") {
  return String(s).replace(/\D/g, "");
}

function formatCNPJ(value = "") {
  const v = onlyDigits(value).slice(0, 14);
  // 12.345.678/0001-90
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

// Validação CNPJ (dígitos verificadores)
function isValidCNPJ(cnpj) {
  const s = onlyDigits(cnpj);
  if (s.length !== 14) return false;
  if (/^(\d)\1+$/.test(s)) return false;

  const calc = (base, weights) => {
    let sum = 0;
    for (let i = 0; i < weights.length; i++) sum += Number(base[i]) * weights[i];
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const base12 = s.slice(0, 12);
  const d1 = calc(base12, [5,4,3,2,9,8,7,6,5,4,3,2]);
  const base13 = base12 + String(d1);
  const d2 = calc(base13, [6,5,4,3,2,9,8,7,6,5,4,3,2]);

  return s === base12 + String(d1) + String(d2);
}

function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || "C";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase();
}

const NavBar = () => {
  const location = useLocation();

  const [wsOpen, setWsOpen] = useState(false);
  const [showAddCorp, setShowAddCorp] = useState(false);

  const [loadingCorps, setLoadingCorps] = useState(true);
  const [corpError, setCorpError] = useState("");

  const [corporations, setCorporations] = useState([]);
  const [activeCorpId, setActiveCorpId] = useState(() => localStorage.getItem(LS_ACTIVE_CORP) || "");

  const [createState, setCreateState] = useState({ loading: false, error: "" });
  const [newCorp, setNewCorp] = useState({ name: "", tax_id: "" });

  const wsRef = useRef(null);

  const activeCorp = useMemo(() => {
    return corporations.find((c) => String(c.id) === String(activeCorpId)) || corporations[0] || null;
  }, [corporations, activeCorpId]);

  // Carregar corporações do usuário
  useEffect(() => {
    (async () => {
      setLoadingCorps(true);
      setCorpError("");

      const res = await listCorporations();
      if (!res.ok) {
        setCorpError(res.message || "Erro ao carregar corporações.");
        setCorporations([]);
        setLoadingCorps(false);
        return;
      }

      setCorporations(res.data);

      // Ajusta corporação ativa
      const stored = localStorage.getItem(LS_ACTIVE_CORP);
      const exists = res.data.some((c) => String(c.id) === String(stored));
      const nextActive = exists ? stored : (res.data[0]?.id ? String(res.data[0].id) : "");
      setActiveCorpId(nextActive);
      if (nextActive) localStorage.setItem(LS_ACTIVE_CORP, nextActive);

      setLoadingCorps(false);
    })();
  }, []);

  // Persist active corp
  useEffect(() => {
    if (activeCorpId) localStorage.setItem(LS_ACTIVE_CORP, String(activeCorpId));
  }, [activeCorpId]);

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

  const handleSelectCorp = (id) => {
    setActiveCorpId(String(id));
    setWsOpen(false);
    // ✅ aqui você pode disparar um reload de dados do app (ambientes, etc.) baseado na corp ativa
    // window.dispatchEvent(new CustomEvent("corp:changed", { detail: { id } }));
  };

  const handleOpenAdd = () => {
    setWsOpen(false);
    setCreateState({ loading: false, error: "" });
    setNewCorp({ name: "", tax_id: "" });
    setShowAddCorp(true);
  };

  const handleCloseAdd = () => {
    if (createState.loading) return;
    setShowAddCorp(false);
    setCreateState({ loading: false, error: "" });
    setNewCorp({ name: "", tax_id: "" });
  };

  const handleCreateCorp = async () => {
    const name = newCorp.name.trim();
    const tax_id = formatCNPJ(newCorp.tax_id);

    if (!name) {
      setCreateState({ loading: false, error: "Informe o nome fantasia." });
      return;
    }
    if (!isValidCNPJ(tax_id)) {
      setCreateState({ loading: false, error: "CNPJ inválido." });
      return;
    }

    setCreateState({ loading: true, error: "" });

    const res = await createCorporation({ name, tax_id });
    if (!res.ok) {
      setCreateState({ loading: false, error: res.message || "Erro ao criar corporação." });
      return;
    }

    // Recarrega lista após criar
    const listRes = await listCorporations();
    if (listRes.ok) {
      setCorporations(listRes.data);
      // Seleciona a recém criada (ID vem no res.data.id)
      const createdId = String(res.data?.id || "");
      if (createdId) {
        setActiveCorpId(createdId);
        localStorage.setItem(LS_ACTIVE_CORP, createdId);
      }
    }

    setCreateState({ loading: false, error: "" });
    setShowAddCorp(false);
    setNewCorp({ name: "", tax_id: "" });
  };

  const canCreate = Boolean(newCorp.name.trim() && onlyDigits(newCorp.tax_id).length === 14 && isValidCNPJ(newCorp.tax_id));

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
          title={corpError ? corpError : ""}
        >
          <span className="workspace-avatar">
            {loadingCorps ? <Loader2 size={16} className="spin" /> : initials(activeCorp?.name)}
          </span>

          <span className="workspace-meta">
            <span className="workspace-name" title={activeCorp?.name}>
              {loadingCorps ? "Carregando..." : activeCorp?.name || "Sem corporação"}
            </span>
            <span className="workspace-hint">
              {corpError ? "Falha ao carregar" : "Trocar corporação"}
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
              {corporations.length === 0 ? (
                <div className="muted small" style={{ padding: 8 }}>
                  Nenhuma corporação vinculada.
                </div>
              ) : (
                corporations.map((c) => {
                  const selected = String(c.id) === String(activeCorpId);
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

        <Link to="/gerir-usuarios" className={`nav-item ${isActive("/gerir-usuarios") ? "active" : ""}`}>
          <span className="nav-ico"><Users size={18} /></span>
          Gerir usuários
        </Link>

        <Link to="/alarmes" className={`nav-item ${isActive("/alarmes") ? "active" : ""}`}>
          <span className="nav-ico"><Siren size={18} /></span>
          Alarmes
        </Link>

        <Link to="/configuracoes" className={`nav-item ${isActive("/configuracoes") ? "active" : ""}`}>
          <span className="nav-ico"><Settings size={18} /></span>
          Configurações
        </Link>
      </nav>

      <div className="user-section">
        <div className="user-avatar">
          <UserCircle2 size={22} />
        </div>
        <span className="user-name">Nome</span>
      </div>

      {/* Modal criar corporação */}
      {showAddCorp && (
        <div className="ws-modal-overlay" onClick={handleCloseAdd} role="dialog" aria-modal="true">
          <div className="ws-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ws-modal-head">
              <div>
                <h3>Criar corporação</h3>
                <p>Ao criar, você vira owner automaticamente (API define owner_id).</p>
              </div>
              <button type="button" className="ws-modal-close" onClick={handleCloseAdd} aria-label="Fechar">
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

              {createState.error ? (
                <div className="ws-error">{createState.error}</div>
              ) : null}
            </div>

            <div className="ws-modal-footer">
              <button type="button" className="btn-secondary" onClick={handleCloseAdd} disabled={createState.loading}>
                Cancelar
              </button>
              <button type="button" className="btn-primary" onClick={handleCreateCorp} disabled={!canCreate || createState.loading}>
                {createState.loading ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <Loader2 size={16} className="spin" /> Criando...
                  </span>
                ) : (
                  "Criar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default NavBar;
