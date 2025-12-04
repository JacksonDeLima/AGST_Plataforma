import "../../StylesGlobal/global.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "../../assets/logo.svg";
import { loginUser } from "../../services/authService";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  function validate() {
    const errors = {};
    if (!email.trim()) {
      errors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email inválido";
    }
    if (!password) {
      errors.password = "Senha é obrigatória";
    }
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

    // ⬇️ Agora usamos o serviço centralizado
    const result = await loginUser({ email, password });

    setIsLoading(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setErrorMsg(result.error);
    }
  }

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
            Painel de acesso seguro para administrar integrações e dispositivos.
          </p>

          <ul className="auth-brand-list">
            <li>• API 3.0 com autenticação segura</li>
            <li>• Gestão centralizada de dispositivos</li>
            <li>• Integrações com sistemas de automação</li>
          </ul>
        </div>

        {/* Lado direito - formulário de login */}
        <div className="auth-box">
          <div className="auth-header">
            <h1>Entrar</h1>
            <p>Acesse com seu usuário Brise Cloud.</p>
          </div>

          {errorMsg && <div className="auth-error-banner">{errorMsg}</div>}

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
                disabled={isLoading}
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
                disabled={isLoading}
                className={fieldErrors.password ? "error" : ""}
              />
              {fieldErrors.password && (
                <span className="error-message">{fieldErrors.password}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
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

          <div className="auth-login-link">
            <span>Esqueceu a senha?</span>
            <button
              type="button"
              className="link-button"
              onClick={() => navigate("/esqueciSenha")}
              disabled={isLoading}
            >
              Recuperar acesso
            </button>
          </div>

          <div className="auth-login-link">
            <span>Não tem uma conta?</span>
            <button
              type="button"
              className="link-button"
              onClick={() => navigate("/criarConta")}
              disabled={isLoading}
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
