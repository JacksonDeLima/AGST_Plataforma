import "./Login.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    navigate("/dashboard");
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <input type="email" placeholder="Email" />
          </div>
          <div>
            <input type="password" placeholder="Senha" />
          </div>
          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}
