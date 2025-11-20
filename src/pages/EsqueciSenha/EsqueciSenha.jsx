// src/pages/auth/ForgotPassword.jsx
import "../../StylesGlobal/global.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.svg";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});

    if (!email.trim()) {
      setErrors({ email: "Informe o e-mail cadastrado." });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: "E-mail inválido." });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: chamada real para API de recuperação de senha
      // await fetch(`${API_BASE_URL}/auth/forgot-password`, { ... })

      setEmailSent(true);
    } catch (error) {
      setErrors({
        submit:
          "Não foi possível enviar o e-mail de recuperação. Tente novamente em alguns instantes.",
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
        {/* Lado esquerdo - branding / informações */}
        <div className="register-brand">
          <div className="login-logo">
            <img src={Logo} alt="Logo Brise Cloud" />
          </div>

          <h2 className="register-brand-title">Recupere o acesso à sua conta</h2>
          <p className="register-brand-subtitle">
            Enviaremos um link de recuperação para o e-mail cadastrado para que
            você possa definir uma nova senha com segurança.
          </p>

          <ul className="register-brand-list">
            <li>• Processo simples e seguro</li>
            <li>• Link com tempo limitado de uso</li>
            <li>• Sem alterar suas configurações de conta</li>
          </ul>
        </div>

        {/* Lado direito - conteúdo principal */}
        <div className="register-box">
          {emailSent ? (
            <>
              <div className="register-header">
                <h1>Email enviado!</h1>
                <p>
                  Enviamos um link de recuperação para{" "}
                  <strong>{email}</strong>.
                </p>
                <p className="forgot-instructions">
                  Verifique sua caixa de entrada e também a pasta de spam.  
                  O link é válido por tempo limitado.
                </p>
              </div>

              <button
                onClick={handleBackToLogin}
                className="register-button"
              >
                Voltar para login
              </button>

              <div className="register-login-link" style={{ marginTop: "16px" }}>
                <p>Não recebeu o e-mail?</p>
                <button
                  type="button"
                  onClick={handleTryAgain}
                  className="link-button"
                >
                  Tentar novamente
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="register-header">
                <h1>Esqueceu a senha?</h1>
                <p>
                  Informe o e-mail cadastrado para enviarmos um link de
                  recuperação de acesso.
                </p>
              </div>

              {errors.submit && (
                <div className="register-error-banner">{errors.submit}</div>
              )}

              <form onSubmit={handleSubmit} className="register-form">
                <div className="input-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? "error" : ""}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                  <span className="input-hint">
                    Use o mesmo e-mail utilizado no cadastro da sua conta.
                  </span>
                </div>

                <button
                  type="submit"
                  className="register-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar link de recuperação"}
                </button>
              </form>

              <div className="register-login-link">
                <p>Lembrou da senha?</p>
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="link-button"
                  disabled={isLoading}
                >
                  Voltar para login
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
