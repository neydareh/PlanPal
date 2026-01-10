export const userPaths = {
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
  }
};
