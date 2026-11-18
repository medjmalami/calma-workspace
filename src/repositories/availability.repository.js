const databasePool = require('../db/pool');

async function findAvailableRooms(criteria, { pool = databasePool } = {}) {
  const result = await pool.query(
    `WITH requested_slot AS (
       SELECT
         (($1::date + $2::time) AT TIME ZONE $6) AS starts_at,
         (($1::date + $3::time) AT TIME ZONE $6) AS ends_at
     )
     SELECT r.id, r.name, r.capacity
     FROM rooms r
     CROSS JOIN requested_slot slot
     WHERE r.is_active = TRUE
       AND r.capacity >= $4
       AND NOT EXISTS (
         SELECT 1
         FROM reservations reservation
         WHERE reservation.room_id = r.id
           AND reservation.status IN ('PENDING', 'CONFIRMED')
           AND reservation.starts_at < slot.ends_at + ($5 * INTERVAL '1 minute')
           AND reservation.ends_at > slot.starts_at - ($5 * INTERVAL '1 minute')
       )
     ORDER BY r.capacity, lower(r.name), r.id`,
    [
      criteria.date,
      criteria.startTime,
      criteria.endTime,
      criteria.attendeeCount,
      criteria.bufferMinutes,
      criteria.timezone,
    ],
  );

  return result.rows;
}

module.exports = {
  findAvailableRooms,
};
