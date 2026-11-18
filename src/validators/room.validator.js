const { z } = require('zod');

const config = require('../config');

const roomNameSchema = z.string().trim().min(1).max(120);
const roomDescriptionSchema = z
  .string()
  .trim()
  .max(500)
  .nullable()
  .optional();
const roomCapacitySchema = z
  .number()
  .int()
  .min(1)
  .max(config.booking.maxRoomCapacity);

const roomCreateSchema = z
  .object({
    name: roomNameSchema,
    description: roomDescriptionSchema,
    capacity: roomCapacitySchema,
  })
  .strict();

const roomUpdateSchema = z
  .object({
    name: roomNameSchema.optional(),
    description: roomDescriptionSchema,
    capacity: roomCapacitySchema.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one room field is required',
  });

const roomIdSchema = z.object({
  id: z.string().uuid(),
});

module.exports = {
  roomCreateSchema,
  roomDescriptionSchema,
  roomIdSchema,
  roomNameSchema,
  roomUpdateSchema,
};
