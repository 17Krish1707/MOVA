/**
 * Custom Application Error Class
 * Represents operational, predictable errors across the application.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: 'fail' | 'error';
  public readonly isOperational: boolean;
  public readonly errors?: string[];

  /**
   * @param statusCode - HTTP status code (4xx for client fail, 5xx for server error)
   * @param message - Human-readable error description
   * @param errors - Optional array of granular error details (e.g. validation issues)
   * @param isOperational - Indicates if this is a known operational error vs unexpected bug
   */
  constructor(
    statusCode: number,
    message: string,
    errors?: string[],
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    this.errors = errors;

    // Maintain accurate stack trace (excluding constructor from stack)
    Error.captureStackTrace(this, this.constructor);
  }
}
