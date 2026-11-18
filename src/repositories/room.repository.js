const databasePool = require('../db/pool');
const { findAvailableRooms } = require('./availability.repository');

const ROOM_COLUMNS = `
  id,
  name,
  description,
  capacity,
  is_active AS "isActive",
  deactivated_at AS "deactivatedAt",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

function mapRoomRow(row) {
  return row || null;
}

async function createRoom(room, { pool = databasePool } = {}) {
  const result = await pool.query(
    `INSERT INTO rooms (name, description, capacity)
     VALUES ($1, $2, $3)
     RETURNING ${ROOM_COLUMNS}`,
    [room.name, room.description ?? null, room.capacity],
  );

  return mapRoomRow(result.rows[0]);
}

async function listRooms({ status = 'all', pool = databasePool } = {}) {
  const statusClause = {
    active: 'WHERE is_active = TRUE',
    inactive: 'WHERE is_active = FALSE',
    all: '',
  }[status] ?? '';
  const result = await pool.query(
    `SELECT ${ROOM_COLUMNS}
     FROM rooms
     ${statusClause}
     ORDER BY lower(name), id`,
  );

  return result.rows.map(mapRoomRow);
}

async function findRoomById(id, { pool = databasePool } = {}) {
  const result = await pool.query(
    `SELECT ${ROOM_COLUMNS}
     FROM rooms
     WHERE id = $1`,
    [id],
  );

  return mapRoomRow(result.rows[0]);
}

async function updateRoom(id, changes, { pool = databasePool } = {}) {
  const fields = [];
  const values = [];

  if (Object.prototype.hasOwnProperty.call(changes, 'name')) {
    values.push(changes.name);
    fields.push(`name = $${values.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(changes, 'description')) {
    values.push(changes.description);
    fields.push(`description = $${values.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(changes, 'capacity')) {
    values.push(changes.capacity);
    fields.push(`capacity = $${values.length}`);
  }

  if (fields.length === 0) {
    return findRoomById(id, { pool });
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE rooms
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${values.length}
     RETURNING ${ROOM_COLUMNS}`,
    values,
  );

  return mapRoomRow(result.rows[0]);
}

async function deactivateRoom(id, { pool = databasePool } = {}) {
  const result = await pool.query(
    `UPDATE rooms
     SET is_active = FALSE,
         deactivated_at = COALESCE(deactivated_at, NOW()),
         updated_at = NOW()
     WHERE id = $1
     RETURNING ${ROOM_COLUMNS}`,
    [id],
  );

  return mapRoomRow(result.rows[0]);
}

module.exports = {
  createRoom,
  deactivateRoom,
  findRoomById,
  findAvailableRooms,
  listRooms,
  updateRoom,
};
