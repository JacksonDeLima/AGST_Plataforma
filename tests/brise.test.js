const BriseClient = require('../src/infra/briseClient');
const SmartClient = require('../src/infra/smartClient');

describe('BRISE and SMART clients (instantiation)', () => {
  it('instancia clientes sem crash', () => {
    const b = new BriseClient();
    const s = new SmartClient();
    expect(b).toBeTruthy();
    expect(s).toBeTruthy();
  });
});
