// src/pages/auth/Activation.jsx
import "../../StylesGlobal/global.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Logo from "../../assets/logo.svg";
import {
  activateUserAccount,
  resendActivationLink,
} from "../../services/authService";

export default function Activation() {
  const location = useLocation();
  const navigate = useNavigate();

  // Pega email/token da URL, ex.: /activation?email=...&token=...
  const searchParams = new URLSearchParams(location.search);
  const emailFromUrl = searchParams.get("email");
  const tokenFromUrl = searchParams.get("token");

  // E-mail vindo do cadastro (state) ou da URL
  const initialEmail = emailFromUrl || location.state?.email || "";

  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [infoMessage, setInfoMessage] = useState("");
  const [hasTriedAutoActivate, setHasTriedAutoActivate] = useState(false);

  const isAutoMode = Boolean(emailFromUrl && tokenFromUrl);

  // Função que usa o serviço para ativar o usuário
  async function handleActivate({ email, token }) {
    setInfoMessage("");
    setErrors({});
    setIsLoading(true);

    const result = await activateUserAccount({ email, token });

    setIsLoading(false);

    if (result.success) {
      alert("Conta ativada com sucesso! Você já pode fazer login.");
      navigate("/");
    } else {
      setErrors({
        submit: result.error || "Erro inesperado ao ativar usuário.",
      });
    }
  }

  // Ao entrar na tela com email+token na URL, ativa automaticamente
  useEffect(() => {
    if (emailFromUrl && tokenFromUrl && !hasTriedAutoActivate) {
      setHasTriedAutoActivate(true);
      setEmail(emailFromUrl);
      setInfoMessage("Ativando sua conta, aguarde...");

      handleActivate({
        email: emailFromUrl,
        token: tokenFromUrl,
      });
    }
  }, [emailFromUrl, tokenFromUrl, hasTriedAutoActivate]);

  // Reenvio de link de ativação – só precisa de e-mail
  async function handleResendToken(e) {
    if (e) e.preventDefault();

    setInfoMessage("");
    setErrors({});

    if (!email.trim()) {
      setErrors({ email: "Informe o e-mail para reenviar o link de ativação." });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: "E-mail inválido." });
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
          "Erro inesperado ao reenviar link de ativação.",
      });
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Lado esquerdo - branding / infos */}
        <div className="register-brand">
          <div className="login-logo">
            <img src={Logo} alt="Logo Brise Cloud" />
          </div>

          <h2 className="register-brand-title">Ative sua conta Brise Cloud</h2>
          <p className="register-brand-subtitle">
            Confirme seu cadastro através do link enviado por e-mail e finalize
            a ativação com segurança.
          </p>

          <ul className="register-brand-list">
            <li>• Ativação rápida via link</li>
            <li>• Validação segura por e-mail</li>
            <li>• Opção de reenviar o link se necessário</li>
          </ul>
        </div>

        {/* Lado direito - conteúdo / formulário */}
        <div className="register-box">
          <div className="register-header">
            <h1>Ativar conta</h1>
            {isAutoMode ? (
              <p>
                Estamos ativando sua conta a partir do link enviado por e-mail.
                Isso pode levar alguns segundos.
              </p>
            ) : (
              <p>
                Enviamos um link de ativação para o seu e-mail. Ao clicar nele,
                sua conta será ativada automaticamente. Caso não tenha recebido,
                você pode reenviar o link abaixo.
              </p>
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

          {/* Quando NÃO veio com token na URL, mostra formulário de reenvio */}
          {!isAutoMode && (
            <form className="register-form" onSubmit={handleResendToken}>
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
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
                {isLoading ? "Reenviando..." : "Reenviar link de ativação"}
              </button>
            </form>
          )}

          <div className="register-login-link">
            <p>Já ativou sua conta?</p>
            <button
              type="button"
              onClick={() => navigate("/")}
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
