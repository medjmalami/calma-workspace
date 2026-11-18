const AppError = require('../errors/app-error');
const {
  createRoom,
  deactivateRoom,
  getRoom,
  listRooms,
  updateRoom,
} = require('../services/room.service');

describe('room service', () => {
  const room = {
    id: 'room-1',
    name: 'Focus Room',
    description: 'Quiet room',
    capacity: 6,
    isActive: true,
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
    deactivatedAt: null,
  };

  it('creates a public room configuration', async () => {
    const repository = {
      createRoom: jest.fn().mockResolvedValue(room),
    };

    await expect(
      createRoom(
        {
          name: 'Focus Room',
          description: 'Quiet room',
          capacity: 6,
        },
        { repository },
      ),
    ).resolves.toEqual(room);
    expect(repository.createRoom).toHaveBeenCalledWith({
      name: 'Focus Room',
      description: 'Quiet room',
      capacity: 6,
    });
  });

  it('maps a database uniqueness conflict to a stable room error', async () => {
    const repository = {
      createRoom: jest.fn().mockRejectedValue({ code: '23505' }),
    };

    await expect(
      createRoom(
        { name: 'Focus Room', description: null, capacity: 6 },
        { repository },
      ),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: 'ROOM_NAME_ALREADY_EXISTS',
    });
  });

  it('lists rooms using the requested active-state filter', async () => {
    const repository = {
      listRooms: jest.fn().mockResolvedValue([room]),
    };

    await expect(
      listRooms({ status: 'active' }, { repository }),
    ).resolves.toEqual([room]);
    expect(repository.listRooms).toHaveBeenCalledWith({ status: 'active' });
  });

  it('returns a stable not-found error for a missing room', async () => {
    const repository = {
      findRoomById: jest.fn().mockResolvedValue(null),
    };

    await expect(getRoom('room-1', { repository })).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        code: 'ROOM_NOT_FOUND',
      }),
    );
  });

  it('updates only room configuration fields', async () => {
    const repository = {
      findRoomById: jest.fn().mockResolvedValue(room),
      updateRoom: jest.fn().mockResolvedValue({
        ...room,
        name: 'Quiet Room',
        capacity: 8,
      }),
    };

    const result = await updateRoom(
      'room-1',
      { name: 'Quiet Room', capacity: 8 },
      { repository },
    );

    expect(repository.updateRoom).toHaveBeenCalledWith('room-1', {
      name: 'Quiet Room',
      capacity: 8,
    });
    expect(result).toEqual({
      ...room,
      name: 'Quiet Room',
      capacity: 8,
    });
  });

  it('deactivates a room without deleting its record', async () => {
    const deactivatedRoom = {
      ...room,
      isActive: false,
      deactivatedAt: '2026-01-02T10:00:00.000Z',
    };
    const repository = {
      findRoomById: jest.fn().mockResolvedValue(room),
      deactivateRoom: jest.fn().mockResolvedValue(deactivatedRoom),
    };

    await expect(
      deactivateRoom('room-1', { repository }),
    ).resolves.toEqual(deactivatedRoom);
    expect(repository.deactivateRoom).toHaveBeenCalledWith('room-1');
  });

  it('propagates repository failures instead of returning a fake room', async () => {
    const repository = {
      findRoomById: jest.fn().mockResolvedValue(room),
      deactivateRoom: jest.fn().mockRejectedValue(new Error('database down')),
    };

    const promise = deactivateRoom('room-1', { repository });
    await expect(promise).rejects.toBeInstanceOf(Error);
    await expect(promise).rejects.not.toBeInstanceOf(AppError);
  });
});
