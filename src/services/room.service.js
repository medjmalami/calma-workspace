const AppError = require('../errors/app-error');
const roomRepository = require('../repositories/room.repository');
const {
  roomCreateSchema,
  roomUpdateSchema,
} = require('../validators/room.validator');

function toPublicRoom(room) {
  if (!room) {
    return null;
  }

  const {
    id,
    name,
    description,
    capacity,
    isActive,
    deactivatedAt,
    createdAt,
    updatedAt,
  } = room;

  return {
    id,
    name,
    description,
    capacity,
    isActive: isActive ?? room.active,
    deactivatedAt,
    createdAt,
    updatedAt,
  };
}

function roomNotFoundError() {
  return new AppError(404, 'ROOM_NOT_FOUND', 'Room not found');
}

function duplicateRoomNameError() {
  return new AppError(
    409,
    'ROOM_NAME_ALREADY_EXISTS',
    'A room with this name already exists',
  );
}

async function createRoom(input, { repository = roomRepository } = {}) {
  const roomInput = roomCreateSchema.parse(input);

  try {
    const room = await repository.createRoom({
      name: roomInput.name,
      description: roomInput.description ?? null,
      capacity: roomInput.capacity,
    });

    return toPublicRoom(room);
  } catch (error) {
    if (error.code === '23505') {
      throw duplicateRoomNameError();
    }

    throw error;
  }
}

async function listRooms(
  { status = 'all' } = {},
  { repository = roomRepository } = {},
) {
  const rooms = await repository.listRooms({ status });
  return rooms.map(toPublicRoom);
}

async function getRoom(roomId, { repository = roomRepository } = {}) {
  const room = await repository.findRoomById(roomId);

  if (!room) {
    throw roomNotFoundError();
  }

  return toPublicRoom(room);
}

async function updateRoom(
  roomId,
  input,
  { repository = roomRepository } = {},
) {
  const changes = roomUpdateSchema.parse(input);
  const existingRoom = await repository.findRoomById(roomId);

  if (!existingRoom) {
    throw roomNotFoundError();
  }

  try {
    const room = await repository.updateRoom(roomId, changes);
    return toPublicRoom(room);
  } catch (error) {
    if (error.code === '23505') {
      throw duplicateRoomNameError();
    }

    throw error;
  }
}

async function deactivateRoom(roomId, { repository = roomRepository } = {}) {
  const existingRoom = await repository.findRoomById(roomId);

  if (!existingRoom) {
    throw roomNotFoundError();
  }

  const room = await repository.deactivateRoom(roomId);
  return toPublicRoom(room);
}

module.exports = {
  createRoom,
  deactivateRoom,
  getRoom,
  listRooms,
  toPublicRoom,
  updateRoom,
};
