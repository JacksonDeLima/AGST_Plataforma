const { v4: uuidv4 } = require('uuid');
const RulesRepository = require('../repositories/rulesRepository');
const AlarmsRepository = require('../repositories/alarmsRepository');
const DeviceClients = require('../infra/deviceClients');

class RulesService {
  constructor() {
    this.repo = new RulesRepository();
    this.alarms = new AlarmsRepository();
    this.deviceClients = new DeviceClients();
  }

  async create(payload) {
    if (!payload.location_id || !payload.name) throw Object.assign(new Error('location_id e name obrigatórios'), { status: 400 });
    const item = { id: uuidv4(), location_id: payload.location_id, name: payload.name, condition: payload.condition || null, action: payload.action || null, active: payload.active?1:0 };
    await this.repo.create(item);
    return item;
  }

  async list() { return this.repo.findAll(); }

  async trigger(id, ctx) {
    const rule = await this.repo.findById(id);
    if (!rule) throw Object.assign(new Error('Regra não encontrada'), { status: 404 });
    // Simula avaliação da condição - neste exemplo, sempre aciona
    const alarm = { id: uuidv4(), rule_id: rule.id, level: 'warning', message: `Regra ${rule.name} acionada`, metadata: JSON.stringify(ctx || {}) };
    await this.alarms.create(alarm);
    // executar ação (ex.: comando para equipamento)
    if (rule.action) {
      // regra.action espera um objeto { deviceId, command }
      try {
        const payload = JSON.parse(rule.action);
        await this.deviceClients.sendCommand(payload.deviceId, payload.command);
      } catch (e) {
        // ignorar erro de parsing
      }
    }
    return { ok: true, alarm };
  }
}

module.exports = RulesService;
