const clientService = require('../services/client.service');

async function registerClient(request, response, next) {
  try {
    const client = await clientService.registerClient(request.body);
    response.status(201).json({ client });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerClient,
};
