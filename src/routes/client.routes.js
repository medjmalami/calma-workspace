const express = require('express');

const clientController = require('../controllers/client.controller');
const { authenticate, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  profileUpdateSchema,
  registerClientSchema,
} = require('../validators/client.validator');

const router = express.Router();

router.get(
  '/clients/me',
  authenticate,
  requireRole('CLIENT'),
  clientController.getCurrentClient,
);

router.patch(
  '/clients/me',
  authenticate,
  requireRole('CLIENT'),
  validate(profileUpdateSchema),
  clientController.updateCurrentClient,
);

router.post(
  '/clients/register',
  validate(registerClientSchema),
  clientController.registerClient,
);

module.exports = router;
