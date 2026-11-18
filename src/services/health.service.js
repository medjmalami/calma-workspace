const config = require('../config');

function getHealth() {
  return {
    status: 'ok',
    service: config.app.name
  };
}

module.exports = {
  getHealth
};
