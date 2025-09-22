const { openDb } = require('../infra/database');

class ReportsService {
  async equipmentsCsv() {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM equipments ORDER BY created_at DESC');
    await db.close();
    const headers = ['id','location_id','model','btu','integration','serial','ip','created_at'];
    const lines = [headers.join(',')];
    rows.forEach(r => {
      lines.push([r.id,r.location_id,r.model,r.btu,r.integration,r.serial,r.ip,r.created_at].map(v => v===null?'':`"${String(v).replace(/"/g,'""')}"`).join(','));
    });
    return lines.join('\n');
  }

  async logsCsv() {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM logs ORDER BY created_at DESC');
    await db.close();
    const headers = ['id','user_id','action','payload','created_at'];
    const lines = [headers.join(',')];
    rows.forEach(r => {
      lines.push([r.id,r.user_id,r.action,r.payload,r.created_at].map(v => v===null?'':`"${String(v).replace(/"/g,'""')}"`).join(','));
    });
    return lines.join('\n');
  }
}

module.exports = ReportsService;
