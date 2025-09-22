const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const DB_FILE = process.env.DATABASE_FILE || path.join(__dirname, '../../data/agst.sqlite');

async function openDb() {
  return open({ filename: DB_FILE, driver: sqlite3.Database });
}

async function initDb() {
  const db = await openDb();
  await db.exec(`PRAGMA foreign_keys = ON;`);
  // Tabelas essenciais: users, clients, locations, equipments, logs
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      cnpj TEXT,
      contact TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE
    );
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS equipments (
      id TEXT PRIMARY KEY,
      location_id TEXT NOT NULL,
      model TEXT,
      btu INTEGER,
      integration TEXT,
      serial TEXT,
      ip TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(location_id) REFERENCES locations(id) ON DELETE CASCADE
    );
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT,
      payload TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
// tabela rules, alarms, reports/history
  await db.exec(`
    CREATE TABLE IF NOT EXISTS rules (
      id TEXT PRIMARY KEY,
      location_id TEXT NOT NULL,
      name TEXT NOT NULL,
      condition TEXT,
      action TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(location_id) REFERENCES locations(id) ON DELETE CASCADE
    );
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS alarms (
      id TEXT PRIMARY KEY,
      rule_id TEXT NOT NULL,
      level TEXT,
      message TEXT,
      metadata TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(rule_id) REFERENCES rules(id) ON DELETE SET NULL
    );
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      type TEXT,
      payload TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  await db.close();
}

module.exports = { openDb, initDb };
