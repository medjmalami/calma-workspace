/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/db/migrate.js'],
  coveragePathIgnorePatterns: ['/node_modules/', '/frontend/'],
  testPathIgnorePatterns: ['/node_modules/', '/frontend/']
};
