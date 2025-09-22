const express = require('express');
const authRoutes = require('./auth');
const clientRoutes = require('./clients');
const locationRoutes = require('./locations');
const ruleRoutes = require('./rules');
const reportsRoutes = require('./reports');
const equipmentRoutes = require('./equipments');
const { authenticate } = require('../middlewares/authenticate');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/clients', authenticate, clientRoutes);
router.use('/locations', authenticate, locationRoutes);
router.use('/rules', authenticate, ruleRoutes);
router.use('/equipments', authenticate, equipmentRoutes);
router.use('/reports', authenticate, reportsRoutes);

router.get('/', (req, res) => res.json({ ok: true, version: '1.0' }));

module.exports = router;
