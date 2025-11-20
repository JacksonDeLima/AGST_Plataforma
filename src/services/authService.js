// src/services/authService.js
import { httpRequest } from "./httpClient";
import { endpoints } from "../config/endpoints";


// ###################################### Login  ##########################################################

export async function loginUser({ email, password }) {
    try {
        const data = await httpRequest(endpoints.users.login, {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });

        // mesmo comportamento que você já tinha
        if (data.access_token) {
            localStorage.setItem("access_token", data.access_token);
        }
        if (data.refresh_token) {
            localStorage.setItem("refresh_token", data.refresh_token);
        }
        if (data.expires_in) {
            const expiresAt = Date.now() + data.expires_in * 1000;
            localStorage.setItem("token_expires_at", String(expiresAt));
        }

        return { success: true };
    } catch (error) {
        console.error("❌ Erro no login:", error);

        const msg =
            error.message?.includes("Failed to fetch") ||
                error.message?.includes("NetworkError") ||
                error.message?.includes("ERR_CONNECTION")
                ? "Não foi possível conectar ao servidor. Verifique sua conexão ou contate o administrador."
                : tratarErroDeLogin(error);

        return { success: false, error: msg };
    }
}

function tratarErroDeLogin(error) {
    if (!error.status) return error.message || "Erro inesperado ao fazer login.";

    if (error.status === 400) {
        return error.message || "Dados inválidos. Verifique as informações.";
    }

    if (error.status === 401) {
        if (error.message === "USER_PENDING") {
            return "Sua conta ainda não foi ativada. Verifique seu e-mail para ativar o acesso.";
        }
        if (error.message === "USER_BLOCKED") {
            return "Seu usuário está bloqueado. Entre em contato com o administrador.";
        }
        return error.message || "Email ou senha incorretos.";
    }

    return error.message || "Erro ao autenticar. Tente novamente.";
}

export async function createUser({ email, full_name, password }) {
    return httpRequest(endpoints.users.create, {
        method: "POST",
        body: JSON.stringify({ email, full_name, password }),
    });
}

export async function activateUser({ email, token }) {
    return httpRequest(endpoints.users.activate, {
        method: "POST",
        body: JSON.stringify({ email, token }),
    });
}

export async function resendActivation({ email }) {
    return httpRequest(endpoints.users.resendActivation, {
        method: "POST",
        body: JSON.stringify({ email }),
    });
}

// ###################################### CRIAR CONTA  ##########################################################

export async function registerUser({ name, email, password, captchaToken }) {
  const payload = {
    email,
    full_name: name,
    password,
    "h-captcha-response": captchaToken,
  };

  try {
    const data = await httpRequest(endpoints.users.create, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      data: {
        id: data.id,
        status: data.status,
        created_at: data.created_at,
      },
    };
  } catch (error) {
    console.error("❌ Erro na chamada /users:", error);

    const isNetworkError =
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("NetworkError") ||
      error.message?.includes("ERR_CONNECTION");

    let msg;

    if (isNetworkError) {
      msg =
        "Não foi possível conectar ao servidor. Verifique sua conexão ou contate o administrador.";
    } else if (error.status === 400) {
      msg =
        error.message ||
        "Dados inválidos. Verifique as informações e a validação de segurança.";
    } else if (error.status === 409) {
      msg = error.message || "Este email já está cadastrado.";
    } else {
      msg = error.message || "Erro ao criar usuário. Tente novamente.";
    }

    return {
      success: false,
      error: msg,
    };
  }
}

// ###################################### Activation  ##########################################################

export async function activateUserAccount({ email, token }) {
  try {
    const data = await httpRequest(endpoints.users.activate, {
      method: "POST",
      body: JSON.stringify({ email, token }),
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("❌ Erro ao ativar usuário:", error);

    const isNetworkError =
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("NetworkError") ||
      error.message?.includes("ERR_CONNECTION");

    let msg;

    if (isNetworkError) {
      msg =
        "Não foi possível conectar ao servidor. Verifique sua conexão ou contate o administrador.";
    } else if (error.status === 400) {
      msg = error.message || "Dados inválidos. Verifique e-mail e token.";
    } else if (error.status === 404) {
      msg = error.message || "Token inválido ou expirado.";
    } else {
      msg = error.message || "Erro ao ativar usuário.";
    }

    return {
      success: false,
      error: msg,
    };
  }
}

export async function resendActivationLink({ email }) {
  try {
    const data = await httpRequest(endpoints.users.resendActivation, {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    return {
      success: true,
      message:
        data.message ||
        `Novo link de ativação foi enviado para ${email}. Verifique sua caixa de entrada.`,
    };
  } catch (error) {
    console.error("❌ Erro ao reenviar link de ativação:", error);

    const isNetworkError =
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("NetworkError") ||
      error.message?.includes("ERR_CONNECTION");

    let msg;

    if (isNetworkError) {
      msg =
        "Não foi possível conectar ao servidor. Verifique sua conexão ou contate o administrador.";
    } else if (error.status === 404) {
      msg = "Usuário não encontrado ou já ativo.";
    } else if (error.status === 400) {
      msg = error.message || "E-mail inválido.";
    } else {
      msg = error.message || "Erro ao reenviar link de ativação.";
    }

    return {
      success: false,
      error: msg,
    };
  }
}