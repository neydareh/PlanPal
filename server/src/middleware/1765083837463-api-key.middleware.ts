import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export interface ApiKeyAuthOptions {
  header?: string;
  query?: string;
}

const defaultOptions: ApiKeyAuthOptions = {
  header: 'X-API-Key',
  query: 'api_key'
};

export function apiKeyAuth(options: ApiKeyAuthOptions = defaultOptions) {
  const headerName = options.header ?? defaultOptions.header;
  const queryParam = options.query ?? defaultOptions.query;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apiKey = req.headers[headerName?.toLowerCase()] || req.query[queryParam!];

      if (!apiKey) {
        return res.status(401).json({
          message: 'API key is required',
          status_code: 'API_KEY_REQUIRED'
        });
      }

      // In a real application, you would validate the API key against a database
      // and possibly load associated permissions/rate limits
      if (apiKey !== config.apiKey) {
        return res.status(401).json({
          message: 'Invalid API key',
          status_code: 'INVALID_API_KEY'
        });
      }

      // Attach API key info to request for later use
      (req).apiKey = {
        key: apiKey,
        // Add other relevant information like:
        // - Associated client/service name
        // - Rate limit tier
        // - Permissions
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}