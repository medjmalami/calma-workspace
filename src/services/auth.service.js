const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const config = require('../config');
const AppError = require('../errors/app-error');
const clientRepository = require('../repositories/client.repository');
const { toPublicClient } = require('./client.service');

const AUTHENTICATION_FAILED_CODE = 'AUTHENTICATION_FAILED';
const DUMMY_PASSWORD_HASH =
  '$2b$12$W9FVLyIwpEJzXVkYHFu90.EUNNkWvPZaSsniSIdZ.mRb9m6Vm0EqW';

function authenticationFailedError() {
  return new AppError(
    401,
    AUTHENTICATION_FAILED_CODE,
    'Invalid email or password',
  );
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

async function authenticateClient(
  input,
  { repository = clientRepository } = {},
) {
  const email = normalizeEmail(input.email);
  const client = await repository.findClientByEmail(email);
  const passwordHash = client?.passwordHash || DUMMY_PASSWORD_HASH;
  const passwordMatches = await bcrypt.compare(input.password, passwordHash);

  if (!client || !passwordMatches) {
    throw authenticationFailedError();
  }

  const token = jwt.sign(
    {
      sub: client.id,
      role: 'CLIENT',
    },
    config.auth.jwtSecret,
    {
      expiresIn: config.auth.jwtExpiresIn,
      algorithm: 'HS256',
    },
  );

  return {
    token,
    client: toPublicClient(client),
  };
}

module.exports = {
  authenticateClient,
  authenticationFailedError,
};
