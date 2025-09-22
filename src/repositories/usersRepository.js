const { openDb } = require('../infra/database');

class UsersRepository {
  async create(user) {
    const db = await openDb();
    await db.run('INSERT INTO users (id,name,email,password_hash,role) VALUES (?,?,?,?,?)', [user.id, user.name, user.email, user.password_hash, user.role]);
    await db.close();
  }

  async findByEmail(email) {
    const db = await openDb();
    const row = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    await db.close();
    return row;
  }
}

module.exports = UsersRepository;
