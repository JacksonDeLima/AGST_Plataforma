// src/pages/auth/Register.jsx
import "../../StylesGlobal/global.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.svg";
import { registerUser } from "../../services/authService";

const HCAPTCHA_SITEKEY = "ddda0de4-7a3a-4124-a9b8-a81a47321aa2"; // troque se te passarem outro

export default function Register() {
  const navigate = useNavigate();

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

  // hCaptcha (estável, sem sumir por re-render/StrictMode)
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
          console.log("✅ hCaptcha token recebido:", token);
          setCaptchaToken(token);
          setErrors((prev) => ({ ...prev, captcha: "" }));
        },
        "expired-callback": () => {
          setCaptchaToken("");
          setErrors((prev) => ({
            ...prev,
            captcha: "Captcha expirou, resolva novamente.",
          }));
        },
        "error-callback": () => {
          setCaptchaToken("");
          setErrors((prev) => ({
            ...prev,
            captcha: "Falha ao carregar o captcha. Recarregue a página.",
          }));
        },
      });

      renderedRef.current = true;
      console.log("hCaptcha widget renderizado. ID:", captchaWidgetIdRef.current);
    }

    // 1) Garante script (apenas 1x na página)
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

    // 2) Fallback: tenta por um tempo caso window.hcaptcha demore
    const intervalId = setInterval(renderCaptcha, 200);

    return () => {
      clearInterval(intervalId);
      try {
        if (window.hcaptcha && captchaWidgetIdRef.current != null) {
          window.hcaptcha.remove(captchaWidgetIdRef.current);
        }
      } catch {}
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

    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório";

    if (!formData.email.trim()) newErrors.email = "Email é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email inválido";

    const strongPass =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (!strongPass.test(formData.password)) {
      newErrors.password =
        "Senha fraca. Use 8+ caracteres com maiúscula, minúscula, número e especial.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirme sua senha";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    if (!acceptTerms) newErrors.terms = "Você deve aceitar os termos";

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const newErrors = validateForm();

    if (!captchaToken) {
      newErrors.captcha = "Confirme que você não é um robô.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log("✅ Dados do formulário validados:", {
      ...formData,
      acceptTerms,
      captchaToken,
    });

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
        console.log("🎉 Usuário criado com sucesso:", result.data);

        alert(
          `Conta criada com sucesso! Enviamos um e-mail com um link de ativação para ${formData.email}. ` +
            "Clique no link recebido para confirmar seu cadastro."
        );

        navigate("/activation", {
          state: { email: formData.email, userId: result.data.id },
        });
      } else {
        console.warn("⚠️ Erro ao criar usuário:", result.error);
        setErrors({ submit: result.error });
      }
    } catch (error) {
      console.error("⚠️ Erro inesperado ao criar usuário:", error);
      setErrors({
        submit: "Erro inesperado ao criar usuário. Tente novamente.",
      });
    } finally {
      setIsLoading(false);

      if (window.hcaptcha && captchaWidgetIdRef.current != null) {
        try {
          window.hcaptcha.reset(captchaWidgetIdRef.current);
          setCaptchaToken("");
          console.log("hCaptcha resetado.");
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
        {/* Lado esquerdo - informações / branding */}
        <div className="register-brand">
          <div className="login-logo">
            <img src={Logo} alt="Logo Brise Cloud" />
          </div>

          <h2 className="register-brand-title">Crie sua conta Brise Cloud</h2>

          <p className="register-brand-subtitle">
            Centralize o acesso às integrações e dispositivos com segurança e
            controle.
          </p>

          <ul className="register-brand-list">
            <li>• Gestão unificada de dispositivos</li>
            <li>• Acesso seguro com API 3.0</li>
            <li>• Ativação via token enviado por e-mail</li>
          </ul>
        </div>

        {/* Lado direito - formulário */}
        <div className="register-box">
          <div className="register-header">
            <h1>Criar conta</h1>
            <p>Preencha os dados para iniciar o acesso ao Brise Cloud.</p>
          </div>

          {errors.submit && (
            <div className="register-error-banner">{errors.submit}</div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="input-group">
              <label>Nome Completo</label>
              <input
                type="text"
                name="name"
                placeholder="Nome completo"
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
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="seu@email.com"
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
              <label>Senha</label>
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
              <span className="input-hint">Mínimo de 8 caracteres</span>
            </div>

            <div className="input-group">
              <label>Confirmar Senha</label>
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
              <label>Validação de segurança</label>
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
                  Aceito os <a href="/terms">Termos de Uso</a> e a{" "}
                  <a href="/privacy">Política de Privacidade</a>
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
              {isLoading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          <div className="register-divider">
            <span>ou</span>
          </div>

          <div className="register-login-link">
            <p>Já tem uma conta?</p>
            <button
              onClick={handleBackToLogin}
              className="link-button"
              disabled={isLoading}
            >
              Fazer login
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
