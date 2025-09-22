# AGST - Node.js MVC (exemplo)
Projeto exemplo estruturado em MVC com princípios S.O.L.I.D. e SQLite embutido.
Baseado na especificação enviada pelo usuário. (arquivo: Especificação dos Requisitos AGST.pdf) fileciteturn0file0

## O que existe neste pacote
- Estrutura MVC (src/controllers, src/services, src/repositories, src/models, src/routes)
- Autenticação JWT
- Banco SQLite inicializado automaticamente
- Testes com Jest (ex.: testes de serviços)
- Dockerfile e docker-compose para deploy local
- Scripts npm para start/dev/test

## Instalação local
1. Copie `.env.example` para `.env` e ajuste as variáveis.
2. `npm install`
3. `npm run start` (ou `npm run dev`)

## Testes
`npm run test`

## Deploy
- Docker: `docker build -t agst-node-mvc . && docker run -p 3000:3000 --env-file .env agst-node-mvc`
- Docker Compose: `docker-compose up --build`

## Notas sobre arquitetura
- Controllers: recebem requisições e validam dados mínimos.
- Services: lógica de negócio (SRP - cada serviço tem responsabilidade única).
- Repositories: abstraem acesso ao banco (Interface único ponto de mudança).
- Models: contratos/DTOs e conversões.
- Middleware: autenticação/erros/logging.
- Segue princípios S.O.L.I.D.: Single Responsibility, Open/Closed (serviços extensíveis), Liskov via interfaces simples, Interface Segregation via pequenos clientes/repositories, Dependency Inversion usando injeção simples via parâmetros.


## Observações finais
- Este é um exemplo de projeto com layout e contratos para evoluir conforme a especificação completa.
- Para implementar funcionalidades de envio de comandos a dispositivos (BRISE / SMART), crie serviços que encapsulem protocolos (infrared, REST APIs dos fabricantes) e injete via interfaces (ex.: DeviceClient).
- Para relatórios e exportação, adicione camadas de "reporting" que consultam o histórico e geram arquivos usando bibliotecas (pdfkit, exceljs).

## Novas funcionalidades adicionadas (expandido)
- Entidades: locations, rules, alarms, reports (histórico)
- Endpoints:
  - `POST /api/locations` `{ client_id, name, address }`
  - `GET /api/locations`
  - `POST /api/rules` `{ location_id, name, condition, action }`
  - `GET /api/rules`
  - `POST /api/rules/:id/trigger` `{ context }` — força execução da regra (gera alarm e pode enviar comando)
  - `GET /api/reports/equipments/csv` — export CSV de equipamentos
  - `GET /api/reports/logs/csv` — export CSV de logs
- `src/infra/deviceClients.js` — implementação stub de clientes Brise e Smart; use para criar integração real posteriormente.
- Testes adicionais em `tests/expanded.test.js`

## Próximos passos que eu já pude implementar parcialmente
- Simulação de envio de comando a dispositivos (stubs). Em produção substitua por clientes reais que implementem os protocolos necessários.
- Exporte relatórios em CSV; para PDF/XLSX adicione bibliotecas (pdfkit/exceljs).

## Integração com BRISE (configuração)
Para usar o cliente real da BRISE configure no `.env` as variáveis apropriadas:

- `BRISE_API_URL` (opcional) - URL base da API (padrão: https://briseapi.agst.com.br)
- `BRISE_API_KEY` (opcional) - chave de API se disponível
- ou `BRISE_API_USER` / `BRISE_API_PASSWORD` - credenciais de login se a API usar autenticação via credenciais

Exemplo `.env`:
```
BRISE_API_URL=https://briseapi.agst.com.br
BRISE_API_KEY=seu_token_aqui
```
Se não forem fornecidas credenciais, o cliente BRISE lançará erro ao tentar chamar endpoints protegidos.
A implementação assume os endpoints REST típicos vistos em Redoc: `POST /auth/login` e `POST /devices/{deviceId}/commands`.
Ajuste `src/infra/briseClient.js` caso o contrato real seja diferente.
