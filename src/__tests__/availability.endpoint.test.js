const request = require('supertest');

const AppError = require('../errors/app-error');

jest.mock('../services/availability.service', () => ({
  searchAvailableRooms: jest.fn(),
}));

const availabilityService = require('../services/availability.service');
const app = require('../app');

describe('GET /rooms/availability', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns rooms matching the requested slot and attendee count', async () => {
    availabilityService.searchAvailableRooms.mockResolvedValue({
      date: '2099-06-15',
      startTime: '10:00',
      endTime: '12:00',
      attendeeCount: 4,
      timezone: 'Africa/Tunis',
      rooms: [
        {
          id: 'room-1',
          name: 'Quiet room',
          capacity: 6,
        },
      ],
    });

    const response = await request(app)
      .get('/rooms/availability')
      .query({
        date: '2099-06-15',
        startTime: '10:00',
        endTime: '12:00',
        attendeeCount: '4',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      availability: {
        date: '2099-06-15',
        startTime: '10:00',
        endTime: '12:00',
        attendeeCount: 4,
        timezone: 'Africa/Tunis',
        rooms: [
          {
            id: 'room-1',
            name: 'Quiet room',
            capacity: 6,
          },
        ],
      },
    });
    expect(availabilityService.searchAvailableRooms).toHaveBeenCalledWith({
      date: '2099-06-15',
      startTime: '10:00',
      endTime: '12:00',
      attendeeCount: 4,
    });
  });

  it('returns an empty room list when no room is available', async () => {
    availabilityService.searchAvailableRooms.mockResolvedValue({
      date: '2099-06-15',
      startTime: '10:00',
      endTime: '12:00',
      attendeeCount: 12,
      timezone: 'Africa/Tunis',
      rooms: [],
    });

    const response = await request(app)
      .get('/rooms/availability')
      .query({
        date: '2099-06-15',
        startTime: '10:00',
        endTime: '12:00',
        attendeeCount: '12',
      });

    expect(response.status).toBe(200);
    expect(response.body.availability.rooms).toEqual([]);
  });

  it('validates required query fields before calling the service', async () => {
    const response = await request(app)
      .get('/rooms/availability')
      .query({
        date: '2099-02-30',
        startTime: '10:00',
        endTime: '12:00',
        attendeeCount: '0',
      });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(availabilityService.searchAvailableRooms).not.toHaveBeenCalled();
  });

  it('returns stable business-rule errors from the service', async () => {
    availabilityService.searchAvailableRooms.mockRejectedValue(
      new AppError(
        422,
        'AVAILABILITY_OUTSIDE_OPENING_HOURS',
        'Requested time is outside opening hours',
      ),
    );

    const response = await request(app)
      .get('/rooms/availability')
      .query({
        date: '2099-06-15',
        startTime: '07:00',
        endTime: '09:00',
        attendeeCount: '4',
      });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: {
        code: 'AVAILABILITY_OUTSIDE_OPENING_HOURS',
        message: 'Requested time is outside opening hours',
      },
    });
  });
});
