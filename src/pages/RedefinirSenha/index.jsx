import "../../StylesGlobal/global.css";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Logo from "../../assets/logo.svg";
import { resetPassword, resolveAuthMode } from "../../services/authService";
import { useLanguage } from "../../context/LanguageContext.jsx";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function ResetPassword() {
  const navigate = useNavigate();
  const mode = useMemo(() => resolveAuthMode(), []);
  const [params] = useSearchParams();
  const { t } = useLanguage();

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
    if (!email.trim()) errors.email = t('auth.resetPassword.emailObrigatorio');
    if (!recoveryToken.trim()) errors.recoveryToken = t('auth.resetPassword.tokenObrigatorio');

    if (!newPassword) errors.newPassword = t('auth.resetPassword.novaSenhaObrigatoria');
    else if (!PASSWORD_REGEX.test(newPassword)) {
      errors.newPassword = t('auth.resetPassword.senhaFraca');
    }

    if (!confirm) errors.confirm = t('auth.resetPassword.confirmarObrigatorio');
    else if (confirm !== newPassword) errors.confirm = t('auth.resetPassword.senhasNaoCoincidem');

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
      setErrorMsg(res.error || t('auth.resetPassword.erroRedefinir'));
      return;
    }

    setSuccessMsg(t('auth.resetPassword.sucesso'));
    setTimeout(() => navigate("/login"), 800);
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="login-logo">
            <img src={Logo} alt="Logo Brise Cloud" />
          </div>
          <h2 className="auth-brand-title">{t('auth.resetPassword.brandTitle')}</h2>
          <p className="auth-brand-subtitle">
            {t('auth.resetPassword.brandSubtitle')}
          </p>
          <ul className="auth-brand-list">
            <li>
              • {t('auth.resetPassword.modoAtual')}: <b>{mode}</b>
            </li>
          </ul>
        </div>

        <div className="auth-box">
          <div className="auth-header">
            <h1>{t('auth.resetPassword.title')}</h1>
            <p>{t('auth.resetPassword.subtitle')}</p>
          </div>

          {errorMsg && <div className="auth-error-banner">{errorMsg}</div>}
          {successMsg && <div className="auth-info-banner">{successMsg}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label htmlFor="email">{t('auth.resetPassword.email')}</label>
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
              <label htmlFor="token">{t('auth.resetPassword.token')}</label>
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
              <label htmlFor="newPassword">{t('auth.resetPassword.novaSenha')}</label>
              <input
                id="newPassword"
                type="password"
                placeholder={t('auth.resetPassword.novaSenhaPlaceholder')}
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
              <label htmlFor="confirm">{t('auth.resetPassword.confirmarNovaSenha')}</label>
              <input
                id="confirm"
                type="password"
                placeholder={t('auth.resetPassword.confirmarPlaceholder')}
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
                  {t('auth.resetPassword.salvando')}
                </>
              ) : (
                t('auth.resetPassword.redefinir')
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
              {t('auth.resetPassword.voltarLogin')}
            </button>
          </div>
        </div>
      </div>

      <footer className="auth-footer">© {new Date().getFullYear()} Brise Cloud · AGST</footer>
    </div>
  );
}
