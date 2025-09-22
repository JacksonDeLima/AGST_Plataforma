const { v4: uuidv4 } = require('uuid');
const EquipmentsRepository = require('../repositories/equipmentsRepository');

class EquipmentsService {
  constructor() { this.repo = new EquipmentsRepository(); }

  async create(payload) {
    if (!payload.location_id) throw Object.assign(new Error('location_id obrigatório'), { status: 400 });
    const item = { id: uuidv4(), location_id: payload.location_id, model: payload.model, btu: payload.btu || null, integration: payload.integration || null, serial: payload.serial || null, ip: payload.ip || null };
    await this.repo.create(item);
    return item;
  }

  async list() { return this.repo.findAll(); }

  async getById(id) {
    const row = await this.repo.findById(id);
    if (!row) throw Object.assign(new Error('Equipamento não encontrado'), { status: 404 });
    return row;
  }
}

module.exports = EquipmentsService;
