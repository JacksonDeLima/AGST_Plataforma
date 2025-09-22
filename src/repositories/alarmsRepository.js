const { openDb } = require('../infra/database');

class AlarmsRepository {
  async create(item) {
    const db = await openDb();
    await db.run('INSERT INTO alarms (id,rule_id,level,message,metadata) VALUES (?,?,?,?,?)', [item.id, item.rule_id, item.level, item.message, item.metadata]);
    await db.close();
  }

  async findAll() {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM alarms ORDER BY created_at DESC');
    await db.close();
    return rows;
  }
}

module.exports = AlarmsRepository;
