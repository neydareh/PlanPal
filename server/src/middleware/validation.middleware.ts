import { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';

export function validateRequest(schema: ZodTypeAny) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: error.errors,
        });
      }
      next(error);
    }
  };
}

// Example usage with request schema
// export const validateEventRequest = validateQuery(
//   CreateEventSchema.extend({
//     params: CreateEventSchema.partial(),
//     query: CreateEventSchema.partial(),
//   })
// );
