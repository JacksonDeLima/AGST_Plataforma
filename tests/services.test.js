const AuthService = require('../src/services/authService');
const ClientsService = require('../src/services/clientsService');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

jest.setTimeout(20000);

describe('Serviços básicos', () => {
  it('deve registrar, autenticar e criar cliente', async () => {
    const auth = new AuthService();
    const email = `test+${Date.now()}@example.com`;
    const user = await auth.register({ name: 'Test', email, password: 'senha123' });
    expect(user.email).toBe(email);

    const token = await auth.login({ email, password: 'senha123' });
    expect(typeof token).toBe('string');

    const decodedParts = token.split('.');
    expect(decodedParts.length).toBe(3);

    const clients = new ClientsService();
    // criar cliente usando usuário fictício
    const created = await clients.create({ name: 'Cliente Teste' }, { id: uuidv4() });
    expect(created.name).toBe('Cliente Teste');
  });
});
