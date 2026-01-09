import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { UnauthorizedError } from 'express-oauth2-jwt-bearer';
import { AppError } from '../utils/errors';
import LoggerService from '../utils/logger';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const context = LoggerService.getRequestContext(req);

  // Log the error
  LoggerService.error(error, context);

  // Handle known errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      code: error.code,
      details: error.details,
      correlationId: context.correlationId
    });
  }

  // Handle OAuth-related auth errors (missing/invalid tokens, etc.)
  if (error instanceof UnauthorizedError) {
    const authError = error as UnauthorizedError & { code?: string; headers?: Record<string, string> };
    if (authError.headers) {
      res.set(authError.headers);
    }

    return res.status(authError.status || authError.statusCode || 401).json({
      message: authError.message || '401 Unauthorized Error',
      code: authError.code || 'UNAUTHORIZED',
      correlationId: context.correlationId || 'no-correlation-id'
    });
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      code: 'VALIDATION_ERROR',
      details: error.errors,
      correlationId: context.correlationId
    });
  }

  // Handle unknown errors
  return res.status(500).json({
    message: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    correlationId: context.correlationId,
    ...(process.env.NODE_ENV !== 'production' && {
      stack: error.stack,
      details: error.message
    })
  });
}
