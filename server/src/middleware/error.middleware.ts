import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
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