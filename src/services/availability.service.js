const config = require('../config');
const AppError = require('../errors/app-error');
const availabilityRepository = require('../repositories/availability.repository');
const { availabilityQuerySchema } = require('../validators/availability.validator');

function timeToMinutes(value) {
  const [hours, minutes] = value.split(':').map(Number);
  return (hours * 60) + minutes;
}

function localDateTimeToUtc(date, time, timeZone) {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(utcGuess)
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, Number(value)]),
  );
  const localAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
  );
  const offset = localAsUtc - utcGuess.getTime();

  return new Date(utcGuess.getTime() - offset);
}

function outsideOpeningHoursError() {
  return new AppError(
    422,
    'AVAILABILITY_OUTSIDE_OPENING_HOURS',
    'Requested time is outside opening hours',
  );
}

function invalidTimeSlotError() {
  return new AppError(
    422,
    'INVALID_TIME_SLOT',
    'Requested end time must be after the start time',
  );
}

function durationExceededError() {
  return new AppError(
    422,
    'DURATION_EXCEEDS_MAXIMUM',
    'Requested duration exceeds the maximum allowed',
  );
}

function startInPastError() {
  return new AppError(
    422,
    'AVAILABILITY_START_IN_PAST',
    'Requested start time must be in the future',
  );
}

async function searchAvailableRooms(
  input,
  {
    repository = availabilityRepository,
    now = new Date(),
  } = {},
) {
  const criteria = availabilityQuerySchema.parse(input);
  const startMinutes = timeToMinutes(criteria.startTime);
  const endMinutes = timeToMinutes(criteria.endTime);
  const openingMinutes = timeToMinutes(config.booking.openingTime);
  const closingMinutes = timeToMinutes(config.booking.closingTime);

  if (startMinutes < openingMinutes || endMinutes > closingMinutes) {
    throw outsideOpeningHoursError();
  }

  if (endMinutes <= startMinutes) {
    throw invalidTimeSlotError();
  }

  if (endMinutes - startMinutes > config.booking.maxDurationHours * 60) {
    throw durationExceededError();
  }

  const startsAt = localDateTimeToUtc(
    criteria.date,
    criteria.startTime,
    config.booking.timezone,
  );

  if (startsAt <= now) {
    throw startInPastError();
  }

  const rooms = await repository.findAvailableRooms({
    ...criteria,
    bufferMinutes: config.booking.bufferMinutes,
    timezone: config.booking.timezone,
  });

  return {
    ...criteria,
    timezone: config.booking.timezone,
    rooms,
  };
}

module.exports = {
  localDateTimeToUtc,
  searchAvailableRooms,
  timeToMinutes,
};
