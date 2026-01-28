// src/pages/Corporacao/CorporationDetails.jsx
import "../../StylesGlobal/global.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addCorporationMember,
  deleteCorporation,
  getCorporation,
  getCurrentUserIdFromToken,
  listCorporationMembers,
  transferCorporationOwnership,
} from "../../services/corporationsService";
import NavBar from "../../components/NavBar";

function formatDate(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function CorporationDetails() {
  const { corporationId } = useParams();
  const corpId = Number(corporationId);
  const navigate = useNavigate();

  const [corp, setCorp] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersBlockedMsg, setMembersBlockedMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [addForm, setAddForm] = useState({
    email: "",
    full_name: "",
    password: "",
    role: "user",
  });

  const [transferForm, setTransferForm] = useState({
    new_owner_id: "",
    current_owner_password: "",
  });

  const [deleteConfirm, setDeleteConfirm] = useState("");

  const currentUserId = useMemo(() => getCurrentUserIdFromToken(), []);

  const myRole = useMemo(() => {
    const me = members.find((m) => String(m.user_id) === String(currentUserId));
    return me?.role || null;
  }, [members, currentUserId]);

  const isAdmin = myRole === "owner" || myRole === "admin";
  const isOwner = myRole === "owner";

  const activeMembers = useMemo(
    () => members.filter((m) => m.member_status === "active"),
    [members]
  );

  async function load() {
    setLoading(true);
    setError("");
    setMembersBlockedMsg("");

    const [corpRes, membersRes] = await Promise.all([
      getCorporation(corpId),
      listCorporationMembers(corpId),
    ]);

    if (!corpRes.ok) setError(corpRes.message);
    else setCorp(corpRes.data);

    if (!membersRes.ok) {
      setMembers([]);
      setMembersBlockedMsg(membersRes.message);
    } else {
      setMembers(membersRes.data);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (!Number.isFinite(corpId)) {
      setError("ID de corporação inválido.");
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [corpId]);

  async function onAddMember(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const payload = { email: addForm.email.trim(), role: addForm.role };
    if (addForm.full_name?.trim()) payload.full_name = addForm.full_name.trim();
    if (addForm.password) payload.password = addForm.password;

    const res = await addCorporationMember(corpId, payload);
    setBusy(false);

    if (!res.ok) return setError(res.message);

    setShowAdd(false);
    setAddForm({ email: "", full_name: "", password: "", role: "user" });
    await load();
  }

  async function onTransfer(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const res = await transferCorporationOwnership(corpId, {
      new_owner_id: Number(transferForm.new_owner_id),
      current_owner_password: transferForm.current_owner_password,
    });

    setBusy(false);
    if (!res.ok) return setError(res.message);

    setShowTransfer(false);
    setTransferForm({ new_owner_id: "", current_owner_password: "" });
    await load();
  }

  async function onDelete(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const res = await deleteCorporation(corpId);
    setBusy(false);

    if (!res.ok) return setError(res.message);

    navigate("/corporations");
  }

  return (
    <div className="app">
      {/* <NavBar /> */}
      {/* <div className="sidebar-space" /> */}

      <main className="main-content">
        <div className="corporations-page" style={{ padding: 0 }}>
          {loading ? (
            <div className="table-container" style={{ color: "var(--text-soft)" }}>
              Carregando corporação...
            </div>
          ) : (
            <>
              <div className="page-header">
                <div>
                  <div className="page-title">{corp?.name || "Corporação"}</div>
                  <div className="page-subtitle">
                    Detalhes e membros vinculados à corporação.
                  </div>
                </div>

                <div className="corp-actions">
                  <button
                    className="btn-editar"
                    type="button"
                    onClick={() => navigate("/corporations")}
                  >
                    Voltar
                  </button>

                  {isAdmin && (
                    <button
                      className="btn-editar"
                      type="button"
                      onClick={() => setShowAdd(true)}
                    >
                      + Adicionar membro
                    </button>
                  )}

                  {isOwner && (
                    <>
                      <button
                        className="btn-editar"
                        type="button"
                        onClick={() => setShowTransfer(true)}
                      >
                        Transferir
                      </button>
                      <button
                        className="btn-danger"
                        type="button"
                        onClick={() => setShowDelete(true)}
                      >
                        Excluir
                      </button>
                    </>
                  )}
                </div>
              </div>

              {error ? <div className="auth-error-banner">{error}</div> : null}

              <div className="table-container">
                <div className="corp-info">
                  <div>
                    <b>ID:</b> {corp?.id ?? "-"}
                  </div>
                  <div>
                    <b>Status:</b> {corp?.status || "-"}
                  </div>
                  <div>
                    <b>CNPJ:</b> {corp?.tax_id || "-"}
                  </div>
                  <div>
                    <b>Owner ID:</b> {corp?.owner_id ?? "-"}
                  </div>
                  <div>
                    <b>Criada em:</b> {formatDate(corp?.created_at)}
                  </div>
                  <div>
                    <b>Atualizada em:</b> {formatDate(corp?.updated_at)}
                  </div>
                </div>
              </div>

              <div className="table-container" style={{ marginTop: 16 }}>
                <div className="page-title" style={{ fontSize: 18, marginBottom: 10 }}>
                  Membros
                </div>

                {membersBlockedMsg ? (
                  <div style={{ color: "var(--text-soft)" }}>
                    {membersBlockedMsg}
                    <div style={{ marginTop: 6, color: "var(--text-muted)" }}>
                      (A lista de membros só é visível para <b>admin/owner</b>.)
                    </div>
                  </div>
                ) : (
                  <table className="gerir-usuarios-table">
                    <thead>
                      <tr>
                        <th>User ID</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Vínculo</th>
                        <th>Status Usuário</th>
                        <th>Criado em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m) => (
                        <tr key={m.user_id}>
                          <td>{m.user_id}</td>
                          <td>{m.full_name || "-"}</td>
                          <td>{m.email}</td>
                          <td>{m.role}</td>
                          <td>{m.member_status}</td>
                          <td>{m.user_status}</td>
                          <td>{formatDate(m.created_at)}</td>
                        </tr>
                      ))}

                      {members.length === 0 && (
                        <tr>
                          <td colSpan={7} style={{ color: "var(--text-soft)" }}>
                            Nenhum membro retornado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* MODAL: Adicionar membro */}
              {showAdd && (
                <div className="modal-backdrop" onClick={() => !busy && setShowAdd(false)}>
                  <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                    <h3>Adicionar membro</h3>
                    <p className="modal-help">
                      Se o usuário ainda não existir, preencha <b>Nome</b> e <b>Senha</b>.
                    </p>

                    <form onSubmit={onAddMember} style={{ display: "grid", gap: 12 }}>
                      <div className="input-group">
                        <label>Email *</label>
                        <input
                          placeholder="email@empresa.com"
                          value={addForm.email}
                          onChange={(e) =>
                            setAddForm((s) => ({ ...s, email: e.target.value }))
                          }
                          required
                        />
                      </div>

                      <div className="input-group">
                        <label>Role *</label>
                        <select
                          value={addForm.role}
                          onChange={(e) => setAddForm((s) => ({ ...s, role: e.target.value }))}
                          required
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </div>

                      <div className="input-group">
                        <label>Nome completo (se não existir)</label>
                        <input
                          placeholder="Nome Sobrenome"
                          value={addForm.full_name}
                          onChange={(e) =>
                            setAddForm((s) => ({ ...s, full_name: e.target.value }))
                          }
                        />
                      </div>

                      <div className="input-group">
                        <label>Senha (se não existir)</label>
                        <input
                          type="password"
                          placeholder="mínimo 8 caracteres"
                          value={addForm.password}
                          onChange={(e) =>
                            setAddForm((s) => ({ ...s, password: e.target.value }))
                          }
                        />
                      </div>

                      <div className="modal-actions">
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => setShowAdd(false)}
                          disabled={busy}
                        >
                          Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={busy}>
                          {busy ? "Salvando..." : "Adicionar"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL: Transferir */}
              {showTransfer && (
                <div
                  className="modal-backdrop"
                  onClick={() => !busy && setShowTransfer(false)}
                >
                  <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                    <h3>Transferir corporação</h3>
                    <p className="modal-help">
                      ⚠️ Ação crítica. Requer a senha do <b>owner atual</b>.
                    </p>

                    <form onSubmit={onTransfer} style={{ display: "grid", gap: 12 }}>
                      <div className="input-group">
                        <label>Novo owner *</label>
                        <select
                          value={transferForm.new_owner_id}
                          onChange={(e) =>
                            setTransferForm((s) => ({ ...s, new_owner_id: e.target.value }))
                          }
                          required
                        >
                          <option value="">Selecione</option>
                          {activeMembers
                            .filter((m) => m.user_id !== corp?.owner_id)
                            .map((m) => (
                              <option key={m.user_id} value={m.user_id}>
                                {m.full_name || m.email} (id: {m.user_id})
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="input-group">
                        <label>Senha do owner atual *</label>
                        <input
                          type="password"
                          placeholder="Senha atual"
                          value={transferForm.current_owner_password}
                          onChange={(e) =>
                            setTransferForm((s) => ({
                              ...s,
                              current_owner_password: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <div className="modal-actions">
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => setShowTransfer(false)}
                          disabled={busy}
                        >
                          Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={busy}>
                          {busy ? "Transferindo..." : "Transferir"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL: Excluir */}
              {showDelete && (
                <div className="modal-backdrop" onClick={() => !busy && setShowDelete(false)}>
                  <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                    <h3 style={{ color: "var(--danger)" }}>Excluir corporação</h3>
                    <p className="modal-help">
                      Essa ação é <b>irreversível</b>. Para confirmar, digite o nome exato:
                      <br />
                      <b>{corp?.name}</b>
                    </p>

                    <form onSubmit={onDelete} style={{ display: "grid", gap: 12 }}>
                      <div className="input-group">
                        <label>Confirmação</label>
                        <input
                          placeholder="Digite o nome para confirmar"
                          value={deleteConfirm}
                          onChange={(e) => setDeleteConfirm(e.target.value)}
                        />
                      </div>

                      <div className="modal-actions">
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => setShowDelete(false)}
                          disabled={busy}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="btn-danger"
                          disabled={busy || deleteConfirm !== (corp?.name || "")}
                        >
                          {busy ? "Excluindo..." : "Excluir definitivamente"}
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
