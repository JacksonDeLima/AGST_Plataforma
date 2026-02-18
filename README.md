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
