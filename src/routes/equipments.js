const express = require('express');
const EquipmentsController = require('../controllers/equipmentsController');

const router = express.Router();
const ctrl = new EquipmentsController();

router.post('/', (req, res, next) => ctrl.create(req, res, next));
router.get('/', (req, res, next) => ctrl.list(req, res, next));
router.get('/:id', (req, res, next) => ctrl.getById(req, res, next));

module.exports = router;
