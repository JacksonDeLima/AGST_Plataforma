const RulesService = require('../services/rulesService');

class RulesController {
  constructor() { this.service = new RulesService(); }

  async create(req, res, next) {
    try {
      const payload = req.body;
      const item = await this.service.create(payload);
      res.status(201).json(item);
    } catch (err) { next(err); }
  }

  async list(req, res, next) {
    try {
      const rows = await this.service.list();
      res.json(rows);
    } catch (err) { next(err); }
  }

  async trigger(req, res, next) {
    try {
      const result = await this.service.trigger(req.params.id, req.body);
      res.json(result);
    } catch (err) { next(err); }
  }
}

module.exports = RulesController;
