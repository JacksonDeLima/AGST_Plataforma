const { openDb } = require('../infra/database');

class EquipmentsRepository {
  async create(item) {
    const db = await openDb();
    await db.run('INSERT INTO equipments (id,location_id,model,btu,integration,serial,ip) VALUES (?,?,?,?,?,?,?)', [item.id, item.location_id, item.model, item.btu, item.integration, item.serial, item.ip]);
    await db.close();
  }

  async findAll() {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM equipments ORDER BY created_at DESC');
    await db.close();
    return rows;
  }

  async findById(id) {
    const db = await openDb();
    const row = await db.get('SELECT * FROM equipments WHERE id = ?', [id]);
    await db.close();
    return row;
  }
}

module.exports = EquipmentsRepository;
