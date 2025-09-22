const ReportsService = require('../services/reportsService');

class ReportsController {
  constructor() { this.service = new ReportsService(); }

  async equipmentsCsv(req, res, next) {
    try {
      const csv = await this.service.equipmentsCsv();
      res.setHeader('Content-Disposition', 'attachment; filename="equipments.csv"');
      res.setHeader('Content-Type', 'text/csv');
      res.send(csv);
    } catch (err) { next(err); }
  }

  async logsCsv(req, res, next) {
    try {
      const csv = await this.service.logsCsv();
      res.setHeader('Content-Disposition', 'attachment; filename="logs.csv"');
      res.setHeader('Content-Type', 'text/csv');
      res.send(csv);
    } catch (err) { next(err); }
  }
}

module.exports = ReportsController;
