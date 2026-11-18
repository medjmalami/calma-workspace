const bcrypt = require('bcrypt');

const {
  registerClient,
  updateClientProfile,
} = require('../services/client.service');

describe('client service', () => {
  const baseClient = {
    id: 'client-1',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    phone: '+216 20 000 000',
    clientType: 'DEVELOPER',
    passwordHash: '$2b$04$stored-hash',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
  };

  it.each(['STUDENT', 'PUPIL', 'DEVELOPER', 'ENTREPRENEUR'])(
    'registers a %s client without exposing the password hash',
    async (clientType) => {
      const repository = {
        findClientByEmail: jest.fn().mockResolvedValue(null),
        createClient: jest.fn().mockImplementation(async (client) => ({
          ...baseClient,
          clientType: client.clientType,
          passwordHash: client.passwordHash,
        })),
      };

      const result = await registerClient(
        {
          name: 'Ada Lovelace',
          email: ' ADA@example.com ',
          phone: '+216 20 000 000',
          clientType,
          password: 'correct horse battery staple',
        },
        { repository },
      );

      expect(repository.findClientByEmail).toHaveBeenCalledWith('ada@example.com');
      expect(repository.createClient).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Ada Lovelace',
          email: 'ada@example.com',
          clientType,
        }),
      );
      expect(repository.createClient.mock.calls[0][0]).not.toHaveProperty(
        'password',
      );
      expect(repository.createClient.mock.calls[0][0].passwordHash).not.toBe(
        'correct horse battery staple',
      );
      await expect(
        bcrypt.compare(
          'correct horse battery staple',
          repository.createClient.mock.calls[0][0].passwordHash,
        ),
      ).resolves.toBe(true);
      expect(result).toEqual({
        id: 'client-1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        phone: '+216 20 000 000',
        clientType,
        createdAt: '2026-01-01T10:00:00.000Z',
        updatedAt: '2026-01-01T10:00:00.000Z',
      });
      expect(result).not.toHaveProperty('passwordHash');
    },
  );

  it('updates only mutable profile fields', async () => {
    const repository = {
      findClientById: jest.fn().mockResolvedValue(baseClient),
      updateClientProfile: jest.fn().mockResolvedValue({
        ...baseClient,
        name: 'Grace Hopper',
        phone: null,
      }),
    };

    const result = await updateClientProfile(
      'client-1',
      {
        name: 'Grace Hopper',
        phone: null,
      },
      { repository },
    );

    expect(repository.updateClientProfile).toHaveBeenCalledWith('client-1', {
      name: 'Grace Hopper',
      phone: null,
    });
    expect(result).toEqual({
      id: 'client-1',
      name: 'Grace Hopper',
      email: 'ada@example.com',
      phone: null,
      clientType: 'DEVELOPER',
      createdAt: '2026-01-01T10:00:00.000Z',
      updatedAt: '2026-01-01T10:00:00.000Z',
    });
    expect(result).not.toHaveProperty('passwordHash');
  });
});
