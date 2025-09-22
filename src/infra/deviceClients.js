const BriseClient = require('./briseClient');
const SmartClient = require('./smartClient');

class DeviceClients {
  constructor() {
    this.brise = new BriseClient();
    this.smart = new SmartClient();
  }

  // Decide cliente por prefixo do deviceId (brise-*, smart-*) - se quiser outra lógica, adapte
  async sendCommand(deviceId, command) {
    if (!deviceId) return { ok: false, error: 'deviceId obrigatório' };
    if (typeof deviceId !== 'string') deviceId = String(deviceId);
    if (deviceId.startsWith('brise-')) {
      const id = deviceId.replace(/^brise-/, '');
      return this.brise.sendCommand(id, command);
    }
    if (deviceId.startsWith('smart-')) {
      const id = deviceId.replace(/^smart-/, '');
      return this.smart.sendCommand(id, command);
    }
    // fallback: tenta Brise diretamente
    try {
      return await this.brise.sendCommand(deviceId, command);
    } catch (e) {
      return { ok: false, error: 'device not supported' };
    }
  }
}

module.exports = DeviceClients;
