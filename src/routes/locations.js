const express = require('express');
const LocationsController = require('../controllers/locationsController');
const router = express.Router();
const ctrl = new LocationsController();

router.post('/', (req, res, next) => ctrl.create(req, res, next));
router.get('/', (req, res, next) => ctrl.list(req, res, next));
router.get('/:id', (req, res, next) => ctrl.getById(req, res, next));

module.exports = router;
