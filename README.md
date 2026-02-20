# AGST Plataforma — Frontend (Brise Cloud)

Frontend web da plataforma AGST/Brise Cloud. Este projeto é a camada de interface que orquestra autenticação, corporações, ambientes, equipamentos, automações e relatórios, consumindo a API Brise Cloud.

## Visão geral

O objetivo é oferecer uma experiência clara para operação e gestão de ambientes com climatização inteligente:

- Autenticação por senha ou OAuth
- Gestão de corporações e usuários
- Ambientes (criar, editar, status, manutenção)
- Equipamentos (monitoramento e controle)
- Automações (regras e perfis)
- Relatórios e indicadores

## Tecnologias

- React 19
- Vite 7
- React Router DOM 7
- Recharts (gráficos)
- XLSX (exportação)

## Como executar localmente

Pré-requisitos:

- Node.js 20+
- npm

Instalação:

```bash
npm install
```

Desenvolvimento (HMR):

```bash
npm run dev
```

Build de produção:

```bash
npm run build
```

Pré-visualizar a build:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

## Variáveis de ambiente

O Vite injeta variáveis apenas em tempo de build. Use um arquivo `.env` (ou variáveis no CI) antes do `npm run build`.

Principais variáveis:

- `VITE_BRISE_API_BASE_URL` (obrigatório em produção). Ex.: `https://api.suaempresa.com/api/v3`
- `VITE_AUTH_MODE` (opcional). Valores: `auto` (padrão), `oauth`, `password`
- `VITE_OAUTH_CLIENT_ID` (opcional, recomendado para OAuth). Ex.: `Brise2Web`
- `VITE_OAUTH_REDIRECT_URI` (opcional, recomendado para OAuth). Ex.: `https://app.suaempresa.com/oauth/callback`
- `VITE_DEBUG_AUTH` (opcional). Use `true` para logs detalhados de autenticação
- `VITE_NOTIF_SYNC_URL` (opcional). Endpoint para sincronismo de notificações (se usado)

Exemplo de `.env`:

```bash
VITE_BRISE_API_BASE_URL=https://api.suaempresa.com/api/v3
VITE_AUTH_MODE=oauth
VITE_OAUTH_CLIENT_ID=Brise2Web
VITE_OAUTH_REDIRECT_URI=https://app.suaempresa.com/oauth/callback
```

## Estrutura (alto nível)

- `src/config` — configuração da API e endpoints
- `src/services` — camada de integração com a API (httpClient, authService, etc.)
- `src/pages` — telas
- `src/context` — contextos globais (Auth, Ambiente, Theme, etc.)

## O que precisa no servidor para funcionar de verdade

Este frontend depende de uma API real. Para publicar em produção, garanta:

1. **API Brise Cloud acessível**. A URL deve ser pública e estável e você deve configurar `VITE_BRISE_API_BASE_URL`.
2. **CORS liberado para o domínio do app**. A API precisa aceitar o domínio onde o frontend está hospedado.
3. **HTTPS obrigatório**. Autenticação/OAuth exigem HTTPS.
4. **OAuth configurado (se usado)**. `VITE_OAUTH_REDIRECT_URI` precisa estar registrado no provedor e a rota `/oauth/callback` deve estar liberada no front.
5. **SPA fallback**. Rotas do React precisam cair em `index.html`.
6. **Variáveis de ambiente no build**. O Vite embute as variáveis em tempo de build.

### Exemplo de deploy (Nginx)

Compile:

```bash
npm run build
```

Sirva a pasta `dist/` com fallback para SPA:

```nginx
server {
  listen 80;
  server_name app.suaempresa.com;

  root /var/www/agst-frontend/dist;
  index index.html;

  location / {
    try_files $uri /index.html;
  }
}
```

## Observações importantes

- Alguns serviços usam **mock/localStorage** para dados (ex.: ambientes). Para produção, substitua por chamadas reais da API.
- O login é sensível à configuração do `VITE_AUTH_MODE`. Em produção, recomenda-se OAuth.

## Suporte

Se precisar de ajustes ou integração com a API real, descreva o cenário (URL da API, fluxo de login, payloads esperados) que eu ajusto o front para você.

# Integração com Brise Cloud – Guia de Endpoints e Serviços

