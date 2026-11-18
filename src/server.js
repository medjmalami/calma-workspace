const app = require('./app');
const config = require('./config');

const server = app.listen(config.server.port, () => {
  console.log(`${config.app.name} API listening on port ${config.server.port}`);
});

function shutdown(signal) {
  console.log(`${signal} received; shutting down`);
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
