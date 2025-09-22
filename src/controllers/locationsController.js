const LocationsService = require('../services/locationsService');

class LocationsController {
  constructor() { this.service = new LocationsService(); }

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

  async getById(req, res, next) {
    try {
      const item = await this.service.getById(req.params.id);
      res.json(item);
    } catch (err) { next(err); }
  }
}

module.exports = LocationsController;
