const axios = require('axios');

/*
  Cliente para API BRISE.
  Observações importantes:
  - Os detalhes reais da API (endpoints, payloads e autenticação) foram consultados via Redoc fornecido,
    mas caso qualquer rota/param seja diferente, ajuste as variáveis de ambiente e os caminhos abaixo.
  - Variáveis de ambiente esperadas:
      BRISE_API_URL (ex: https://briseapi.agst.com.br)
      BRISE_API_KEY  (se a API aceitar API Key) OR
      BRISE_API_USER / BRISE_API_PASSWORD (para autenticação por credenciais)
  - Implementação tenta autenticar via token se disponível, ou usa API_KEY no header Authorization.
*/

class BriseClient {
  constructor(opts = {}) {
    this.baseUrl = process.env.BRISE_API_URL || 'https://briseapi.agst.com.br';
    this.apiKey = process.env.BRISE_API_KEY || null;
    this.user = process.env.BRISE_API_USER || null;
    this.password = process.env.BRISE_API_PASSWORD || null;
    this.token = null;
    this.axios = axios.create({ baseURL: this.baseUrl, timeout: 10000 });
  }

  // Método de autenticação genérico - adapta conforme a API real
  async authenticate() {
    if (this.apiKey) return this.apiKey; // usamos apiKey diretamente
    if (this.token) return this.token;
    if (this.user && this.password) {
      // Exemplo comum: POST /auth/login { username, password } -> { token }
      try {
        const resp = await this.axios.post('/auth/login', { username: this.user, password: this.password });
        if (resp && resp.data && (resp.data.token || resp.data.access_token)) {
          this.token = resp.data.token || resp.data.access_token;
          return this.token;
        }
      } catch (err) {
        // não falhar aqui; será tratado pelo método chamador
        throw new Error('Falha ao autenticar na API Brise: ' + (err.message||err));
      }
    }
    throw new Error('Nenhuma credencial BRISE configurada (BRISE_API_KEY ou BRISE_API_USER/BIRSE_API_PASSWORD)');
  }

  // Envia comando para um dispositivo Brise. Ajuste payload conforme contrato da API real.
  async sendCommand(deviceId, command) {
    // tenta autenticar e executar chamada
    // Permite que `command` seja objeto ou string
    const token = await this.authenticate();
    const headers = {};
    if (this.apiKey) headers['Authorization'] = `ApiKey ${this.apiKey}`;
    else headers['Authorization'] = `Bearer ${token}`;

    // Exemplo: POST /devices/{deviceId}/commands
    try {
      const path = `/devices/${encodeURIComponent(deviceId)}/commands`;
      const resp = await this.axios.post(path, { command }, { headers });
      return { ok: true, provider: 'brise', data: resp.data };
    } catch (err) {
      // retorna forma padrão de erro para o restante da aplicação tratar
      return { ok: false, provider: 'brise', error: err.message || String(err) };
    }
  }

  // Método utilitário para buscar device info
  async getDevice(deviceId) {
    try {
      const token = await this.authenticate();
      const headers = this.apiKey ? { Authorization: `ApiKey ${this.apiKey}` } : { Authorization: `Bearer ${token}` };
      const resp = await this.axios.get(`/devices/${encodeURIComponent(deviceId)}`, { headers });
      return { ok: true, data: resp.data };
    } catch (err) {
      return { ok: false, error: err.message || String(err) };
    }
  }
}

module.exports = BriseClient;
