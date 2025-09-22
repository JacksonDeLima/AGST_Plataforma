const { v4: uuidv4 } = require('uuid');
const ClientsRepository = require('../repositories/clientsRepository');
const LogsRepository = require('../repositories/logsRepository');

class ClientsService {
  constructor() {
    this.repo = new ClientsRepository();
    this.logs = new LogsRepository();
  }

  async create(payload, user) {
    if (!payload.name) throw Object.assign(new Error('Nome do cliente é obrigatório'), { status: 400 });
    const client = { id: uuidv4(), name: payload.name, cnpj: payload.cnpj || null, contact: payload.contact || null };
    await this.repo.create(client);
    await this.logs.create({ id: uuidv4(), user_id: user.id, action: 'create_client', payload: JSON.stringify(client) });
    return client;
  }

  async list() { return this.repo.findAll(); }

  async getById(id) {
    const row = await this.repo.findById(id);
    if (!row) throw Object.assign(new Error('Cliente não encontrado'), { status: 404 });
    return row;
  }
}

module.exports = ClientsService;