Este projeto **não possui back-end próprio**: o front-end se comunica diretamente com a **API Brise Cloud**.

Para evitar URLs e endpoints espalhados por várias telas, usamos uma **camada de serviços** no front-end. Essa camada funciona como um “mini back-end” dentro do React, organizando:

1. **Configuração da API** – URL base centralizada  
2. **Mapa de endpoints** – lista de caminhos da API em um único arquivo  
3. **Cliente HTTP genérico** – função para fazer requisições (`fetch`) padronizadas  
4. **Serviços de domínio** – funções de alto nível (ex.: `loginUser`, `createUser`) usadas pelos componentes React  

Dessa forma, se um endpoint ou a URL base mudar, ajustamos em **poucos arquivos**, e não em todas as telas.

---

## Visão Geral – Fluxo de Chamada da API

1. A tela (componente React) chama uma função de serviço, como `loginUser()`.  
2. O serviço usa o **mapa de endpoints** (`endpoints.js`) para descobrir o caminho correto, por exemplo `"/users/login"`.  
3. O serviço chama o **cliente HTTP genérico** (`httpClient.js`), que:  
   - monta a URL completa: `API_BASE_URL + caminho`;  
   - adiciona headers padrão e token (quando existir);  
   - trata a resposta JSON e padroniza erros.  
4. O serviço devolve o resultado já tratado para a tela (componente).  
5. A tela exibe mensagens, navega ou atualiza estado baseado nessa resposta.

---

## Estrutura de Pastas (Relacionada à API)

```text
src/
  config/
    apiConfig.js     # URL base da API
    endpoints.js     # Mapa central de endpoints
  services/
    httpClient.js    # Cliente HTTP genérico
    authService.js   # Serviços de autenticação (login, criar usuário, etc.)
    deviceService.js # (exemplo) Serviços de dispositivos
    ...              # Outros serviços (corporationService, etc.)
  pages/
    Login/
      Login.jsx      # Tela de login usando authService
    Devices/
      DevicesList.jsx# Tela exemplo usando deviceService
    ...              # Outras telas
```

## 1. Configuração da API Arquivo: src/config/apiConfig.js Centraliza a URL base da API (sandbox ou produção). Pode ser configurada via variável de ambiente.
```jsx
// src/config/apiConfig.js
export const API_BASE_URL =
  import.meta.env.VITE_BRISE_API_BASE_URL ||
  "https://sandbox.brise.agst.com.br:8443/api/v3";
 ```

Exemplo de .env:
```bash
 VITE_BRISE_API_BASE_URL=https://sandbox.brise.agst.com.br:8443/api/v3 ... Se a AGST alterar a URL ou a versão da API (ex.: /api/v4), basta ajustar aqui ou na variável de ambiente.
 ```

## 2. Mapa de Endpoints

Arquivo: `src/config/endpoints.js`

Este arquivo centraliza **todos os caminhos** usados na API, agrupados por domínio (users, corporations, etc.).

```jsx
export const endpoints = {
  users: {
    create: "/users",
    activate: "/users/activate",
    resendActivation: "/users/resend-activation",
    login: "/users/login",
    validateToken: "/users/validate-token",
  },
  corporations: {
    list: "/corporations",
    create: "/corporations",
    details: (id) => `/corporations/${id}`,
    members: (id) => `/corporations/${id}/members`,
  },
  // Exemplo de novo domínio (devices):
  devices: {
    list: "/devices",
    create: "/devices",
    details: (id) => `/devices/${id}`,
  },
};
```

Regras importantes:

-   **Nunca** usar strings de endpoint direto nas telas (ex.: `"/users/login"`).
    
-   Sempre registrar primeiro em `endpoints.js` e depois usar esse mapa nos serviços.
    

----------

## 3. Cliente HTTP Genérico

Arquivo: `src/services/httpClient.js`

Este cliente é responsável por:

-   Montar a URL completa (`API_BASE_URL + path`);
    
-   Adicionar headers padrão (`Content-Type`, `Authorization` se houver token);
    
-   Tratar a resposta JSON;
    
-   Padronizar o lançamento de erros.
    
