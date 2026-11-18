const roomService = require('../services/room.service');

async function createRoom(request, response, next) {
  try {
    const room = await roomService.createRoom(request.body);
    response.status(201).json({ room });
  } catch (error) {
    next(error);
  }
}

async function listRooms(_request, response, next) {
  try {
    const rooms = await roomService.listRooms({ status: 'all' });
    response.status(200).json({ rooms });
  } catch (error) {
    next(error);
  }
}

async function getRoom(request, response, next) {
  try {
    const room = await roomService.getRoom(request.params.id);
    response.status(200).json({ room });
  } catch (error) {
    next(error);
  }
}

async function updateRoom(request, response, next) {
  try {
    const room = await roomService.updateRoom(request.params.id, request.body);
    response.status(200).json({ room });
  } catch (error) {
    next(error);
  }
}

async function deactivateRoom(request, response, next) {
  try {
    const room = await roomService.deactivateRoom(request.params.id);
    response.status(200).json({ room });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createRoom,
  deactivateRoom,
  getRoom,
  listRooms,
  updateRoom,
};
