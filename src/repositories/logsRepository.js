const { openDb } = require('../infra/database');

class LogsRepository {
  async create(log) {
    const db = await openDb();
    await db.run('INSERT INTO logs (id,user_id,action,payload) VALUES (?,?,?,?)', [log.id, log.user_id, log.action, log.payload]);
    await db.close();
  }
}

module.exports = LogsRepository;
