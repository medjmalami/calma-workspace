const express = require('express');

const authController = require('../controllers/auth.controller');
const loginRateLimiter = require('../middleware/login-rate-limiter');
const validate = require('../middleware/validate');
const { loginSchema } = require('../validators/auth.validator');

const router = express.Router();

router.post(
  '/auth/login',
  loginRateLimiter,
  validate(loginSchema),
  authController.login,
);

module.exports = router;
