const {
  findAvailableRooms,
} = require('../repositories/room.repository');

describe('room availability repository', () => {
  it('uses a parameterized local-timezone overlap query with capacity and buffer filters', async () => {
    const pool = {
      query: jest.fn().mockResolvedValue({
        rows: [
          {
            id: 'room-1',
            name: 'Quiet room',
            capacity: 6,
          },
        ],
      }),
    };

    const criteria = {
      date: '2099-06-15',
      startTime: '10:00',
      endTime: '12:00',
      attendeeCount: 4,
      bufferMinutes: 15,
      timezone: 'Africa/Tunis',
    };

    await expect(findAvailableRooms(criteria, { pool })).resolves.toEqual([
      {
        id: 'room-1',
        name: 'Quiet room',
        capacity: 6,
      },
    ]);

    const [query, values] = pool.query.mock.calls[0];
    expect(query).toContain('r.capacity >= $4');
    expect(query).toContain('r.is_active = TRUE');
    expect(query).toContain('NOT EXISTS');
    expect(query).toContain('reservation.status IN (\'PENDING\', \'CONFIRMED\')');
    expect(query).toContain(
      'reservation.starts_at < slot.ends_at + ($5 * INTERVAL \'1 minute\')',
    );
    expect(query).toContain(
      'reservation.ends_at > slot.starts_at - ($5 * INTERVAL \'1 minute\')',
    );
    expect(query).toContain('AT TIME ZONE $6');
    expect(values).toEqual([
      '2099-06-15',
      '10:00',
      '12:00',
      4,
      15,
      'Africa/Tunis',
    ]);
  });
});
