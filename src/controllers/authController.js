const AuthService = require('../services/authService');

class AuthController {
  constructor() {
    this.service = new AuthService();
  }

  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const user = await this.service.register({ name, email, password });
      res.status(201).json(user);
    } catch (err) { next(err); }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const token = await this.service.login({ email, password });
      res.json({ token });
    } catch (err) { next(err); }
  }
}

module.exports = AuthController;
