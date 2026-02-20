// src/pages/auth/ForgotPassword.jsx
import "../../StylesGlobal/global.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.svg";
import { forgotPassword } from "../../services/authService";
import { useLanguage } from "../../context/LanguageContext.jsx";


export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});

    if (!email.trim()) {
      setErrors({ email: t('auth.forgotPassword.emailObrigatorio') });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: t('auth.forgotPassword.emailInvalido') });
      return;
    }

    setIsLoading(true);

    try {
      await forgotPassword({ email });
      setEmailSent(true);
    } catch (error) {
      setErrors({
        submit: t('auth.forgotPassword.erroEnvio'),
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleBackToLogin() {
    navigate("/");
  }

  function handleTryAgain() {
    setEmailSent(false);
    setErrors({});
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-brand">
          <div className="login-logo">
            <img src={Logo} alt="Logo Brise Cloud" />
          </div>

          <h2 className="register-brand-title">{t('auth.forgotPassword.brandTitle')}</h2>
          <p className="register-brand-subtitle">
            {t('auth.forgotPassword.brandSubtitle')}
          </p>

          <ul className="register-brand-list">
            <li>• {t('auth.forgotPassword.brandList1')}</li>
            <li>• {t('auth.forgotPassword.brandList2')}</li>
            <li>• {t('auth.forgotPassword.brandList3')}</li>
          </ul>
        </div>

        <div className="register-box">
          {emailSent ? (
            <>
              <div className="register-header">
                <h1>{t('auth.forgotPassword.emailSentTitle')}</h1>
                <p>
                  {t('auth.forgotPassword.emailSentDesc')}{" "}
                  <strong>{email}</strong>.
                </p>
                <p className="forgot-instructions">
                  {t('auth.forgotPassword.emailSentInstructions')}
                </p>
              </div>

              <button
                onClick={handleBackToLogin}
                className="register-button"
              >
                {t('auth.forgotPassword.voltarLogin')}
              </button>

              <div className="register-login-link" style={{ marginTop: "16px" }}>
                <p>{t('auth.forgotPassword.naoRecebeu')}</p>
                <button
                  type="button"
                  onClick={handleTryAgain}
                  className="link-button"
                >
                  {t('auth.forgotPassword.tentarNovamente')}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="register-header">
                <h1>{t('auth.forgotPassword.title')}</h1>
                <p>
                  {t('auth.forgotPassword.subtitle')}
                </p>
              </div>

              {errors.submit && (
                <div className="register-error-banner">{errors.submit}</div>
              )}

              <form onSubmit={handleSubmit} className="register-form">
                <div className="input-group">
                  <label>{t('auth.forgotPassword.email')}</label>
                  <input
                    type="email"
                    placeholder={t('auth.forgotPassword.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? "error" : ""}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                  <span className="input-hint">
                    {t('auth.forgotPassword.emailHint')}
                  </span>
                </div>

                <button
                  type="submit"
                  className="register-button"
                  disabled={isLoading}
                >
                  {isLoading ? t('auth.forgotPassword.enviando') : t('auth.forgotPassword.enviarLink')}
                </button>
              </form>

              <div className="register-login-link">
                <p>{t('auth.forgotPassword.lembrouSenha')}</p>
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="link-button"
                  disabled={isLoading}
                >
                  {t('auth.forgotPassword.voltarLogin')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <footer className="register-footer">
        © {new Date().getFullYear()} Brise Cloud · AGST
      </footer>
    </div>
  );
}
