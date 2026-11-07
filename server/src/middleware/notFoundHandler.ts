import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

/**
 * Middleware to catch any unhandled routes and pass a 404 AppError to the centralized error handler.
 */
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(
    new AppError(
      404,
      `Cannot find endpoint [${req.method}] ${req.originalUrl} on this server.`
    )
  );
};
