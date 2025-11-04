import winston from 'winston';
import { Request } from 'express';

// Create Winston logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export interface LogContext {
  correlationId?: string;
  userId?: string;
  path?: string;
  method?: string;
  [key: string]: any;
}

export class LoggerService {
  static getRequestContext(req: Request): LogContext {
    return {
      correlationId: (req as any).correlationId,
      userId: (req as any).user?.sub,
      path: req.path,
      method: req.method,
      ip: req.ip,
    };
  }

  static info(message: string, context?: LogContext) {
    logger.info(message, { context });
  }

  static error(error: Error, context?: LogContext) {
    logger.error(error.message, {
      context,
      stack: error.stack,
      name: error.name
    });
  }

  static warn(message: string, context?: LogContext) {
    logger.warn(message, { context });
  }

  static debug(message: string, context?: LogContext) {
    logger.debug(message, { context });
  }
}

export default LoggerService;