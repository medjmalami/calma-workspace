const request = require('supertest');

const AppError = require('../errors/app-error');
const clientService = require('../services/client.service');
const app = require('../app');

describe('POST /clients/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a client and never returns its password hash', async () => {
    clientService.registerClient.mockResolvedValue({
      id: 'client-1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: null,
      clientType: 'DEVELOPER',
      createdAt: '2026-01-01T10:00:00.000Z',
      updatedAt: '2026-01-01T10:00:00.000Z',
    });

    const response = await request(app).post('/clients/register').send({
      name: 'Ada Lovelace',
      email: 'ADA@example.com',
      clientType: 'DEVELOPER',
      password: 'correct horse battery staple',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      client: {
        id: 'client-1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        phone: null,
        clientType: 'DEVELOPER',
        createdAt: '2026-01-01T10:00:00.000Z',
        updatedAt: '2026-01-01T10:00:00.000Z',
      },
    });
    expect(response.body.client).not.toHaveProperty('passwordHash');
    expect(clientService.registerClient).toHaveBeenCalledWith(
      {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        phone: undefined,
        clientType: 'DEVELOPER',
        password: 'correct horse battery staple',
      },
    );
  });

  it('rejects privileged role injection', async () => {
    const response = await request(app).post('/clients/register').send({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      clientType: 'DEVELOPER',
      role: 'MANAGER',
      password: 'correct horse battery staple',
    });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(clientService.registerClient).not.toHaveBeenCalled();
  });

  it('rejects invalid registration input', async () => {
    const response = await request(app).post('/clients/register').send({
      name: '',
      email: 'not-an-email',
      clientType: 'MANAGER',
      password: 'short',
    });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(clientService.registerClient).not.toHaveBeenCalled();
  });

  it('returns a conflict for a duplicate email', async () => {
    clientService.registerClient.mockRejectedValue(
      new AppError(
        409,
        'CLIENT_EMAIL_ALREADY_EXISTS',
        'A client account with this email already exists',
      ),
    );

    const response = await request(app).post('/clients/register').send({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      clientType: 'DEVELOPER',
      password: 'correct horse battery staple',
    });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: {
        code: 'CLIENT_EMAIL_ALREADY_EXISTS',
        message: 'A client account with this email already exists',
      },
    });
  });
});
