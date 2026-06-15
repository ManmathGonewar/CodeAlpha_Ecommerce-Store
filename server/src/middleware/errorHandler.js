import { AppError } from '../utils/AppError.js';

export function notFound(req, res, next) {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
}

export function errorHandler(error, req, res, next) {
  if (error.code === 'ER_DUP_ENTRY') {
    error = new AppError('A record with that value already exists', 409);
  }

  if (
    ['ECONNREFUSED', 'ENOTFOUND', 'PROTOCOL_CONNECTION_LOST'].includes(error.code)
  ) {
    error = new AppError(
      'Database connection is unavailable. Please check your MySQL server.',
      503
    );
  }

  const statusCode = error.statusCode || 500;
  const payload = {
    message: error.message || 'Internal server error'
  };

  if (error.details) {
    payload.details = error.details;
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json(payload);
}
