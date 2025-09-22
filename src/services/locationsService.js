const { v4: uuidv4 } = require('uuid');
const LocationsRepository = require('../repositories/locationsRepository');
const LogsRepository = require('../repositories/logsRepository');

class LocationsService {
  constructor() {
    this.repo = new LocationsRepository();
    this.logs = new LogsRepository();
  }

  async create(payload) {
    if (!payload.client_id || !payload.name) throw Object.assign(new Error('client_id e name são obrigatórios'), { status: 400 });
    const item = { id: uuidv4(), client_id: payload.client_id, name: payload.name, address: payload.address || null };
    await this.repo.create(item);
    await this.logs.create({ id: uuidv4(), user_id: null, action: 'create_location', payload: JSON.stringify(item) });
    return item;
  }

  async list() { return this.repo.findAll(); }

  async getById(id) {
    const row = await this.repo.findById(id);
    if (!row) throw Object.assign(new Error('Location não encontrado'), { status: 404 });
    return row;
  }
}

module.exports = LocationsService;
