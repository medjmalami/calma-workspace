const authService = require('../services/auth.service');

async function login(request, response, next) {
  try {
    const authentication = await authService.authenticateClient(request.body);
    response.status(200).json(authentication);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
};
