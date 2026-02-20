// src/pages/Corporacao/CorporationsPage.jsx
import "../../StylesGlobal/global.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listCorporations,
  createCorporation,
  deleteCorporation,
  getCurrentUserIdFromToken,
} from "../../services/corporationsService";
import NavBar from "../../components/NavBar";
import { useLanguage } from "../../context/LanguageContext.jsx";

const LS_ACTIVE_CORP = "agst_active_corporation_id";

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

export default function CorporationsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [corporations, setCorporations] = useState([]);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", tax_id: "" });

  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const currentUserId = useMemo(() => getCurrentUserIdFromToken(), []);
  const activeCorpId = useMemo(() => localStorage.getItem(LS_ACTIVE_CORP) || "", []);

  async function load() {
    setLoading(true);
    setError("");

    const res = await listCorporations();
    if (!res.ok) {
      setError(res.message || t('corporations.excluirModal.erroExcluir'));
      setCorporations([]);
      setLoading(false);
      return;
    }

    const list = Array.isArray(res.data) ? res.data : [];
    setCorporations(list);

    const stored = localStorage.getItem(LS_ACTIVE_CORP);
    const exists = list.some((c) => String(c.id) === String(stored));
    const nextActive = exists ? stored : (list[0]?.id ? String(list[0].id) : "");

    if (nextActive) localStorage.setItem(LS_ACTIVE_CORP, nextActive);
    else localStorage.removeItem(LS_ACTIVE_CORP);

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function selectAndGo(id) {
    const nextId = String(id);
    localStorage.setItem(LS_ACTIVE_CORP, nextId);
    navigate(`/corporations/${nextId}`);
  }

  async function onCreate(e) {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    setError("");

    const name = form.name.trim();
    const taxDigits = onlyDigits(form.tax_id);

    if (!name) {
      setError(t('corporations.criarModal.erroNome'));
      setBusy(false);
      return;
    }

    if (taxDigits.length !== 14) {
      setError(t('corporations.criarModal.erroCnpj'));
      setBusy(false);
      return;
    }

    const res = await createCorporation({ name, tax_id: taxDigits });
    setBusy(false);

    if (!res.ok) {
      setError(res.message || t('corporations.criarModal.erroCriar'));
      return;
    }

    const createdId = String(res.data?.id || "");
    setShowCreate(false);
    setForm({ name: "", tax_id: "" });

    if (createdId) {
      localStorage.setItem(LS_ACTIVE_CORP, createdId);
      navigate(`/corporations/${createdId}`);
      return;
    }

    await load();
  }

  function openDeleteModal(corp) {
    setDeleteTarget(corp);
    setDeleteConfirm("");
    setShowDelete(true);
  }

  async function onDelete(e) {
    e.preventDefault();
    if (!deleteTarget) return;
    if (busy) return;

    setBusy(true);
    setError("");

    const res = await deleteCorporation(deleteTarget.id);
    setBusy(false);

    if (!res.ok) {
      setError(res.message || t('corporations.excluirModal.erroExcluir'));
      return;
    }

    const active = localStorage.getItem(LS_ACTIVE_CORP);
    if (String(active) === String(deleteTarget.id)) {
      localStorage.removeItem(LS_ACTIVE_CORP);
    }

    setShowDelete(false);
    setDeleteTarget(null);
    setDeleteConfirm("");

    await load();
  }

  return (
    <div className="app">
      <NavBar />
      <div className="sidebar-space" />

      <main className="main-content">
        <div className="corporations-page" style={{ padding: 0 }}>
          <div className="page-header">
            <div>
              <div className="page-title">{t('corporations.title')}</div>
              <div className="page-subtitle">
                {t('corporations.subtitle')}
              </div>
            </div>

            <div className="corp-actions">
              <button className="btn-editar" type="button" onClick={load} disabled={loading || busy}>
                {t('corporations.atualizar')}
              </button>

              <button className="btn-editar" type="button" onClick={() => setShowCreate(true)}>
                {t('corporations.criarCorporacao')}
              </button>
            </div>
          </div>

          {error ? <div className="auth-error-banner">{error}</div> : null}

          <div className="table-container">
            {loading ? (
              <div style={{ color: "var(--text-soft)" }}>{t('corporations.carregando')}</div>
            ) : corporations.length === 0 ? (
              <div style={{ color: "var(--text-soft)" }}>
                {t('corporations.nenhumaCorporacao')}
                <div style={{ marginTop: 12 }}>
                  <button className="btn-editar" type="button" onClick={() => setShowCreate(true)}>
                    {t('corporations.criarPrimeira')}
                  </button>
                </div>
              </div>
            ) : (
              <table className="gerir-usuarios-table">
                <thead>
                  <tr>
                    <th>{t('corporations.nome')}</th>
                    <th>{t('corporations.cnpj')}</th>
                    <th>{t('corporations.status')}</th>
                    <th>{t('corporations.ownerId')}</th>
                    <th style={{ width: 220 }}>{t('corporations.acoes')}</th>
                  </tr>
                </thead>

                <tbody>
                  {corporations.map((c) => {
                    const selected = String(c.id) === String(activeCorpId);
                    const isOwner = String(c.owner_id) === String(currentUserId);

                    return (
                      <tr
                        key={c.id}
                        style={selected ? { background: "rgba(37, 99, 235, 0.06)" } : null}
                      >
                        <td>
                          <button
                            type="button"
                            className="link-button"
                            onClick={() => selectAndGo(c.id)}
                            title={t('corporations.abrir')}
                          >
                            {c.name}
                          </button>
                        </td>
                        <td>{formatCNPJ(c.tax_id)}</td>
                        <td>{c.status || "-"}</td>
                        <td>{c.owner_id ?? "-"}</td>
                        <td style={{ display: "flex", gap: 8 }}>
                          <button className="btn-editar" type="button" onClick={() => selectAndGo(c.id)}>
                            {t('corporations.abrir')}
                          </button>

                          {isOwner && (
                            <button
                              className="btn-danger"
                              type="button"
                              onClick={() => openDeleteModal(c)}
                              disabled={busy}
                              title={t('corporations.excluir')}
                            >
                              {t('corporations.excluir')}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* MODAL: Criar corporação */}
          {showCreate && (
            <div className="modal-backdrop" onClick={() => !busy && setShowCreate(false)}>
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <h3>{t('corporations.criarModal.title')}</h3>
                <p className="modal-help">
                  {t('corporations.criarModal.help')}
                </p>

                <form onSubmit={onCreate} style={{ display: "grid", gap: 12 }}>
                  <div className="input-group">
                    <label>{t('corporations.criarModal.nomeFantasia')}</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                      placeholder={t('corporations.criarModal.nomePlaceholder')}
                      autoFocus
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label>{t('corporations.criarModal.cnpjLabel')}</label>
                    <input
                      value={formatCNPJ(form.tax_id)}
                      onChange={(e) => setForm((s) => ({ ...s, tax_id: e.target.value }))}
                      placeholder={t('corporations.criarModal.cnpjPlaceholder')}
                      inputMode="numeric"
                      required
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="link-button" onClick={() => setShowCreate(false)} disabled={busy}>
                      {t('corporations.criarModal.cancelar')}
                    </button>

                    <button type="submit" className="btn-primary" disabled={busy}>
                      {busy ? t('corporations.criarModal.criando') : t('corporations.criarModal.criar')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: Excluir corporação */}
          {showDelete && deleteTarget && (
            <div className="modal-backdrop" onClick={() => !busy && setShowDelete(false)}>
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <h3 style={{ color: "var(--danger)" }}>{t('corporations.excluirModal.title')}</h3>
                <p className="modal-help">
                  {t('corporations.excluirModal.irreversivel')}
                  <br />
                  <b>{deleteTarget.name}</b>
                </p>

                <form onSubmit={onDelete} style={{ display: "grid", gap: 12 }}>
                  <div className="input-group">
                    <label>{t('corporations.excluirModal.confirmacao')}</label>
                    <input
                      placeholder={t('corporations.excluirModal.placeholder')}
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="link-button" onClick={() => setShowDelete(false)} disabled={busy}>
                      {t('corporations.excluirModal.cancelar')}
                    </button>

                    <button
                      type="submit"
                      className="btn-danger"
                      disabled={busy || deleteConfirm !== (deleteTarget.name || "")}
                    >
                      {busy ? t('corporations.excluirModal.excluindo') : t('corporations.excluirModal.excluirDef')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
