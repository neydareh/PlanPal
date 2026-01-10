export const blockoutPaths = {
  '/blockouts': {
    get: {
      summary: 'List blockouts',
      tags: ['Blockouts'],
      security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
      parameters: [
        { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
        { in: 'query', name: 'limit', schema: { type: 'integer', default: 10, maximum: 100 } }
      ],
      responses: {
        200: {
          description: 'List of blockouts',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: { type: 'array', items: { $ref: '#/components/schemas/Blockout' } },
                  meta: { $ref: '#/components/schemas/PaginationMeta' }
                }
              }
            }
          }
        }
      }
    },
    post: {
      summary: 'Create blockout',
      tags: ['Blockouts'],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/BlockoutInput' }
          }
        }
      },
      responses: {
        201: {
          description: 'Blockout created',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Blockout' }
            }
          }
        }
      }
    }
  },
  '/blockouts/{id}': {
    get: {
      summary: 'Get blockout',
      tags: ['Blockouts'],
      security: [{ BearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
      ],
      responses: {
        200: {
          description: 'Blockout details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Blockout' }
            }
          }
        },
        404: {
          description: 'Blockout not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    delete: {
      summary: 'Delete blockout',
      tags: ['Blockouts'],
      security: [{ BearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
      ],
      responses: {
        204: { description: 'Blockout deleted' }
      }
    }
  }
};
