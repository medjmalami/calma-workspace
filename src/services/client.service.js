const bcrypt = require('bcrypt');

const config = require('../config');
const AppError = require('../errors/app-error');
const clientRepository = require('../repositories/client.repository');
const { profileUpdateSchema } = require('../validators/client.validator');

const EMAIL_ALREADY_EXISTS_CODE = 'CLIENT_EMAIL_ALREADY_EXISTS';

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function toPublicClient(client) {
  if (!client) {
    return null;
  }

  const {
    id,
    name,
    email,
    phone,
    clientType,
    createdAt,
    updatedAt,
  } = client;

  return {
    id,
    name,
    email,
    phone,
    clientType,
    createdAt,
    updatedAt,
  };
}

function duplicateEmailError() {
  return new AppError(
    409,
    EMAIL_ALREADY_EXISTS_CODE,
    'A client account with this email already exists',
  );
}

async function registerClient(input, { repository = clientRepository } = {}) {
  const email = normalizeEmail(input.email);
  const existingClient = await repository.findClientByEmail(email);

  if (existingClient) {
    throw duplicateEmailError();
  }

  const passwordHash = await bcrypt.hash(input.password, config.auth.bcryptRounds);

  try {
    const client = await repository.createClient({
      name: input.name,
      email,
      phone: input.phone ?? null,
      clientType: input.clientType,
      passwordHash,
    });

    return toPublicClient(client);
  } catch (error) {
    if (error.code === '23505') {
      throw duplicateEmailError();
    }

    throw error;
  }
}

async function updateClientProfile(
  clientId,
  input,
  { repository = clientRepository } = {},
) {
  const changes = profileUpdateSchema.parse(input);
  const existingClient = await repository.findClientById(clientId);

  if (!existingClient) {
    throw new AppError(404, 'CLIENT_NOT_FOUND', 'Client account not found');
  }

  const client = await repository.updateClientProfile(clientId, changes);
  return toPublicClient(client);
}

module.exports = {
  registerClient,
  toPublicClient,
  updateClientProfile,
};
