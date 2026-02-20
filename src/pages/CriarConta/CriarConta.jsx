// src/pages/auth/Register.jsx
import "../../StylesGlobal/global.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.svg";
import { registerUser } from "../../services/authService";
import { useLanguage } from "../../context/LanguageContext.jsx";

const HCAPTCHA_SITEKEY = "ddda0de4-7a3a-4124-a9b8-a81a47321aa2";

export default function Register() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const captchaContainerRef = useRef(null);
  const captchaWidgetIdRef = useRef(null);
  const renderedRef = useRef(false);
  const [captchaToken, setCaptchaToken] = useState("");

  useEffect(() => {
    const container = captchaContainerRef.current;
    if (!container) return;

    function renderCaptcha() {
      if (!window.hcaptcha) return;
      if (renderedRef.current) return;

      captchaWidgetIdRef.current = window.hcaptcha.render(container, {
        sitekey: HCAPTCHA_SITEKEY,
        callback: (token) => {
          setCaptchaToken(token);
          setErrors((prev) => ({ ...prev, captcha: "" }));
        },
        "expired-callback": () => {
          setCaptchaToken("");
          setErrors((prev) => ({
            ...prev,
            captcha: t('auth.register.captchaExpirou'),
          }));
        },
        "error-callback": () => {
          setCaptchaToken("");
          setErrors((prev) => ({
            ...prev,
            captcha: t('auth.register.captchaErro'),
          }));
        },
      });

      renderedRef.current = true;
    }

    const existing = document.querySelector(
      'script[src^="https://js.hcaptcha.com/1/api.js"]'
    );

    if (!existing) {
      const s = document.createElement("script");
      s.src = "https://js.hcaptcha.com/1/api.js?render=explicit";
      s.async = true;
      s.defer = true;
      s.onload = renderCaptcha;
      document.body.appendChild(s);
    } else {
      renderCaptcha();
    }

    const intervalId = setInterval(renderCaptcha, 200);

    return () => {
      clearInterval(intervalId);
      try {
        if (window.hcaptcha && captchaWidgetIdRef.current != null) {
          window.hcaptcha.remove(captchaWidgetIdRef.current);
        }
      } catch { }
      captchaWidgetIdRef.current = null;
      renderedRef.current = false;
    };
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = t('auth.register.nomeObrigatorio');

    if (!formData.email.trim()) newErrors.email = t('auth.register.emailObrigatorio');
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = t('auth.register.emailInvalido');

    const strongPass =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!formData.password) {
      newErrors.password = t('auth.register.senhaObrigatoria');
    } else if (!strongPass.test(formData.password)) {
      newErrors.password = t('auth.register.senhaFraca');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.register.confirmarObrigatorio');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.register.senhasNaoCoincidem');
    }

    if (!acceptTerms) newErrors.terms = t('auth.register.aceitarTermos');

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const newErrors = validateForm();

    if (!captchaToken) {
      newErrors.captcha = t('auth.register.captchaObrigatorio');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        captchaToken,
      });

      if (result.success) {
        alert(
          `${t('auth.register.contaCriada')} ${formData.email}. ` +
          t('auth.register.cliqueLink')
        );

        navigate("/activation", {
          state: { email: formData.email, userId: result.data.id },
        });
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      setErrors({
        submit: t('auth.register.erroInesperado'),
      });
    } finally {
      setIsLoading(false);

      if (window.hcaptcha && captchaWidgetIdRef.current != null) {
        try {
          window.hcaptcha.reset(captchaWidgetIdRef.current);
          setCaptchaToken("");
        } catch (err) {
          console.warn("Falha ao resetar hCaptcha", err);
        }
      }
    }
  }

  function handleBackToLogin() {
    navigate("/");
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-brand">
          <div className="login-logo">
            <img src={Logo} alt="Logo Brise Cloud" />
          </div>

          <h2 className="register-brand-title">{t('auth.register.brandTitle')}</h2>

          <p className="register-brand-subtitle">
            {t('auth.register.brandSubtitle')}
          </p>

          <ul className="register-brand-list">
            <li>• {t('auth.register.brandList1')}</li>
            <li>• {t('auth.register.brandList2')}</li>
            <li>• {t('auth.register.brandList3')}</li>
          </ul>
        </div>

        <div className="register-box">
          <div className="register-header">
            <h1>{t('auth.register.title')}</h1>
            <p>{t('auth.register.subtitle')}</p>
          </div>

          {errors.submit && (
            <div className="register-error-banner">{errors.submit}</div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="input-group">
              <label>{t('auth.register.nomeCompleto')}</label>
              <input
                type="text"
                name="name"
                placeholder={t('auth.register.nomePlaceholder')}
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "error" : ""}
                disabled={isLoading}
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            <div className="input-group">
              <label>{t('auth.register.email')}</label>
              <input
                type="email"
                name="email"
                placeholder={t('auth.register.emailPlaceholder')}
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
                disabled={isLoading}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="input-group">
              <label>{t('auth.register.senha')}</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "error" : ""}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
              <span className="input-hint">{t('auth.register.minCaracteres')}</span>
            </div>

            <div className="input-group">
              <label>{t('auth.register.confirmarSenha')}</label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "error" : ""}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>

            <div className="input-group">
              <label>{t('auth.register.validacao')}</label>
              <div ref={captchaContainerRef} className="captcha-container" />
              {errors.captcha && (
                <span className="error-message">{errors.captcha}</span>
              )}
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  disabled={isLoading}
                />
                <span>
                  {t('auth.register.aceito')} <a href="/terms">{t('auth.register.termos')}</a> {t('auth.register.ea')}{" "}
                  <a href="/privacy">{t('auth.register.politica')}</a>
                </span>
              </label>
              {errors.terms && (
                <span className="error-message">{errors.terms}</span>
              )}
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={isLoading}
            >
              {isLoading ? t('auth.register.criando') : t('auth.register.criar')}
            </button>
          </form>

          <div className="register-divider">
            <span>{t('auth.register.ou')}</span>
          </div>

          <div className="register-login-link">
            <p>{t('auth.register.jaConta')}</p>
            <button
              onClick={handleBackToLogin}
              className="link-button"
              disabled={isLoading}
            >
              {t('auth.register.fazerLogin')}
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
