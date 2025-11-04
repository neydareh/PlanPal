import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export function validateRequest(schema: AnyZodObject) {
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