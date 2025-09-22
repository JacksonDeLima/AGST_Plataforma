const { openDb } = require('../infra/database');

class ClientsRepository {
  async create(client) {
    const db = await openDb();
    await db.run('INSERT INTO clients (id,name,cnpj,contact) VALUES (?,?,?,?)', [client.id, client.name, client.cnpj, client.contact]);
    await db.close();
  }

  async findAll() {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM clients ORDER BY created_at DESC');
    await db.close();
    return rows;
  }

  async findById(id) {
    const db = await openDb();
    const row = await db.get('SELECT * FROM clients WHERE id = ?', [id]);
    await db.close();
    return row;
  }
}

module.exports = ClientsRepository;
