const ClientsService = require('../services/clientsService');

class ClientsController {
  constructor() { this.service = new ClientsService(); }

  async create(req, res, next) {
    try {
      const payload = req.body;
      const client = await this.service.create(payload, req.user);
      res.status(201).json(client);
    } catch (err) { next(err); }
  }

  async list(req, res, next) {
    try {
      const rows = await this.service.list();
      res.json(rows);
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const item = await this.service.getById(req.params.id);
      res.json(item);
    } catch (err) { next(err); }
  }
}

module.exports = ClientsController;
