const jwt = require('jsonwebtoken');

const config = require('../config');
const AppError = require('../errors/app-error');
const {
  authenticate,
  requireRole,
} = require('../middleware/auth');

describe('authentication middleware', () => {
  function createResponse() {
    return {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  }

  it('rejects requests without a bearer token', () => {
    const next = jest.fn();

    authenticate({ headers: {} }, createResponse(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        code: 'AUTHENTICATION_REQUIRED',
      }),
    );
  });

  it('attaches verified token claims to the request', () => {
    const request = {
      headers: {
        authorization: `Bearer ${jwt.sign(
          { sub: 'client-1', role: 'CLIENT' },
          config.auth.jwtSecret,
          { expiresIn: '15m' },
        )}`,
      },
    };
    const next = jest.fn();

    authenticate(request, createResponse(), next);

    expect(next).toHaveBeenCalledWith();
    expect(request.auth).toEqual(
      expect.objectContaining({
        userId: 'client-1',
        role: 'CLIENT',
      }),
    );
  });

  it('rejects a token with a role that is not authorized', () => {
    const request = {
      auth: { userId: 'client-1', role: 'CLIENT' },
    };
    const next = jest.fn();

    requireRole('MANAGER')(request, createResponse(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        code: 'FORBIDDEN',
      }),
    );
  });

  it('does not expose JWT library errors directly', () => {
    const next = jest.fn();

    authenticate(
      { headers: { authorization: 'Bearer definitely-not-a-token' } },
      createResponse(),
      next,
    );

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 401,
      code: 'INVALID_TOKEN',
      message: 'Invalid or expired token',
    });
  });
});
