const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const UsersRepository = require('../repositories/usersRepository');

class AuthService {
  constructor() {
    this.repo = new UsersRepository();
  }

  async register({ name, email, password }) {
    if (!email || !password) throw Object.assign(new Error('email e password são obrigatórios'), { status: 400 });
    const exists = await this.repo.findByEmail(email);
    if (exists) throw Object.assign(new Error('Usuário já existe'), { status: 409 });
    const hash = await bcrypt.hash(password, 10);
    const user = { id: uuidv4(), name, email, password_hash: hash, role: 'admin' };
    await this.repo.create(user);
    return { id: user.id, name: user.name, email: user.email };
  }

  async login({ email, password }) {
    const user = await this.repo.findByEmail(email);
    if (!user) throw Object.assign(new Error('Usuário não encontrado'), { status: 404 });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw Object.assign(new Error('Senha inválida'), { status: 401 });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'troque_por_uma_chave_segura', { expiresIn: '8h' });
    return token;
  }
}

module.exports = AuthService;
