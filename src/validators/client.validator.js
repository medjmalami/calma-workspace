const { z } = require('zod');

const clientTypes = [
  'STUDENT',
  'PUPIL',
  'DEVELOPER',
  'ENTREPRENEUR',
];

const nameSchema = z.string().trim().min(1).max(120);
const emailSchema = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
const phoneSchema = z.string().trim().min(3).max(32).nullable().optional();

const registerClientSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    clientType: z.enum(clientTypes),
    password: z.string().min(8).max(128),
  })
  .strict();

const profileUpdateSchema = z
  .object({
    name: nameSchema.optional(),
    phone: phoneSchema,
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one profile field is required',
  });

module.exports = {
  clientTypes,
  registerClientSchema,
  profileUpdateSchema,
};
