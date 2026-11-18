const request = require('supertest');
const jwt = require('jsonwebtoken');

const config = require('../config');
const AppError = require('../errors/app-error');

jest.mock('../services/auth.service', () => ({
  authenticateClient: jest.fn(),
}));

const authService = require('../services/auth.service');
const app = require('../app');

describe('POST /auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a JWT and public client profile for valid credentials', async () => {
    authService.authenticateClient.mockResolvedValue({
      token: jwt.sign(
        { sub: 'client-1', role: 'CLIENT' },
        config.auth.jwtSecret,
        { expiresIn: '15m' },
      ),
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

    const response = await request(app).post('/auth/login').send({
      email: 'ADA@example.com',
      password: 'correct horse battery staple',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      token: expect.any(String),
      client: expect.objectContaining({
        id: 'client-1',
        email: 'ada@example.com',
      }),
    });
    expect(response.body.client).not.toHaveProperty('passwordHash');
    expect(authService.authenticateClient).toHaveBeenCalledWith({
      email: 'ada@example.com',
      password: 'correct horse battery staple',
    });
  });

  it('returns the same non-enumerating response for failed credentials', async () => {
    authService.authenticateClient.mockRejectedValue(
      new AppError(401, 'AUTHENTICATION_FAILED', 'Invalid email or password'),
    );

    const response = await request(app).post('/auth/login').send({
      email: 'unknown@example.com',
      password: 'wrong password',
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: 'Invalid email or password',
      },
    });
  });

  it('validates login input before calling the service', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'not-an-email',
      password: 'short',
      role: 'MANAGER',
    });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(authService.authenticateClient).not.toHaveBeenCalled();
  });

  it('returns a stable 429 response after the configured login limit', async () => {
    authService.authenticateClient.mockRejectedValue(
      new AppError(401, 'AUTHENTICATION_FAILED', 'Invalid email or password'),
    );

    const responses = [];
    for (let attempt = 0; attempt < config.rateLimit.loginMax + 1; attempt += 1) {
      responses.push(
        await request(app)
          .post('/auth/login')
          .set('X-Forwarded-For', '198.51.100.77')
          .send({
            email: 'unknown@example.com',
            password: 'wrong password',
          }),
      );
    }

    const response = responses.at(-1);
    expect(response.status).toBe(429);
    expect(response.body).toEqual({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many login attempts. Please try again later.',
      },
    });
  });
});
