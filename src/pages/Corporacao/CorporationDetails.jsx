// src/pages/Corporacao/CorporationDetails.jsx
import "../../StylesGlobal/global.css";
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCorporation,
  listCorporationMembers,
  addCorporationMember,
  transferCorporationOwnership,
  deleteCorporation,
  getCurrentUserIdFromToken,
} from "../../services/corporationsService";
import NavBar from "../../components/NavBar";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function CorporationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const corpId = Number(id);
  const currentUserId = useMemo(() => getCurrentUserIdFromToken(), []);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [corp, setCorp] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersHidden, setMembersHidden] = useState(false);

  // Add member modal
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    email: "",
    role: "user",
    name: "",
    password: "",
  });

  // Transfer modal
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferForm, setTransferForm] = useState({
    new_owner_id: "",
    owner_password: "",
  });

  // Delete modal
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    setMembersHidden(false);

    if (!corpId || isNaN(corpId)) {
      setError(t('corporationDetails.idInvalido'));
      setLoading(false);
      return;
    }

    const corpRes = await getCorporation(corpId);
    if (!corpRes.ok) {
      setError(corpRes.message || "Erro");
      setLoading(false);
      return;
    }

    setCorp(corpRes.data);

    const membRes = await listCorporationMembers(corpId);
    if (!membRes.ok) {
      setMembersHidden(true);
      setMembers([]);
    } else {
      setMembers(Array.isArray(membRes.data) ? membRes.data : []);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [corpId]);

  const isOwner = corp && String(corp.owner_id) === String(currentUserId);

  // Add member
  async function onAdd(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);

    const payload = {
      email: addForm.email,
      role: addForm.role,
    };

    if (addForm.name) payload.name = addForm.name;
    if (addForm.password) payload.password = addForm.password;

    const res = await addCorporationMember(corpId, payload);
    setBusy(false);

    if (!res.ok) {
      setError(res.message || "Erro");
      return;
    }

    setShowAdd(false);
    setAddForm({ email: "", role: "user", name: "", password: "" });
    await load();
  }

  // Transfer
  async function onTransfer(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);

    const res = await transferCorporationOwnership(corpId, {
      new_owner_id: Number(transferForm.new_owner_id),
      owner_password: transferForm.owner_password,
    });

    setBusy(false);

    if (!res.ok) {
      setError(res.message || "Erro");
      return;
    }

    setShowTransfer(false);
    setTransferForm({ new_owner_id: "", owner_password: "" });
    await load();
  }

  // Delete
  async function onDelete(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);

    const res = await deleteCorporation(corpId);
    setBusy(false);

    if (!res.ok) {
      setError(res.message || "Erro");
      return;
    }

    navigate("/corporations");
  }

  return (
    <div className="app">
      <NavBar />
      <div className="sidebar-space" />

      <main className="main-content">
        <div className="corporations-page" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ color: "var(--text-soft)" }}>{t('corporationDetails.carregando')}</div>
          ) : !corp ? (
            <div className="auth-error-banner">{error}</div>
          ) : (
            <>
              <div className="page-header">
                <div>
                  <div className="page-title">
                    {t('corporationDetails.corporacao')}: {corp.name}
                  </div>
                  <div className="page-subtitle">{t('corporationDetails.subtitle')}</div>
                </div>

                <div className="corp-actions">
                  <button className="btn-editar" type="button" onClick={() => navigate("/corporations")}>
                    {t('corporationDetails.voltar')}
                  </button>

                  {isOwner && (
                    <>
                      <button className="btn-editar" type="button" onClick={() => setShowAdd(true)}>
                        {t('corporationDetails.adicionarMembro')}
                      </button>
                      <button className="btn-editar" type="button" onClick={() => setShowTransfer(true)}>
                        {t('corporationDetails.transferir')}
                      </button>
                      <button className="btn-danger" type="button" onClick={() => setShowDelete(true)}>
                        {t('corporationDetails.excluir')}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {error && <div className="auth-error-banner">{error}</div>}

              {/* Detalhes */}
              <div className="table-container" style={{ marginBottom: 24 }}>
                <table className="gerir-usuarios-table">
                  <tbody>
                    <tr>
                      <th style={{ width: 140 }}>{t('corporationDetails.id')}</th>
                      <td>{corp.id}</td>
                    </tr>
                    <tr>
                      <th>{t('corporationDetails.status')}</th>
                      <td>{corp.status || "-"}</td>
                    </tr>
                    <tr>
                      <th>{t('corporationDetails.cnpj')}</th>
                      <td>{corp.tax_id || "-"}</td>
                    </tr>
                    <tr>
                      <th>{t('corporationDetails.ownerId')}</th>
                      <td>{corp.owner_id ?? "-"}</td>
                    </tr>
                    <tr>
                      <th>{t('corporationDetails.criadoEm')}</th>
                      <td>{corp.created_at || "-"}</td>
                    </tr>
                    <tr>
                      <th>{t('corporationDetails.atualizadoEm')}</th>
                      <td>{corp.updated_at || "-"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Membros */}
              <div className="page-title" style={{ fontSize: 18, marginBottom: 8 }}>
                {t('corporationDetails.membros')}
              </div>

              {membersHidden ? (
                <p style={{ color: "var(--text-soft)" }}>
                  {t('corporationDetails.membrosVisivel')}
                </p>
              ) : members.length === 0 ? (
                <p style={{ color: "var(--text-soft)" }}>
                  {t('corporationDetails.nenhumMembro')}
                </p>
              ) : (
                <div className="table-container">
                  <table className="gerir-usuarios-table">
                    <thead>
                      <tr>
                        <th>{t('corporationDetails.userId')}</th>
                        <th>{t('corporationDetails.nome')}</th>
                        <th>{t('corporationDetails.email')}</th>
                        <th>{t('corporationDetails.role')}</th>
                        <th>{t('corporationDetails.vinculo')}</th>
                        <th>{t('corporationDetails.statusUsuario')}</th>
                        <th>{t('corporationDetails.criadoEmCol')}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {members.map((m, idx) => (
                        <tr key={m.user_id ?? idx}>
                          <td>{m.user_id ?? "-"}</td>
                          <td>{m.name ?? "-"}</td>
                          <td>{m.email ?? "-"}</td>
                          <td>{m.role ?? "-"}</td>
                          <td>{m.membership_status ?? "-"}</td>
                          <td>{m.user_status ?? "-"}</td>
                          <td>{m.created_at ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* MODAL: Adicionar membro */}
              {showAdd && (
                <div className="modal-backdrop" onClick={() => !busy && setShowAdd(false)}>
                  <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                    <h3>{t('corporationDetails.addModal.title')}</h3>
                    <p className="modal-help">{t('corporationDetails.addModal.help')}</p>

                    <form onSubmit={onAdd} style={{ display: "grid", gap: 12 }}>
                      <div className="input-group">
                        <label>{t('corporationDetails.addModal.emailLabel')}</label>
                        <input
                          type="email"
                          placeholder={t('corporationDetails.addModal.emailPlaceholder')}
                          value={addForm.email}
                          onChange={(e) =>
                            setAddForm((s) => ({ ...s, email: e.target.value }))
                          }
                          required
                        />
                      </div>

                      <div className="input-group">
                        <label>{t('corporationDetails.addModal.roleLabel')}</label>
                        <select
                          value={addForm.role}
                          onChange={(e) =>
                            setAddForm((s) => ({ ...s, role: e.target.value }))
                          }
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </div>

                      <div className="input-group">
                        <label>{t('corporationDetails.addModal.nomeLabel')}</label>
                        <input
                          placeholder={t('corporationDetails.addModal.nomePlaceholder')}
                          value={addForm.name}
                          onChange={(e) =>
                            setAddForm((s) => ({ ...s, name: e.target.value }))
                          }
                        />
                      </div>

                      <div className="input-group">
                        <label>{t('corporationDetails.addModal.senhaLabel')}</label>
                        <input
                          type="password"
                          placeholder={t('corporationDetails.addModal.senhaPlaceholder')}
                          value={addForm.password}
                          onChange={(e) =>
                            setAddForm((s) => ({ ...s, password: e.target.value }))
                          }
                        />
                      </div>

                      <div className="modal-actions">
                        <button type="button" className="link-button" onClick={() => setShowAdd(false)} disabled={busy}>
                          {t('corporationDetails.addModal.cancelar')}
                        </button>
                        <button type="submit" className="btn-primary" disabled={busy}>
                          {busy ? t('corporationDetails.addModal.salvando') : t('corporationDetails.addModal.adicionar')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL: Transferir */}
              {showTransfer && (
                <div className="modal-backdrop" onClick={() => !busy && setShowTransfer(false)}>
                  <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                    <h3>{t('corporationDetails.transferModal.title')}</h3>
                    <p className="modal-help">{t('corporationDetails.transferModal.help')}</p>

                    <form onSubmit={onTransfer} style={{ display: "grid", gap: 12 }}>
                      <div className="input-group">
                        <label>{t('corporationDetails.transferModal.novoOwner')}</label>
                        <select
                          value={transferForm.new_owner_id}
                          onChange={(e) =>
                            setTransferForm((s) => ({
                              ...s,
                              new_owner_id: e.target.value,
                            }))
                          }
                          required
                        >
                          <option value="">{t('corporationDetails.transferModal.selecione')}</option>
                          {members
                            .filter((m) => String(m.user_id) !== String(currentUserId))
                            .map((m) => (
                              <option key={m.user_id} value={m.user_id}>
                                {m.name || m.email || m.user_id}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="input-group">
                        <label>{t('corporationDetails.transferModal.senhaOwner')}</label>
                        <input
                          type="password"
                          placeholder={t('corporationDetails.transferModal.senhaPlaceholder')}
                          value={transferForm.owner_password}
                          onChange={(e) =>
                            setTransferForm((s) => ({
                              ...s,
                              owner_password: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <div className="modal-actions">
                        <button type="button" className="link-button" onClick={() => setShowTransfer(false)} disabled={busy}>
                          {t('corporationDetails.transferModal.cancelar')}
                        </button>
                        <button type="submit" className="btn-primary" disabled={busy}>
                          {busy
                            ? t('corporationDetails.transferModal.transferindo')
                            : t('corporationDetails.transferModal.transferir')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL: Excluir corporação */}
              {showDelete && (
                <div className="modal-backdrop" onClick={() => !busy && setShowDelete(false)}>
                  <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                    <h3 style={{ color: "var(--danger)" }}>{t('corporationDetails.excluirModal.title')}</h3>
                    <p className="modal-help">
                      {t('corporationDetails.excluirModal.irreversivel')}
                      <br />
                      <b>{corp.name}</b>
                    </p>

                    <form onSubmit={onDelete} style={{ display: "grid", gap: 12 }}>
                      <div className="input-group">
                        <label>{t('corporationDetails.excluirModal.confirmacao')}</label>
                        <input
                          placeholder={t('corporationDetails.excluirModal.placeholder')}
                          value={deleteConfirm}
                          onChange={(e) => setDeleteConfirm(e.target.value)}
                        />
                      </div>

                      <div className="modal-actions">
                        <button type="button" className="link-button" onClick={() => setShowDelete(false)} disabled={busy}>
                          {t('corporationDetails.excluirModal.cancelar')}
                        </button>
                        <button
                          type="submit"
                          className="btn-danger"
                          disabled={busy || deleteConfirm !== (corp.name || "")}
                        >
                          {busy
                            ? t('corporationDetails.excluirModal.excluindo')
                            : t('corporationDetails.excluirModal.excluirDef')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