```jsx
// src/services/httpClient.js
import { API_BASE_URL } from "../config/apiConfig";

async function httpRequest(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  // Se existir access_token, envia no header Authorization
  const accessToken = localStorage.getItem("access_token");
  if (accessToken) {
    defaultHeaders["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    // resposta vazia ou não-JSON
  }

  if (!response.ok) {
    const apiError = data.error || data.message;
    const error = new Error(apiError || "Erro na requisição");
    error.status = response.status;
    throw error;
  }

  return data;
}

export { httpRequest };

```
----------

## 4. Serviços de Domínio

Os serviços encapsulam chamadas à API para cada “área” do sistema (autenticação, corporações, dispositivos etc.).

### Exemplo: Serviço de Autenticação

Arquivo: `src/services/authService.js`
```jsx
// src/services/authService.js
import { httpRequest } from "./httpClient";
import { endpoints } from "../config/endpoints";

export async function loginUser({ email, password }) {
  try {
    const data = await httpRequest(endpoints.users.login, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

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
    console.error("Erro no login:", error);

    const msg =
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("NetworkError") ||
      error.message?.includes("ERR_CONNECTION")
        ? "Não foi possível conectar ao servidor. Verifique sua conexão ou contate o administrador."
        : mapLoginError(error);

    return { success: false, error: msg };
  }
}

function mapLoginError(error) {
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

```
----------

## 5. Uso nos Componentes React

As telas **não conhecem** a URL da API nem os endpoints. Elas apenas usam as funções dos serviços.

Exemplo: tela de login usando `loginUser`:

```jsx
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

    const result = await loginUser({ email, password });

    setIsLoading(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setErrorMsg(result.error);
    }
  }
  } // ... JSX omitido para brevidade }` 
```
----------

## Como Adicionar um Novo Endpoint

Sempre que for usar um endpoint novo da API, siga **este passo a passo**:

### Passo 1 – Registrar o endpoint em `endpoints.js`

Exemplo: supor que a API tem os endpoints:

-   `GET /devices` → lista dispositivos
    
-   `POST /devices` → cria um dispositivo
    
-   `GET /devices/:id` → detalhes de um dispositivo
    

Adicione em `src/config/endpoints.js`:
```jsx
    export const endpoints = {
    // ... já existentes

    devices: {
        list: "/devices",
        create: "/devices",
        details: (id) => `/devices/${id}`,
    },
    };
```
### Passo 2 – Criar (ou atualizar) o serviço correspondente

Crie o arquivo `src/services/deviceService.js`:
```jsx
// src/services/deviceService.js
    import { httpRequest } from "./httpClient";
    import { endpoints } from "../config/endpoints";

    export async function listDevices() {
    return httpRequest(endpoints.devices.list, {
        method: "GET",
    });
    }

    export async function createDevice(deviceData) {
    return httpRequest(endpoints.devices.create, {
        method: "POST",
        body: JSON.stringify(deviceData),
    });
    }

    export async function getDeviceDetails(id) {
    return httpRequest(endpoints.devices.details(id), {
        method: "GET",
    });
    }
```
### Passo 3 – Consumir o serviço na tela

Exemplo de tela que lista dispositivos:
```jsx
    // src/pages/Devices/DevicesList.jsx 
    import { useEffect, useState } from  "react";
    import { listDevices } from  "../../services/deviceService"; 
    
    export default function DevicesList() {
    const [devices, setDevices] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        async function loadDevices() {
        try {
            const data = await listDevices();
            setDevices(data);
        } catch (error) {
            console.error(error);
            setErrorMsg("Erro ao carregar dispositivos.");
        }
        }

        loadDevices();
    }, []);

    return (
        <div>
        <h1>Dispositivos</h1>
        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
        <ul>
            {devices.map((dev) => (
            <li key={dev.id}>{dev.name}</li>
            ))}
        </ul>
        </div>
    );
    }` 
```
----------

### Resumo rápido para o time

1.  **Nunca** usar URLs de API direto na tela;
    
2.  **Sempre** registrar o caminho em `config/endpoints.js`;
    
3.  Criar/usar um **serviço** em `services/*Service.js` que chame o `httpRequest`;
    
4.  Nas telas, usar apenas as funções dos serviços (`loginUser`, `listDevices`, etc.).
    

Seguindo esse padrão, o código fica mais organizado, reaproveitável e fácil de manter por toda a equipe.
