# AGST Plataforma — Versão com cadastro de equipamento

Foram adicionados os seguintes arquivos:
- `src/services/deviceService.ts` — serviço para comunicação com a API (axios).
- `src/pages/CreateDevice.tsx` — página de cadastro de equipamento.
- Rota adicionada: `/equipamentos/cadastrar` (ou integrada ao `App.tsx` existente).

## Como executar localmente

1. Extraia/instale dependências:
   ```bash
   cd path/to/project
   npm install
   ```
   Se estiver usando yarn:
   ```bash
   yarn
   ```

2. Iniciar o projeto:
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

3. Abra no navegador:
   ```
   http://localhost:5173
   ```
   E acesse:
   ```
   http://localhost:5173/equipamentos/cadastrar
   ```

## Notas importantes

- A API base está em `https://briseapi.agst.com.br`. Se a sua API exigir autenticação, adicione o token no `src/services/deviceService.ts`, por exemplo:
  ```ts
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  ```
- Ajuste os campos do payload em `CreateDevicePayload` de acordo com o que a API exige.
- Se o projeto usar uma estrutura diferente (monorepo, pasta `web`, etc.), mova os arquivos para o local correto.



## Novas funcionalidades adicionadas

- Layout global (`src/components/Layout.tsx`) para combinar o visual do projeto.
- Validação de formulários com **React Hook Form** + **Zod** (CreateDevice e EditDevice).
- Autenticação via **Bearer token**: o token será lido de `localStorage.getItem('token')`.
- CRUD completo: listagem (`/equipamentos`), cadastro, edição e exclusão.

## Como fornecer o token

Defina o token no console do navegador (ou para testes):
```js
localStorage.setItem('token', 'SEU_TOKEN_AQUI');
```

## Dependências novas
- react-hook-form
- zod
- @hookform/resolvers

Instale tudo com `npm install`.

