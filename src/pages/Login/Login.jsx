// src/pages/auth/Login.jsx
import "../../StylesGlobal/global.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Logo from "../../assets/logo.svg";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

import {
  resolveAuthMode,
  bootstrapOAuthSession,
  redirectToAuthorize,
  logAuthSnapshot,
} from "../../services/authService";

const DEBUG_AUTH =
  String(import.meta.env.VITE_DEBUG_AUTH || "").toLowerCase() === "true";

export default function Login() {
  const navigate = useNavigate();
  const mode = useMemo(() => resolveAuthMode(), []);
  const { loginWithPassword } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [booting, setBooting] = useState(mode === "oauth");
  const [isLoading, setIsLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let alive = true;
    if (DEBUG_AUTH) logAuthSnapshot("Login.jsx - carregou a tela");

    (async () => {
      if (mode !== "oauth") return;

      try {
        if (DEBUG_AUTH) logAuthSnapshot("Login.jsx (antes do bootstrap)");
        await bootstrapOAuthSession({
          onAuthenticated: () => {
            if (DEBUG_AUTH) logAuthSnapshot("Login.jsx (OAuth autenticado)");
            navigate("/ambientes", { replace: true });
          },
        });
      } catch (e) {
        console.error("❌ [Login] Erro ao iniciar OAuth:", e);
        if (alive)
          setErrorMsg(t('auth.login.erroOauth'));
      } finally {
        if (alive) setBooting(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [mode, navigate]);

  function validate() {
    const errors = {};
    if (!email.trim()) errors.email = t('auth.login.emailObrigatorio');
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = t('auth.login.emailInvalido');
    if (!password) errors.password = t('auth.login.senhaObrigatoria');
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    setFieldErrors({});

    const result = await loginWithPassword(email, password);

    setIsLoading(false);

    if (!result.ok) {
      setErrorMsg(
        result.error?.data?.error ||
        result.error?.message ||
        t('auth.login.erroAuth')
      );
      return;
    }

    navigate("/ambientes", { replace: true });
  }

  const disabled = booting || isLoading;

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Lado esquerdo - branding */}
        <div className="auth-brand">
          <div className="login-logo">
            <img src={Logo} alt="Logo Brise Cloud" />
          </div>

          <h2 className="auth-brand-title">{t('auth.login.welcome')}</h2>

          <p className="auth-brand-subtitle">
            {mode === "oauth"
              ? t('auth.login.subtitleOauth')
              : t('auth.login.subtitlePassword')}
          </p>

          <ul className="auth-brand-list">
            <li>• {t('auth.login.brandList1')}</li>
            <li>• {t('auth.login.brandList2')}</li>
            <li>• {t('auth.login.brandList3')}</li>
          </ul>

          {DEBUG_AUTH && (
            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
              🔎 Modo de diagnóstico ativado
            </div>
          )}
        </div>

        {/* Lado direito - formulário */}
        <div className="auth-box">
          <div className="auth-header">
            <h1>{t('auth.login.title')}</h1>
            <p>
              {mode === "oauth"
                ? t('auth.login.descOauth')
                : t('auth.login.descPassword')}
            </p>
          </div>

          {booting && (
            <div className="auth-info-banner">
              {t('auth.login.booting')}
            </div>
          )}

          {errorMsg && <div className="auth-error-banner">{errorMsg}</div>}

          {mode === "oauth" ? (
            <button
              type="button"
              className="btn-primary"
              onClick={redirectToAuthorize}
              disabled={disabled}
            >
              {t('auth.login.continuar')}
            </button>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="input-group">
                  <label htmlFor="email">{t('auth.login.email')}</label>
                  <input
                    id="email"
                    type="email"
                    placeholder={t('auth.login.emailPlaceholder')}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors((prev) => ({ ...prev, email: "" }));
                      }
                    }}
                    disabled={disabled}
                    className={fieldErrors.email ? "error" : ""}
                  />
                  {fieldErrors.email && (
                    <span className="error-message">{fieldErrors.email}</span>
                  )}
                </div>

                <div className="input-group">
                  <div className="auth-label-row">
                    <label htmlFor="password">{t('auth.login.senha')}</label>
                  </div>

                  <input
                    id="password"
                    type="password"
                    placeholder={t('auth.login.senhaPlaceholder')}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({ ...prev, password: "" }));
                      }
                    }}
                    disabled={disabled}
                    className={fieldErrors.password ? "error" : ""}
                  />

                  {fieldErrors.password && (
                    <span className="error-message">{fieldErrors.password}</span>
                  )}
                </div>

                <button type="submit" className="btn-primary" disabled={disabled}>
                  {isLoading ? (
                    <>
                      <span className="spinner" />
                      {t('auth.login.entrando')}
                    </>
                  ) : (
                    t('auth.login.entrar')
                  )}
                </button>
              </form>
            </>
          )}

          <div className="auth-login-link">
            <span>{t('auth.login.semConta')}</span>
            <button
              type="button"
              className="link-button"
              onClick={() => navigate("/criarConta")}
              disabled={disabled}
            >
              {t('auth.login.criarConta')}
            </button>
          </div>

          <div className="auth-login-link">
            <span>{t('auth.login.esqueceuSenha')}</span>
            <button
              type="button"
              className="link-button"
              onClick={() => navigate("/EsqueciSenha")}
              disabled={disabled}
            >
              {t('auth.login.recuperarSenha')}
            </button>
          </div>
        </div>
      </div>

      <footer className="auth-footer">
        © {new Date().getFullYear()} Brise Cloud · AGST
      </footer>
    </div>
  );
}
