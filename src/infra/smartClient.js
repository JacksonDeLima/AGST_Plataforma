const axios = require('axios');

class SmartClient {
  constructor() {
    this.baseUrl = process.env.SMART_API_URL || null; // se existir
    this.apiKey = process.env.SMART_API_KEY || null;
    this.axios = axios.create({ baseURL: this.baseUrl || undefined, timeout: 8000 });
  }

  async sendCommand(deviceId, command) {
    // se não houver baseUrl, retornamos um stub-like resposta
    if (!this.baseUrl) {
      return { ok: true, provider: 'smart', deviceId, command, note: 'stub (no SMART_API_URL configured)' };
    }
    try {
      const headers = this.apiKey ? { Authorization: `ApiKey ${this.apiKey}` } : {};
      const resp = await this.axios.post(`/devices/${encodeURIComponent(deviceId)}/commands`, { command }, { headers });
      return { ok: true, provider: 'smart', data: resp.data };
    } catch (err) {
      return { ok: false, provider: 'smart', error: err.message || String(err) };
    }
  }
}

module.exports = SmartClient;
