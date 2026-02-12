// src/pages/auth/Login.jsx
import "../../StylesGlobal/global.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Logo from "../../assets/logo.svg";
import { useAuth } from "../../context/AuthContext.jsx";

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
          setErrorMsg("Falha ao iniciar sessão OAuth. Tente novamente.");
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
    if (!email.trim()) errors.email = "E-mail é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "E-mail inválido";
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
      setErrorMsg(
        result.error?.data?.error ||
        result.error?.message ||
        "Erro ao autenticar."
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

          <h2 className="auth-brand-title">Bem-vindo ao Brise Cloud</h2>

          <p className="auth-brand-subtitle">
            {mode === "oauth"
              ? "Faça login com sua conta para acessar seus ambientes e dispositivos."
              : "Acesse sua conta com e-mail e senha para continuar."}
          </p>

          <ul className="auth-brand-list">
            <li>• Acesse seus ambientes com segurança</li>
            <li>• Visualize e gerencie seus dispositivos</li>
            <li>• Tenha seus dados sincronizados na nuvem</li>
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
            <h1>Entrar</h1>
            <p>
              {mode === "oauth"
                ? "Preparando seu acesso... Se necessário, você será redirecionado para fazer login."
                : "Informe seu e-mail e senha para acessar sua conta."}
            </p>
          </div>

          {booting && (
            <div className="auth-info-banner">
              Preparando seu acesso, aguarde...
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
              Continuar
            </button>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="input-group">
                  <label htmlFor="email">E-mail</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="seuemail@empresa.com"
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
              Recuperar senha
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
