import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodTypeAny } from 'zod';
import { AppError } from '../utils/appError';

export interface RequestValidationConfig {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

/**
 * Higher-order middleware to validate incoming HTTP requests against Zod schemas.
 * Rejects invalid payloads before reaching controllers or database queries.
 *
 * @param schema - A Zod schema (validates req.body by default) or a RequestValidationConfig object
 */
export const validate = (
  schema: ZodTypeAny | RequestValidationConfig
) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      // Direct Zod schema -> validate req.body
      if (schema instanceof z.ZodType) {
        req.body = await schema.parseAsync(req.body);
        return next();
      }

      // Configuration object with body, params, and/or query
      const config = schema as RequestValidationConfig;

      if (config.body) {
        req.body = await config.body.parseAsync(req.body);
      }

      if (config.params) {
        req.params = (await config.params.parseAsync(req.params)) as typeof req.params;
      }

      if (config.query) {
        req.query = (await config.query.parseAsync(req.query)) as typeof req.query;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => {
          const path = issue.path.join('.');
          return path ? `${path}: ${issue.message}` : issue.message;
        });

        return next(new AppError(400, 'Validation failed', errorMessages));
      }

      next(error);
    }
  };
};
