export const healthPaths = {
  '/health': {
    get: {
      summary: 'Service health status',
      tags: ['Health'],
      responses: {
        200: {
          description: 'Health check status',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['healthy', 'unhealthy'] },
                  timestamp: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/health/readiness': {
    get: {
      summary: 'Service readiness status',
      tags: ['Health'],
      responses: {
        200: {
          description: 'Readiness check status',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['ready', 'not_ready'] },
                  checks: {
                    type: 'object',
                    properties: {
                      database: { type: 'boolean' },
                      redis: { type: 'boolean' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
