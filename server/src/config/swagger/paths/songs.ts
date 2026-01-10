export const songPaths = {
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
  }
};
