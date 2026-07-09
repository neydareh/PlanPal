export const orgPaths = {
  '/orgs': {
    get: {
      summary: 'List organizations for current user',
      tags: ['Organizations'],
      responses: {
        200: {
          description: 'List of organizations',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Organization' },
              },
            },
          },
        },
      },
    },
    post: {
      summary: 'Create organization',
      tags: ['Organizations'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateOrganization' },
          },
        },
      },
      responses: {
        201: {
          description: 'Organization created',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Organization' },
            },
          },
        },
      },
    },
  },
  '/orgs/{orgId}': {
    get: {
      summary: 'Get organization',
      tags: ['Organizations'],
      parameters: [
        { in: 'path', name: 'orgId', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: {
          description: 'Organization detail',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Organization' },
            },
          },
        },
        404: { description: 'Organization not found' },
      },
    },
  },
  '/orgs/{orgId}/members': {
    get: {
      summary: 'List org teams',
      tags: ['Organizations'],
      parameters: [
        { in: 'path', name: 'orgId', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: {
          description: 'List of org teams',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/OrgTeamMembership' },
              },
            },
          },
        },
      },
    },
    post: {
      summary: 'Add org team',
      tags: ['Organizations'],
      parameters: [
        { in: 'path', name: 'orgId', required: true, schema: { type: 'string' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AddOrgMember' },
          },
        },
      },
      responses: {
        201: {
          description: 'Org team added',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OrgTeamMembership' },
            },
          },
        },
        409: { description: 'Member already exists' },
      },
    },
  },
};
