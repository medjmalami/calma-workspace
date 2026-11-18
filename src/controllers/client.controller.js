const clientService = require('../services/client.service');

async function registerClient(request, response, next) {
  try {
    const client = await clientService.registerClient(request.body);
    response.status(201).json({ client });
  } catch (error) {
    next(error);
  }
}

async function getCurrentClient(request, response, next) {
  try {
    const client = await clientService.getClientProfile(request.auth.userId);
    response.status(200).json({ client });
  } catch (error) {
    next(error);
  }
}

async function updateCurrentClient(request, response, next) {
  try {
    const client = await clientService.updateClientProfile(
      request.auth.userId,
      request.body,
    );
    response.status(200).json({ client });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCurrentClient,
  registerClient,
  updateCurrentClient,
};
