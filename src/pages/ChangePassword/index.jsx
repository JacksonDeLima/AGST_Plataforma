import "../../StylesGlobal/global.css";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.svg";
import { changePassword, resolveAuthMode } from "../../services/authService";
import { useLanguage } from "../../context/LanguageContext.jsx";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function ChangePassword() {
  const navigate = useNavigate();
  const mode = useMemo(() => resolveAuthMode(), []);
  const { t } = useLanguage();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    const errors = {};
    if (!currentPassword) errors.currentPassword = t('auth.changePassword.senhaAtualObrigatoria');

    if (!newPassword) errors.newPassword = t('auth.changePassword.novaSenhaObrigatoria');
    else if (!PASSWORD_REGEX.test(newPassword)) {
      errors.newPassword = t('auth.changePassword.senhaFraca');
    }

    if (!confirm) errors.confirm = t('auth.changePassword.confirmarObrigatorio');
    else if (confirm !== newPassword) errors.confirm = t('auth.changePassword.senhasNaoCoincidem');

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
      setErrorMsg(res.error || t('auth.changePassword.erroAlterar'));
      return;
    }

    setSuccessMsg(t('auth.changePassword.sucesso'));
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
          <h2 className="auth-brand-title">{t('auth.changePassword.brandTitle')}</h2>
          <p className="auth-brand-subtitle">{t('auth.changePassword.brandSubtitle')}</p>
          <ul className="auth-brand-list">
            <li>
              • {t('auth.changePassword.modoAtual')}: <b>{mode}</b>
            </li>
            <li>• {t('auth.changePassword.requerLogado')}</li>
          </ul>
        </div>

        <div className="auth-box">
          <div className="auth-header">
            <h1>{t('auth.changePassword.title')}</h1>
            <p>{t('auth.changePassword.subtitle')}</p>
          </div>

          {errorMsg && <div className="auth-error-banner">{errorMsg}</div>}
          {successMsg && <div className="auth-info-banner">{successMsg}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label htmlFor="currentPassword">{t('auth.changePassword.senhaAtual')}</label>
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
              <label htmlFor="newPassword">{t('auth.changePassword.novaSenha')}</label>
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
              <label htmlFor="confirm">{t('auth.changePassword.confirmarNovaSenha')}</label>
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
                  {t('auth.changePassword.alterando')}
                </>
              ) : (
                t('auth.changePassword.alterar')
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
              {t('auth.changePassword.voltar')}
            </button>
          </div>
        </div>
      </div>

      <footer className="auth-footer">© {new Date().getFullYear()} Brise Cloud · AGST</footer>
    </div>
  );
}
