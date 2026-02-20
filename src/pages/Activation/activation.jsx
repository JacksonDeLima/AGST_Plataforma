// src/pages/auth/Activation.jsx
import "../../StylesGlobal/global.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Logo from "../../assets/logo.svg";
import {
  activateUserAccount,
  resendActivationLink,
} from "../../services/authService";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function Activation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const searchParams = new URLSearchParams(location.search);
  const emailFromUrl = searchParams.get("email");
  const tokenFromUrl = searchParams.get("token");

  const initialEmail = emailFromUrl || location.state?.email || "";

  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [infoMessage, setInfoMessage] = useState("");
  const [hasTriedAutoActivate, setHasTriedAutoActivate] = useState(false);

  const isAutoMode = Boolean(emailFromUrl && tokenFromUrl);

  async function handleActivate({ email, token }) {
    setInfoMessage("");
    setErrors({});
    setIsLoading(true);

    const result = await activateUserAccount({ email, token });

    setIsLoading(false);

    if (result.success) {
      alert(t('auth.activation.contaAtivada'));
      navigate("/");
    } else {
      setErrors({
        submit: result.error || t('auth.activation.erroAtivacao'),
      });
    }
  }

  useEffect(() => {
    if (emailFromUrl && tokenFromUrl && !hasTriedAutoActivate) {
      setHasTriedAutoActivate(true);
      setEmail(emailFromUrl);
      setInfoMessage(t('auth.activation.ativando'));

      handleActivate({
        email: emailFromUrl,
        token: tokenFromUrl,
      });
    }
  }, [emailFromUrl, tokenFromUrl, hasTriedAutoActivate]);

  async function handleResendToken(e) {
    if (e) e.preventDefault();

    setInfoMessage("");
    setErrors({});

    if (!email.trim()) {
      setErrors({ email: t('auth.activation.emailObrigatorio') });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: t('auth.activation.emailInvalido') });
      return;
    }

    setIsLoading(true);

    const result = await resendActivationLink({ email });

    setIsLoading(false);

    if (result.success) {
      setInfoMessage(result.message);
    } else {
      setErrors({
        submit:
          result.error ||
          t('auth.activation.erroReenvio'),
      });
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-brand">
          <div className="login-logo">
            <img src={Logo} alt="Logo Brise Cloud" />
          </div>

          <h2 className="register-brand-title">{t('auth.activation.brandTitle')}</h2>
          <p className="register-brand-subtitle">
            {t('auth.activation.brandSubtitle')}
          </p>

          <ul className="register-brand-list">
            <li>• {t('auth.activation.brandList1')}</li>
            <li>• {t('auth.activation.brandList2')}</li>
            <li>• {t('auth.activation.brandList3')}</li>
          </ul>
        </div>

        <div className="register-box">
          <div className="register-header">
            <h1>{t('auth.activation.title')}</h1>
            {isAutoMode ? (
              <p>{t('auth.activation.autoDesc')}</p>
            ) : (
              <p>{t('auth.activation.manualDesc')}</p>
            )}
          </div>

          {errors.submit && (
            <div className="register-error-banner">{errors.submit}</div>
          )}

          {infoMessage && (
            <div
              style={{
                padding: "12px",
                marginBottom: "20px",
                backgroundColor: "#e6ffed",
                border: "1px solid #b7f5c3",
                borderRadius: "6px",
                color: "#1b7c3b",
                fontSize: "14px",
              }}
            >
              {infoMessage}
            </div>
          )}

          {!isAutoMode && (
            <form className="register-form" onSubmit={handleResendToken}>
              <div className="input-group">
                <label>{t('auth.activation.email')}</label>
                <input
                  type="email"
                  placeholder={t('auth.activation.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className={errors.email ? "error" : ""}
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <button
                type="submit"
                className="register-button"
                disabled={isLoading}
              >
                {isLoading ? t('auth.activation.reenviando') : t('auth.activation.reenviar')}
              </button>
            </form>
          )}

          <div className="register-login-link">
            <p>{t('auth.activation.jaAtivou')}</p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="link-button"
              disabled={isLoading}
            >
              {t('auth.activation.fazerLogin')}
            </button>
          </div>
        </div>
      </div>

      <footer className="register-footer">
        © {new Date().getFullYear()} Brise Cloud · AGST
      </footer>
    </div>
  );
}
