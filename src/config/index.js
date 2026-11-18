const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

const DEFAULT_DEV_JWT_SECRET = 'calma-workspace-development-secret-change-me';
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().url().default('postgres://calma:calma@localhost:5432/calma_workspace'),
  TEST_DATABASE_URL: z.string().url().default('postgres://calma:calma@localhost:5433/calma_workspace_test'),
  JWT_SECRET: z.string().min(32).default(DEFAULT_DEV_JWT_SECRET),
  JWT_EXPIRES_IN: z.string().min(1).default('15m'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(31).default(12),
  MAX_DURATION_HOURS: z.coerce.number().positive().default(8),
  BUFFER_MINUTES: z.coerce.number().nonnegative().default(15),
  HOURLY_RATE_MILLIMES: z.coerce.number().int().nonnegative().default(5000),
  DAILY_RATE_MILLIMES: z.coerce.number().int().nonnegative().default(25000),
  OPENING_TIME: z.string().regex(timePattern).default('08:00'),
  CLOSING_TIME: z.string().regex(timePattern).default('20:00'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  LOGIN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  JSON_BODY_LIMIT: z.string().min(1).default('100kb'),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:5173'),
  DB_POOL_MAX: z.coerce.number().int().positive().default(10)
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  const details = parsedEnvironment.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');
  throw new Error(`Invalid environment configuration: ${details}`);
}

const environment = parsedEnvironment.data;

if (environment.NODE_ENV === 'production' && environment.JWT_SECRET === DEFAULT_DEV_JWT_SECRET) {
  throw new Error('JWT_SECRET must be changed before starting in production');
}

const config = Object.freeze({
  app: Object.freeze({
    name: 'calma-workspace'
  }),
  env: environment.NODE_ENV,
  server: Object.freeze({
    port: environment.PORT
  }),
  database: Object.freeze({
    url: environment.NODE_ENV === 'test' ? environment.TEST_DATABASE_URL : environment.DATABASE_URL,
    pool: Object.freeze({
      max: environment.DB_POOL_MAX
    })
  }),
  auth: Object.freeze({
    jwtSecret: environment.JWT_SECRET,
    jwtExpiresIn: environment.JWT_EXPIRES_IN,
    bcryptRounds: environment.BCRYPT_ROUNDS
  }),
  booking: Object.freeze({
    maxDurationHours: environment.MAX_DURATION_HOURS,
    bufferMinutes: environment.BUFFER_MINUTES,
    hourlyRateMillimes: environment.HOURLY_RATE_MILLIMES,
    dailyRateMillimes: environment.DAILY_RATE_MILLIMES,
    openingTime: environment.OPENING_TIME,
    closingTime: environment.CLOSING_TIME
  }),
  http: Object.freeze({
    jsonBodyLimit: environment.JSON_BODY_LIMIT,
    corsOrigin: environment.CORS_ORIGIN
  }),
  rateLimit: Object.freeze({
    windowMs: environment.RATE_LIMIT_WINDOW_MS,
    max: environment.RATE_LIMIT_MAX,
    loginMax: environment.LOGIN_RATE_LIMIT_MAX
  })
});

module.exports = config;
