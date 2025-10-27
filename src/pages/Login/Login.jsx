import "./Login.css";

export default function Login() {
  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Login</h1>
        <form>
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
