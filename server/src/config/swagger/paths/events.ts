export const eventPaths = {
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
  }
};
