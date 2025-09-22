const express = require('express');
const RulesController = require('../controllers/rulesController');
const router = express.Router();
const ctrl = new RulesController();

router.post('/', (req, res, next) => ctrl.create(req, res, next));
router.get('/', (req, res, next) => ctrl.list(req, res, next));
router.post('/:id/trigger', (req, res, next) => ctrl.trigger(req, res, next));

module.exports = router;
