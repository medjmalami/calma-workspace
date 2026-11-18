const jwt = require('jsonwebtoken');

const config = require('../config');
const AppError = require('../errors/app-error');

const BEARER_TOKEN_PATTERN = /^Bearer\s+(\S+)$/i;

function authenticationRequiredError() {
  return new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication required');
}

function invalidTokenError() {
  return new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token');
}

function forbiddenError() {
  return new AppError(403, 'FORBIDDEN', 'You do not have permission to perform this action');
}

function authenticate(request, _response, next) {
  const authorization = request.headers?.authorization;

  if (!authorization) {
    next(authenticationRequiredError());
    return;
  }

  const match = BEARER_TOKEN_PATTERN.exec(authorization);

  if (!match) {
    next(invalidTokenError());
    return;
  }

  try {
    const claims = jwt.verify(match[1], config.auth.jwtSecret, {
      algorithms: ['HS256'],
    });

    if (
      !claims ||
      typeof claims !== 'object' ||
      typeof claims.sub !== 'string' ||
      typeof claims.role !== 'string'
    ) {
      next(invalidTokenError());
      return;
    }

    request.auth = {
      userId: claims.sub,
      role: claims.role,
      ...(claims.clientType ? { clientType: claims.clientType } : {}),
    };
    next();
  } catch {
    next(invalidTokenError());
  }
}

function requireRole(...allowedRoles) {
  return (request, _response, next) => {
    if (!request.auth) {
      next(authenticationRequiredError());
      return;
    }

    if (!allowedRoles.includes(request.auth.role)) {
      next(forbiddenError());
      return;
    }

    next();
  };
}

module.exports = {
  authenticate,
  requireRole,
};
