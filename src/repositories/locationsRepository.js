const { openDb } = require('../infra/database');

class LocationsRepository {
  async create(item) {
    const db = await openDb();
    await db.run('INSERT INTO locations (id,client_id,name,address) VALUES (?,?,?,?)', [item.id, item.client_id, item.name, item.address]);
    await db.close();
  }

  async findAll() {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM locations ORDER BY created_at DESC');
    await db.close();
    return rows;
  }

  async findById(id) {
    const db = await openDb();
    const row = await db.get('SELECT * FROM locations WHERE id = ?', [id]);
    await db.close();
    return row;
  }
}

module.exports = LocationsRepository;
