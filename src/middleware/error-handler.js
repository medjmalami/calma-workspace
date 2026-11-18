const { ZodError } = require('zod');

const AppError = require('../errors/app-error');

function notFoundHandler(_request, _response, next) {
  next(new AppError(404, 'NOT_FOUND', 'Resource not found'));
}

function errorHandler(error, _request, response, next) {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ZodError) {
    response.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.issues.map((issue) => ({
          path: issue.path,
          message: issue.message,
          code: issue.code
        }))
      }
    });
    return;
  }

  if (error instanceof SyntaxError && Object.prototype.hasOwnProperty.call(error, 'body')) {
    response.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: 'Request body contains invalid JSON'
      }
    });
    return;
  }

  const statusCode = error instanceof AppError && error.statusCode ? error.statusCode : 500;
  const code = error instanceof AppError && error.code ? error.code : 'INTERNAL_SERVER_ERROR';
  const message = statusCode >= 500 ? 'Internal server error' : error.message;

  if (statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    error: {
      code,
      message,
      ...(error instanceof AppError && error.details ? { details: error.details } : {})
    }
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
