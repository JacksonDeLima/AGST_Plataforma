const express = require('express');
const ReportsController = require('../controllers/reportsController');
const router = express.Router();
const ctrl = new ReportsController();

router.get('/equipments/csv', (req, res, next) => ctrl.equipmentsCsv(req, res, next));
router.get('/logs/csv', (req, res, next) => ctrl.logsCsv(req, res, next));

module.exports = router;
