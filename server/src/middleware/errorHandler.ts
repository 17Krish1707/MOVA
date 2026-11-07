import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/appError';

interface CustomError extends Error {
  statusCode?: number;
  status?: 'fail' | 'error';
  isOperational?: boolean;
  code?: number;
  path?: string;
  value?: unknown;
  errors?: Record<string, { message: string }>;
  keyValue?: Record<string, unknown>;
  issues?: Array<{ path: (string | number)[]; message: string }>;
}

/**
 * Transforms Mongoose CastError (e.g. invalid ObjectId format) into a user-friendly 400 AppError.
 */
const handleCastErrorDB = (err: CustomError): AppError => {
  const message = `Invalid ${err.path || 'field'}: ${err.value}. Please provide a valid identifier.`;
  return new AppError(400, message);
};

/**
 * Transforms Mongoose Duplicate Key error (MongoDB error code 11000) into a 409 Conflict AppError.
 */
const handleDuplicateFieldsDB = (err: CustomError): AppError => {
  const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
  const value = err.keyValue ? Object.values(err.keyValue)[0] : '';
  const message =
    field === 'trackingCode'
      ? `Tracking code '${value}' already exists. Please use a unique tracking code.`
      : `Duplicate value for '${field}': "${value}". Please use a unique value.`;
  return new AppError(409, message);
};

/**
 * Transforms Mongoose Schema Validation errors into a clean 400 Bad Request AppError.
 */
const handleValidationErrorDB = (err: CustomError): AppError => {
  const errorMessages = err.errors
    ? Object.values(err.errors).map((el) => el.message)
    : ['Validation failed on one or more fields.'];
  return new AppError(400, 'Validation failed', errorMessages);
};

/**
 * Handles malformed JSON bodies parsed by express.json().
 */
const handleJsonSyntaxError = (): AppError => {
  return new AppError(400, 'Malformed JSON payload in request body.');
};

/**
 * Sends detailed error feedback in Development mode.
 */
const sendErrorDev = (err: AppError, _req: Request, res: Response): void => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(err.errors && { errors: err.errors }),
    error: err,
    stack: err.stack,
  });
};

/**
 * Sends safe, sanitized error responses in Production mode (preventing info leakage).
 */
const sendErrorProd = (err: AppError, _req: Request, res: Response): void => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  } else {
    // Programming or unknown bug: don't leak details to client
    console.error('[MOVA Central Error Handler] UNEXPECTED EXCEPTION 💥:', err);

    res.status(500).json({
      status: 'error',
      message: 'Internal server error. Please try again later.',
    });
  }
};

/**
 * Centralized Express Error Handling Middleware.
 * Express recognizes this as an error handler because of its 4-parameter signature: (err, req, res, next).
 */
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error: AppError;

  // If the error is already an instance of AppError, keep it
  if (err instanceof AppError) {
    error = err;
  } else {
    // Normalize into an AppError, mapping known database and runtime error types
    let operationalError: AppError | null = null;

    // 1. Mongoose invalid ObjectId (CastError)
    if (err.name === 'CastError') {
      operationalError = handleCastErrorDB(err);
    }
    // 2. MongoDB duplicate key error (code 11000)
    else if (err.code === 11000) {
      operationalError = handleDuplicateFieldsDB(err);
    }
    // 3. Mongoose Schema Validation error
    else if (err.name === 'ValidationError') {
      operationalError = handleValidationErrorDB(err);
    }
    // 4. Zod Request Validation error
    else if (err instanceof ZodError || err.name === 'ZodError') {
      const errorMessages = (err.issues || []).map((issue) => {
        const path = issue.path.join('.');
        return path ? `${path}: ${issue.message}` : issue.message;
      });
      operationalError = new AppError(400, 'Validation failed', errorMessages);
    }
    // 5. Malformed JSON body in request
    else if (err instanceof SyntaxError && 'body' in err) {
      operationalError = handleJsonSyntaxError();
    }

    if (operationalError) {
      error = operationalError;
    } else {
      // Unhandled / generic server error
      const statusCode = err.statusCode || 500;
      const message = err.message || 'Internal Server Error';
      error = new AppError(statusCode, message, undefined, false);
      error.stack = err.stack;
    }
  }

  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    sendErrorProd(error, req, res);
  } else {
    sendErrorDev(error, req, res);
  }
};
