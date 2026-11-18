const databasePool = require('../db/pool');

const CLIENT_COLUMNS = `
  id,
  name,
  email,
  phone,
  client_type AS "clientType",
  password_hash AS "passwordHash",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

function mapClientRow(row) {
  return row || null;
}

async function findClientByEmail(email, { pool = databasePool } = {}) {
  const result = await pool.query(
    `SELECT ${CLIENT_COLUMNS}
     FROM client_accounts
     WHERE email = $1`,
    [email],
  );

  return mapClientRow(result.rows[0]);
}

async function findClientById(id, { pool = databasePool } = {}) {
  const result = await pool.query(
    `SELECT ${CLIENT_COLUMNS}
     FROM client_accounts
     WHERE id = $1`,
    [id],
  );

  return mapClientRow(result.rows[0]);
}

async function createClient(client, { pool = databasePool } = {}) {
  const result = await pool.query(
    `INSERT INTO client_accounts (name, email, phone, client_type, password_hash)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${CLIENT_COLUMNS}`,
    [
      client.name,
      client.email,
      client.phone,
      client.clientType,
      client.passwordHash,
    ],
  );

  return mapClientRow(result.rows[0]);
}

async function updateClientProfile(id, changes, { pool = databasePool } = {}) {
  const fields = [];
  const values = [];

  if (Object.prototype.hasOwnProperty.call(changes, 'name')) {
    values.push(changes.name);
    fields.push(`name = $${values.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(changes, 'phone')) {
    values.push(changes.phone);
    fields.push(`phone = $${values.length}`);
  }

  if (fields.length === 0) {
    return findClientById(id, { pool });
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE client_accounts
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${values.length}
     RETURNING ${CLIENT_COLUMNS}`,
    values,
  );

  return mapClientRow(result.rows[0]);
}

module.exports = {
  createClient,
  findClientByEmail,
  findClientById,
  updateClientProfile,
};
