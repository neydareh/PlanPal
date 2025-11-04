import swaggerJsdoc from 'swagger-jsdoc';
const version = process.env.npm_package_version || '1.0.0';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PlanPal API Documentation',
      version,
      description: 'API documentation for PlanPal - A ministry management platform',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      contact: {
        name: 'API Support',
        url: 'https://github.com/neydareh/PlanPal',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'Development server',
      },
    ],
    paths: {
      '/events': {
        get: {
          summary: 'List events',
          tags: ['Events'],
          security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10, maximum: 100 } }
          ],
          responses: {
            200: {
              description: 'List of events',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/Event' } },
                      meta: { $ref: '#/components/schemas/PaginationMeta' }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create event',
          tags: ['Events'],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EventInput' }
              }
            }
          },
          responses: {
            201: {
              description: 'Event created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Event' }
                }
              }
            }
          }
        }
      },
      '/events/{id}': {
        put: {
          summary: 'Update event',
          tags: ['Events'],
          security: [{ BearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EventInput' }
              }
            }
          },
          responses: {
            200: {
              description: 'Event updated',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Event' }
                }
              }
            }
          }
        },
        delete: {
          summary: 'Delete event',
          tags: ['Events'],
          security: [{ BearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
          ],
          responses: {
            204: { description: 'Event deleted' }
          }
        }
      },
      '/songs': {
        get: {
          summary: 'List songs',
          tags: ['Songs'],
          security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10, maximum: 100 } }
          ],
          responses: {
            200: {
              description: 'List of songs',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/Song' } },
                      meta: { $ref: '#/components/schemas/PaginationMeta' }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create song',
          tags: ['Songs'],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SongInput' }
              }
            }
          },
          responses: {
            201: {
              description: 'Song created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Song' }
                }
              }
            }
          }
        }
      },
      '/songs/{id}': {
        put: {
          summary: 'Update song',
          tags: ['Songs'],
          security: [{ BearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SongInput' }
              }
            }
          },
          responses: {
            200: {
              description: 'Song updated',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Song' }
                }
              }
            }
          }
        },
        delete: {
          summary: 'Delete song',
          tags: ['Songs'],
          security: [{ BearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
          ],
          responses: {
            204: { description: 'Song deleted' }
          }
        }
      },
      '/users': {
        get: {
          summary: 'List users',
          tags: ['Users'],
          security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10, maximum: 100 } }
          ],
          responses: {
            200: {
              description: 'List of users',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                      meta: { $ref: '#/components/schemas/PaginationMeta' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/users/current': {
        get: {
          summary: 'Get current user',
          tags: ['Users'],
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'Current user details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        }
      },
      '/users/{id}': {
        get: {
          summary: 'Get user',
          tags: ['Users'],
          security: [{ BearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: {
              description: 'User details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        },
        put: {
          summary: 'Update user',
          tags: ['Users'],
          security: [{ BearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateUser' }
              }
            }
          },
          responses: {
            200: {
              description: 'User updated',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        }
      },
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
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            code: { type: 'string' },
            details: { type: 'object' },
            correlationId: { type: 'string' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
            hasMore: { type: 'boolean' },
          },
        },
        Event: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            createdBy: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        EventInput: {
          type: 'object',
          required: ['title', 'date'],
          properties: {
            title: { type: 'string' },
            date: { type: 'string', format: 'date-time' }
          }
        },
        Song: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            artist: { type: 'string' },
            key: { type: 'string' },
            createdBy: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        SongInput: {
          type: 'object',
          required: ['title', 'artist'],
          properties: {
            title: { type: 'string' },
            artist: { type: 'string' },
            key: { type: 'string' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'user'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        UpdateUser: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'user'] }
          }
        }
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/interfaces/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);