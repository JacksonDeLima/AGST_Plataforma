const express = require('express');
const AuthController = require('../controllers/authController');

const router = express.Router();
const ctrl = new AuthController();

router.post('/register', (req, res, next) => ctrl.register(req, res, next));
router.post('/login', (req, res, next) => ctrl.login(req, res, next));

module.exports = router;
