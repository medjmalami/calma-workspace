const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const config = require('../config');
const AppError = require('../errors/app-error');
const { authenticateClient } = require('../services/auth.service');

describe('auth service', () => {
  const client = {
    id: 'client-1',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    phone: null,
    clientType: 'DEVELOPER',
    passwordHash: '$2b$04$C6UzMDM.H6dfI/f/IKcEe.3Zk7a3h9xC4yVj0n0m6rN9t8L7qR6wS',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
  };

  it('authenticates a client and returns a public profile with a JWT', async () => {
    const passwordHash = await bcrypt.hash('correct horse battery staple', 4);
    const repository = {
      findClientByEmail: jest.fn().mockResolvedValue({
        ...client,
        passwordHash,
      }),
    };

    const result = await authenticateClient(
      {
        email: ' ADA@example.com ',
        password: 'correct horse battery staple',
      },
      { repository },
    );

    expect(repository.findClientByEmail).toHaveBeenCalledWith('ada@example.com');
    expect(result.client).toEqual({
      id: 'client-1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: null,
      clientType: 'DEVELOPER',
      createdAt: '2026-01-01T10:00:00.000Z',
      updatedAt: '2026-01-01T10:00:00.000Z',
    });
    expect(result.client).not.toHaveProperty('passwordHash');
    expect(typeof result.token).toBe('string');

    expect(jwt.verify(result.token, config.auth.jwtSecret)).toEqual(
      expect.objectContaining({
        sub: 'client-1',
        role: 'CLIENT',
      }),
    );
  });

  it.each([
    ['an unknown email', null],
    ['an incorrect password', { ...client }],
  ])('uses the same non-enumerating error for %s', async (_caseName, foundClient) => {
    const repository = {
      findClientByEmail: jest.fn().mockResolvedValue(foundClient),
    };

    const promise = authenticateClient(
      {
        email: 'ada@example.com',
        password: 'wrong password',
      },
      { repository },
    );

    await expect(promise).rejects.toMatchObject({
      statusCode: 401,
      code: 'AUTHENTICATION_FAILED',
      message: 'Invalid email or password',
    });
    await expect(promise).rejects.toBeInstanceOf(AppError);
  });
});
