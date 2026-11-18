const express = require('express');

const roomController = require('../controllers/room.controller');
const { authenticate, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  roomCreateSchema,
  roomIdSchema,
  roomUpdateSchema,
} = require('../validators/room.validator');

const router = express.Router();
const managerOnly = [authenticate, requireRole('MANAGER')];

router.use('/rooms', ...managerOnly);

router.post('/rooms', validate(roomCreateSchema), roomController.createRoom);
router.get('/rooms', roomController.listRooms);
router.get('/rooms/:id', validate(roomIdSchema, 'params'), roomController.getRoom);
router.patch(
  '/rooms/:id',
  validate(roomIdSchema, 'params'),
  validate(roomUpdateSchema),
  roomController.updateRoom,
);
router.post(
  '/rooms/:id/deactivate',
  validate(roomIdSchema, 'params'),
  roomController.deactivateRoom,
);
router.patch(
  '/rooms/:id/deactivate',
  validate(roomIdSchema, 'params'),
  roomController.deactivateRoom,
);
router.delete(
  '/rooms/:id',
  validate(roomIdSchema, 'params'),
  roomController.deactivateRoom,
);

module.exports = router;
