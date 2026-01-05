import "../../StylesGlobal/global.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Logo from "../../assets/logo.svg";

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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [booting, setBooting] = useState(mode === "oauth");
  const [isLoading, setIsLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // ✅ OAuth bootstrap (só quando o modo resolver para oauth)
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

    if (DEBUG_AUTH) {
      logAuthSnapshot("Login.jsx - pós login password");

      const { accessToken } = getStoredTokens();
      if (accessToken) {
        const v = await validateToken(accessToken);
        console.group("👤 validate-token (pós-login)");
        console.log("valid:", v.valid);
        console.log("data:", v.data);
        console.groupEnd();
      }
    }


    // ✅ Opção B: password no localhost
    const result = await loginUser({ email, password });

    setIsLoading(false);

    if (!result.success) {
      setErrorMsg(result.error || "Erro ao autenticar.");
      return;
    }

    // ✅ Logs provisórios pós-login
    if (DEBUG_AUTH) {
      logAuthSnapshot("Login.jsx (pós-login password)");

      // opcional: validar token e logar retorno do backend (dados do usuário se houver)
      const { accessToken } = getStoredTokens();
      if (accessToken) {
        const v = await validateToken(accessToken);
        console.group("👤 [Auth Debug] validate-token (pós-login)");
        console.log("valid:", v.valid);
        console.log("data:", v.data);
        console.groupEnd();
      }
    }

    navigate("/dashboard");
  }

  const disabled = booting || isLoading;

  return (
    <div className="auth-container">
      <div className="auth-card">
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
            <li>• Modo atual: <b>{mode}</b></li>
            <li>• Tokens no localStorage</li>
            <li>• Authorization: Bearer access_token</li>
          </ul>

          {DEBUG_AUTH && (
            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
              🔎 DEBUG_AUTH ligado (tokens completos no console)
            </div>
          )}
        </div>

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
                  <label htmlFor="password">Senha</label>
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

              {/* OAuth pronto para testes (mas não persiste no localhost por origem) */}
              <div style={{ marginTop: 12 }}>
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
              </div>
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
        </div>
      </div>

      <footer className="auth-footer">
        © {new Date().getFullYear()} Brise Cloud · AGST
      </footer>
    </div>
  );
}
