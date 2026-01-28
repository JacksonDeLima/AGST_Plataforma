import "../../StylesGlobal/global.css";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Logo from "../../assets/logo.svg";
import { resetPassword, resolveAuthMode } from "../../services/authService";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function ResetPassword() {
  const navigate = useNavigate();
  const mode = useMemo(() => resolveAuthMode(), []);
  const [params] = useSearchParams();

  const [email, setEmail] = useState(params.get("email") || "");
  const [recoveryToken, setRecoveryToken] = useState(
    params.get("recoveryToken") || ""
  );

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    const errors = {};
    if (!email.trim()) errors.email = "Email é obrigatório";
    if (!recoveryToken.trim()) errors.recoveryToken = "Token é obrigatório";

    if (!newPassword) errors.newPassword = "Nova senha é obrigatória";
    else if (!PASSWORD_REGEX.test(newPassword)) {
      errors.newPassword =
        "Senha fraca. Use 8+ caracteres, maiúscula, minúscula, número e símbolo.";
    }

    if (!confirm) errors.confirm = "Confirme a nova senha";
    else if (confirm !== newPassword) errors.confirm = "As senhas não coincidem";

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

    const res = await resetPassword({
      email,
      recoveryToken,
      password: newPassword,
    });

    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || "Não foi possível redefinir a senha.");
      return;
    }

    setSuccessMsg("Senha redefinida com sucesso! Você já pode entrar.");
    setTimeout(() => navigate("/login"), 800);
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="login-logo">
            <img src={Logo} alt="Logo Brise Cloud" />
          </div>
          <h2 className="auth-brand-title">Redefinir senha</h2>
          <p className="auth-brand-subtitle">
            Crie uma nova senha para sua conta.
          </p>
          <ul className="auth-brand-list">
            <li>
              • Modo atual: <b>{mode}</b>
            </li>
          </ul>
        </div>

        <div className="auth-box">
          <div className="auth-header">
            <h1>Nova senha</h1>
            <p>Use o e-mail e token do link recebido.</p>
          </div>

          {errorMsg && <div className="auth-error-banner">{errorMsg}</div>}
          {successMsg && <div className="auth-info-banner">{successMsg}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className={fieldErrors.email ? "error" : ""}
              />
              {fieldErrors.email && (
                <span className="error-message">{fieldErrors.email}</span>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="token">Token</label>
              <input
                id="token"
                type="text"
                value={recoveryToken}
                onChange={(e) => setRecoveryToken(e.target.value)}
                disabled={isLoading}
                className={fieldErrors.recoveryToken ? "error" : ""}
              />
              {fieldErrors.recoveryToken && (
                <span className="error-message">{fieldErrors.recoveryToken}</span>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="newPassword">Nova senha</label>
              <input
                id="newPassword"
                type="password"
                placeholder="Digite a nova senha"
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
                placeholder="Repita a nova senha"
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
                  Salvando...
                </>
              ) : (
                "Redefinir senha"
              )}
            </button>
          </form>

          <div className="auth-login-link">
            <button
              type="button"
              className="link-button"
              onClick={() => navigate("/login")}
              disabled={isLoading}
            >
              Voltar ao login
            </button>
          </div>
        </div>
      </div>

      <footer className="auth-footer">© {new Date().getFullYear()} Brise Cloud · AGST</footer>
    </div>
  );
}
