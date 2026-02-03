import "../../StylesGlobal/global.css";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.svg";

import { changePassword, resolveAuthMode } from "../../services/authService";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function AlterarSenha() {
  const navigate = useNavigate();
  const mode = useMemo(() => resolveAuthMode(), []);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    const errors = {};
    if (!currentPassword) errors.currentPassword = "Senha atual Ã© obrigatÃ³ria";

    if (!newPassword) errors.newPassword = "Nova senha Ã© obrigatÃ³ria";
    else if (!PASSWORD_REGEX.test(newPassword)) {
      errors.newPassword =
        "Senha fraca. Use 8+ caracteres, maiÃºscula, minÃºscula, nÃºmero e sÃ­mbolo.";
    }

    if (!confirm) errors.confirm = "Confirme a nova senha";
    else if (confirm !== newPassword) errors.confirm = "As senhas nÃ£o coincidem";

    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const errors = validate();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    setFieldErrors({});

    const res = await changePassword({
      password: currentPassword,
      new_password: newPassword,
    });

    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || "NÃ£o foi possÃ­vel alterar a senha.");
      return;
    }

    setSuccessMsg("Senha alterada com sucesso!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirm("");
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="login-logo">
            <img src={Logo} alt="Logo Brise Cloud" />
          </div>

          <h2 className="auth-brand-title">SeguranÃ§a</h2>
          <p className="auth-brand-subtitle">
            Altere sua senha com seguranÃ§a.
          </p>

          <ul className="auth-brand-list">
            <li>â€¢ Modo atual: <b>{mode}</b></li>
            <li>â€¢ Requer Bearer token</li>
          </ul>
        </div>

        <div className="auth-box">
          <div className="auth-header">
            <h1>Alterar senha</h1>
            <p>Informe a senha atual e a nova senha.</p>
          </div>

          {errorMsg && <div className="auth-error-banner">{errorMsg}</div>}
          {successMsg && <div className="auth-info-banner">{successMsg}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label htmlFor="currentPassword">Senha atual</label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isLoading}
                className={fieldErrors.currentPassword ? "error" : ""}
              />
              {fieldErrors.currentPassword && (
                <span className="error-message">{fieldErrors.currentPassword}</span>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="newPassword">Nova senha</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                className={fieldErrors.newPassword ? "error" : ""}
              />
              {fieldErrors.newPassword && (
                <span className="error-message">{fieldErrors.newPassword}</span>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="confirm">Confirmar nova senha</label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={isLoading}
                className={fieldErrors.confirm ? "error" : ""}
              />
              {fieldErrors.confirm && (
                <span className="error-message">{fieldErrors.confirm}</span>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner" />
                  Alterando...
                </>
              ) : (
                "Alterar senha"
              )}
            </button>
          </form>

          <div className="auth-login-link">
            <button
              type="button"
              className="link-button"
              onClick={() => navigate("/ambientes")}
              disabled={isLoading}
            >
              Voltar
            </button>
          </div>
        </div>
      </div>

      <footer className="auth-footer">
        Â© {new Date().getFullYear()} Brise Cloud Â· AGST
      </footer>
    </div>
  );
}

