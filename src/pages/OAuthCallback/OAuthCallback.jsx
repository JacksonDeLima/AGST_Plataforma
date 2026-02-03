import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function OAuthCallback() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { exchangeCodeForTokens, bootstrap } = useAuth();

  const [msg, setMsg] = useState("Processando login...");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const qs = new URLSearchParams(search);
        const code = qs.get("code");
        const state = qs.get("state");

        if (!code) {
          setMsg("Callback sem code. Verifique o fluxo OAuth.");
          return;
        }

        setMsg("Trocando code por tokens...");
        await exchangeCodeForTokens({ code, state });

        setMsg("Validando sessÃ£o...");
        const b = await bootstrap();

        if (!alive) return;

        if (b?.ok) {
          // tenta respeitar redirect salvo, senÃ£o /ambientes
          const post = sessionStorage.getItem("post_auth_redirect") || "/ambientes";
          sessionStorage.removeItem("post_auth_redirect");
          navigate(post, { replace: true });
        } else {
          setMsg("NÃ£o foi possÃ­vel validar a sessÃ£o apÃ³s o login.");
          navigate("/login", { replace: true });
        }
      } catch (e) {
        console.error("OAuthCallback error:", e);
        if (!alive) return;
        setMsg(e?.message || "Falha ao concluir o login OAuth.");
        navigate("/login", { replace: true });
      }
    })();

    return () => {
      alive = false;
    };
  }, [search, exchangeCodeForTokens, bootstrap, navigate]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Autenticando...</h2>
      <p>{msg}</p>
    </div>
  );
}

