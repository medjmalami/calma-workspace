const healthService = require('../services/health.service');

function getHealth(_request, response) {
  response.status(200).json(healthService.getHealth());
}

module.exports = {
  getHealth
};
