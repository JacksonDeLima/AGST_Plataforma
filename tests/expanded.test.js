const DeviceClients = require('../src/infra/deviceClients');
const ReportsService = require('../src/services/reportsService');

describe('Infra device clients e reports', () => {
  it('deve enviar comando para brise e smart', async () => {
    const clients = new DeviceClients();
    const r1 = await clients.sendCommand('brise-123', { cmd: 'power_on' });
    expect(r1.ok).toBe(true);
    expect(r1.provider).toBe('brise');

    const r2 = await clients.sendCommand('smart-abc', { cmd: 'reboot' });
    expect(r2.ok).toBe(true);
    expect(r2.provider).toBe('smart');

    const r3 = await clients.sendCommand('unknown-1', { cmd: 'x' });
    expect(r3.ok).toBe(false);
  });

  it('deve gerar CSV (mesmo vazio)', async () => {
    const svc = new ReportsService();
    const csv1 = await svc.equipmentsCsv();
    expect(typeof csv1).toBe('string');
    const csv2 = await svc.logsCsv();
    expect(typeof csv2).toBe('string');
  });
});
