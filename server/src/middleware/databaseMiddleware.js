import { getDatabaseState, getDatabaseTarget } from '../database/pool.js';
import { AppError } from '../utils/AppError.js';

export function requireDatabase(req, res, next) {
  const database = getDatabaseState();

  if (database.ready) {
    return next();
  }

  return next(
    new AppError(
      'Database is currently unavailable. Start MySQL or MariaDB and try again.',
      503,
      [
        {
          field: 'database',
          message:
            database.lastError || `Unable to connect to ${getDatabaseTarget()}`
        }
      ]
    )
  );
}

