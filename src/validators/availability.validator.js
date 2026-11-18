const { z } = require('zod');

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const availabilityQuerySchema = z
  .object({
    date: z
      .string()
      .regex(datePattern, 'Date must use YYYY-MM-DD format')
      .refine(isValidDate, 'Date must be a valid calendar date'),
    startTime: z.string().regex(timePattern, 'Time must use HH:MM format'),
    endTime: z.string().regex(timePattern, 'Time must use HH:MM format'),
    attendeeCount: z.coerce.number().int().min(1),
  })
  .strict();

module.exports = {
  availabilityQuerySchema,
  isValidDate,
};
