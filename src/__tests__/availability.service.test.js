const config = require('../config');

const AppError = require('../errors/app-error');
const {
  searchAvailableRooms,
} = require('../services/availability.service');

describe('availability service', () => {
  const validInput = {
    date: '2099-06-15',
    startTime: '10:00',
    endTime: '12:00',
    attendeeCount: 4,
  };

  it('applies booking rules and returns the configured timezone', async () => {
    const repository = {
      findAvailableRooms: jest.fn().mockResolvedValue([
        {
          id: 'room-1',
          name: 'Quiet room',
          capacity: 6,
        },
      ]),
    };

    const result = await searchAvailableRooms(validInput, {
      repository,
      now: new Date('2099-06-14T10:00:00.000Z'),
    });

    expect(repository.findAvailableRooms).toHaveBeenCalledWith({
      ...validInput,
      bufferMinutes: config.booking.bufferMinutes,
      timezone: config.booking.timezone,
    });
    expect(result).toEqual({
      ...validInput,
      timezone: config.booking.timezone,
      rooms: [
        {
          id: 'room-1',
          name: 'Quiet room',
          capacity: 6,
        },
      ],
    });
  });

  it('rejects a slot outside configured opening hours', async () => {
    const repository = {
      findAvailableRooms: jest.fn(),
    };

    await expect(
      searchAvailableRooms(
        {
          ...validInput,
          startTime: '07:00',
          endTime: '09:00',
        },
        { repository, now: new Date('2099-06-14T10:00:00.000Z') },
      ),
    ).rejects.toMatchObject({
      statusCode: 422,
      code: 'AVAILABILITY_OUTSIDE_OPENING_HOURS',
    });
    expect(repository.findAvailableRooms).not.toHaveBeenCalled();
  });

  it('rejects a non-positive or overlong time slot', async () => {
    const repository = {
      findAvailableRooms: jest.fn(),
    };

    await expect(
      searchAvailableRooms(
        {
          ...validInput,
          startTime: '12:00',
          endTime: '12:00',
        },
        { repository, now: new Date('2099-06-14T10:00:00.000Z') },
      ),
    ).rejects.toMatchObject({
      statusCode: 422,
      code: 'INVALID_TIME_SLOT',
    });

    await expect(
      searchAvailableRooms(
        {
          ...validInput,
          startTime: '08:00',
          endTime: '17:00',
        },
        { repository, now: new Date('2099-06-14T10:00:00.000Z') },
      ),
    ).rejects.toMatchObject({
      statusCode: 422,
      code: 'DURATION_EXCEEDS_MAXIMUM',
    });
    expect(repository.findAvailableRooms).not.toHaveBeenCalled();
  });

  it('rejects a slot whose local start is not in the future', async () => {
    const repository = {
      findAvailableRooms: jest.fn(),
    };

    const promise = searchAvailableRooms(
      {
        ...validInput,
        date: '2099-06-15',
        startTime: '10:00',
        endTime: '11:00',
      },
      {
        repository,
        now: new Date('2099-06-15T09:00:00.000Z'),
      },
    );

    await expect(promise).rejects.toBeInstanceOf(AppError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 422,
      code: 'AVAILABILITY_START_IN_PAST',
    });
    expect(repository.findAvailableRooms).not.toHaveBeenCalled();
  });
});
