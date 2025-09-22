const { openDb } = require('../infra/database');

class RulesRepository {
  async create(item) {
    const db = await openDb();
    await db.run('INSERT INTO rules (id,location_id,name,condition,action,active) VALUES (?,?,?,?,?,?)', [item.id, item.location_id, item.name, item.condition, item.action, item.active]);
    await db.close();
  }

  async findAll() {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM rules ORDER BY created_at DESC');
    await db.close();
    return rows;
  }

  async findById(id) {
    const db = await openDb();
    const row = await db.get('SELECT * FROM rules WHERE id = ?', [id]);
    await db.close();
    return row;
  }
}

module.exports = RulesRepository;
