const jwt = require('jsonwebtoken');
const request = require('supertest');

const config = require('../config');

jest.mock('../services/room.service', () => ({
  createRoom: jest.fn(),
  deactivateRoom: jest.fn(),
  getRoom: jest.fn(),
  listRooms: jest.fn(),
  updateRoom: jest.fn(),
}));

const roomService = require('../services/room.service');
const app = require('../app');

const ROOM_ID = '11111111-1111-4111-8111-111111111111';

function tokenFor(role) {
  return jwt.sign(
    { sub: `${role.toLowerCase()}-1`, role },
    config.auth.jwtSecret,
    { expiresIn: '15m' },
  );
}

function managerRequest(requestBuilder) {
  return requestBuilder.set('Authorization', `Bearer ${tokenFor('MANAGER')}`);
}

describe('manager room configuration routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a room for a manager', async () => {
    roomService.createRoom.mockResolvedValue({
      id: ROOM_ID,
      name: 'Focus Room A',
      capacity: 6,
      isActive: true,
      createdAt: '2026-01-01T10:00:00.000Z',
      updatedAt: '2026-01-01T10:00:00.000Z',
    });

    const response = await managerRequest(
      request(app).post('/rooms').send({
        name: 'Focus Room A',
        capacity: 6,
      }),
    );

    expect(response.status).toBe(201);
    expect(response.body.room).toEqual(
      expect.objectContaining({ id: ROOM_ID, name: 'Focus Room A', capacity: 6 }),
    );
    expect(roomService.createRoom).toHaveBeenCalledWith({
      name: 'Focus Room A',
      capacity: 6,
    });
  });

  it('lists all rooms for a manager', async () => {
    roomService.listRooms.mockResolvedValue([
      {
        id: ROOM_ID,
        name: 'Focus Room A',
        capacity: 6,
        isActive: false,
      },
    ]);

    const response = await managerRequest(request(app).get('/rooms'));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      rooms: [expect.objectContaining({ id: ROOM_ID, isActive: false })],
    });
    expect(roomService.listRooms).toHaveBeenCalledWith({ status: 'all' });
  });

  it('gets one room for a manager', async () => {
    roomService.getRoom.mockResolvedValue({
      id: ROOM_ID,
      name: 'Focus Room A',
      capacity: 6,
      isActive: true,
    });

    const response = await managerRequest(request(app).get(`/rooms/${ROOM_ID}`));

    expect(response.status).toBe(200);
    expect(response.body.room).toEqual(expect.objectContaining({ id: ROOM_ID }));
    expect(roomService.getRoom).toHaveBeenCalledWith(ROOM_ID);
  });

  it('updates a room for a manager', async () => {
    roomService.updateRoom.mockResolvedValue({
      id: ROOM_ID,
      name: 'Quiet Room',
      capacity: 8,
      isActive: true,
    });

    const response = await managerRequest(
      request(app).patch(`/rooms/${ROOM_ID}`).send({
        name: 'Quiet Room',
        capacity: 8,
      }),
    );

    expect(response.status).toBe(200);
    expect(response.body.room.name).toBe('Quiet Room');
    expect(roomService.updateRoom).toHaveBeenCalledWith(ROOM_ID, {
      name: 'Quiet Room',
      capacity: 8,
    });
  });

  it('soft-deactivates a room through DELETE', async () => {
    roomService.deactivateRoom.mockResolvedValue({
      id: ROOM_ID,
      name: 'Focus Room A',
      capacity: 6,
      isActive: false,
    });

    const response = await managerRequest(request(app).delete(`/rooms/${ROOM_ID}`));

    expect(response.status).toBe(200);
    expect(response.body.room).toEqual(
      expect.objectContaining({ id: ROOM_ID, isActive: false }),
    );
    expect(roomService.deactivateRoom).toHaveBeenCalledWith(ROOM_ID);
  });

  it('supports an explicit deactivation action', async () => {
    roomService.deactivateRoom.mockResolvedValue({
      id: ROOM_ID,
      name: 'Focus Room A',
      capacity: 6,
      isActive: false,
    });

    const response = await managerRequest(
      request(app).patch(`/rooms/${ROOM_ID}/deactivate`),
    );

    expect(response.status).toBe(200);
    expect(response.body.room.isActive).toBe(false);
    expect(roomService.deactivateRoom).toHaveBeenCalledWith(ROOM_ID);
  });

  it('rejects non-manager access without invoking the room service', async () => {
    const response = await request(app)
      .get('/rooms')
      .set('Authorization', `Bearer ${tokenFor('CLIENT')}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
    expect(roomService.listRooms).not.toHaveBeenCalled();
  });

  it('rejects invalid room input before calling the service', async () => {
    const response = await managerRequest(
      request(app).post('/rooms').send({
        name: '   ',
        capacity: 0,
        isActive: true,
      }),
    );

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(roomService.createRoom).not.toHaveBeenCalled();
  });

  it('validates room identifiers before calling the service', async () => {
    const response = await managerRequest(request(app).get('/rooms/not-a-uuid'));

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(roomService.getRoom).not.toHaveBeenCalled();
  });
});
