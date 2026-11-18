const express = require('express');

const availabilityController = require('../controllers/availability.controller');
const validate = require('../middleware/validate');
const { availabilityQuerySchema } = require('../validators/availability.validator');

const router = express.Router();

router.get(
  '/rooms/availability',
  validate(availabilityQuerySchema, 'query'),
  availabilityController.searchAvailability,
);

module.exports = router;
