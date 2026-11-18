const { Pool } = require('pg');

const config = require('../config');

const pool = new Pool({
  ...(config.database.pool || {}),
  connectionString: config.database.url,
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error.message);
});

module.exports = pool;
