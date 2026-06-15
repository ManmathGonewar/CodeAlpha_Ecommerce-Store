import { AppError } from '../utils/AppError.js';

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Admin access is required', 403));
  }

  next();
}
