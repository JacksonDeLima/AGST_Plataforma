// src/pages/auth/Login.jsx
import "../../StylesGlobal/global.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Logo from "../../assets/logo.svg";
import { useAuth } from "../../context/AuthContext.jsx";

import {
  resolveAuthMode,
  loginUser,
  bootstrapOAuthSession,
  redirectToAuthorize,
  logAuthSnapshot,
  getStoredTokens,
  validateToken,
} from "../../services/authService";

const DEBUG_AUTH =
  String(import.meta.env.VITE_DEBUG_AUTH || "").toLowerCase() === "true";

export default function Login() {
  const navigate = useNavigate();
  const mode = useMemo(() => resolveAuthMode(), []);
  const { loginWithPassword, bootstrap: authBootstrap } = useAuth();

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
            navigate("/dashboard", { replace: true });
          },
        });
      } catch (e) {
        console.error("❌ [Login] OAuth bootstrap error:", e);
        if (alive) setErrorMsg("Falha ao iniciar sessão OAuth. Tente novamente.");
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
    if (!email.trim()) errors.email = "Email é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Email inválido";
    if (!password) errors.password = "Senha é obrigatória";
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

    // ✅ Agora autentica pelo AuthContext (não pelo authService)
    const result = await loginWithPassword(email, password);

    setIsLoading(false);

    if (!result.ok) {
      setErrorMsg(result.error?.data?.error || result.error?.message || "Erro ao autenticar.");
      return;
    }

    navigate("/dashboard", { replace: true });
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

          <h2 className="auth-brand-title">Acesse o Brise Cloud</h2>

          <p className="auth-brand-subtitle">
            {mode === "oauth"
              ? "Autenticação via OAuth2 (produção / same-origin)."
              : "Modo DEV (localhost): login por e-mail/senha. OAuth fica pronto para testes futuros."}
          </p>

          <ul className="auth-brand-list">
            <li>
              • Modo atual: <b>{mode}</b>
            </li>
            <li>• Tokens no localStorage</li>
            <li>• Authorization: Bearer access_token</li>
          </ul>

          {DEBUG_AUTH && (
            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
              🔎 DEBUG_AUTH ligado (tokens completos no console)
            </div>
          )}
        </div>

        {/* Lado direito - formulário */}
        <div className="auth-box">
          <div className="auth-header">
            <h1>Entrar</h1>
            <p>
              {mode === "oauth"
                ? "Verificando sessão e redirecionando se necessário..."
                : "Entre com seu usuário e senha (modo local)."}
            </p>
          </div>

          {booting && (
            <div className="auth-info-banner">Verificando sessão OAuth...</div>
          )}

          {errorMsg && <div className="auth-error-banner">{errorMsg}</div>}

          {mode === "oauth" ? (
            <button
              type="button"
              className="btn-primary"
              onClick={redirectToAuthorize}
              disabled={disabled}
            >
              Entrar com Brise (OAuth)
            </button>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="input-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="seu.email@empresa.com"
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
                  {/* ✅ label + link alinhados (mais profissional) */}
                  <div className="auth-label-row">
                    <label htmlFor="password">Senha</label>


                  </div>

                  <input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
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
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </button>
              </form>

              {/* <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    console.warn(
                      "OAuth em localhost não persiste tokens por origem. Para testar, rode o app no mesmo domínio do backend."
                    );
                    redirectToAuthorize();
                  }}
                  disabled={disabled}
                >
                  Testar OAuth (requer same-origin)
                </button>
              </div> */}
            </>
          )}

          <div className="auth-login-link">
            <span>Não tem uma conta?</span>
            <button
              type="button"
              className="link-button"
              onClick={() => navigate("/criarConta")}
              disabled={disabled}
            >
              Criar conta
            </button>
          </div>

          <div className="auth-login-link">
            <span>Esqueceu a senha?</span>
            <button
              type="button"
              className="link-button"
              onClick={() => navigate("/EsqueciSenha")}
              disabled={disabled}
            >
              Esqueci minha senha
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
