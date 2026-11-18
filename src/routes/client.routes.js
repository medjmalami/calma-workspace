const express = require('express');

const clientController = require('../controllers/client.controller');
const validate = require('../middleware/validate');
const { registerClientSchema } = require('../validators/client.validator');

const router = express.Router();

router.post(
  '/clients/register',
  validate(registerClientSchema),
  clientController.registerClient,
);

module.exports = router;
