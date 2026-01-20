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
                items: { $ref: '#/components/schemas/Organization' }
              }
            }
          }
        }
      }
    },
    post: {
      summary: 'Create organization',
      tags: ['Organizations'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateOrganization' }
          }
        }
      },
      responses: {
        201: {
          description: 'Organization created',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Organization' }
            }
          }
        }
      }
    }
  },
  '/orgs/{orgId}': {
    get: {
      summary: 'Get organization',
      tags: ['Organizations'],
      parameters: [
        { in: 'path', name: 'orgId', required: true, schema: { type: 'string' } }
      ],
      responses: {
        200: {
          description: 'Organization detail',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Organization' }
            }
          }
        },
        404: { description: 'Organization not found' }
      }
    },
    put: {
      summary: 'Update organization',
      tags: ['Organizations'],
      parameters: [
        { in: 'path', name: 'orgId', required: true, schema: { type: 'string' } }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateOrganization' }
          }
        }
      },
      responses: {
        200: {
          description: 'Organization updated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Organization' }
            }
          }
        },
        404: { description: 'Organization not found' }
      }
    },
    delete: {
      summary: 'Delete organization',
      tags: ['Organizations'],
      parameters: [
        { in: 'path', name: 'orgId', required: true, schema: { type: 'string' } }
      ],
      responses: {
        204: { description: 'Organization deleted' },
        404: { description: 'Organization not found' }
      }
    }
  },
  '/orgs/{orgId}/members': {
    get: {
      summary: 'List org members',
      tags: ['Organizations'],
      parameters: [
        { in: 'path', name: 'orgId', required: true, schema: { type: 'string' } }
      ],
      responses: {
        200: {
          description: 'List of org members',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/OrgMembership' }
              }
            }
          }
        }
      }
    },
    post: {
      summary: 'Add org member',
      tags: ['Organizations'],
      parameters: [
        { in: 'path', name: 'orgId', required: true, schema: { type: 'string' } }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AddOrgMember' }
          }
        }
      },
      responses: {
        201: {
          description: 'Org member added',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OrgMembership' }
            }
          }
        },
        409: { description: 'Member already exists' }
      }
    }
  },
  '/orgs/{orgId}/members/{memberId}': {
    patch: {
      summary: 'Update org member role',
      tags: ['Organizations'],
      parameters: [
        { in: 'path', name: 'orgId', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'memberId', required: true, schema: { type: 'string' } }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateOrgMember' }
          }
        }
      },
      responses: {
        200: {
          description: 'Org member updated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OrgMembership' }
            }
          }
        },
        404: { description: 'Org member not found' }
      }
    },
    delete: {
      summary: 'Remove org member',
      tags: ['Organizations'],
      parameters: [
        { in: 'path', name: 'orgId', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'memberId', required: true, schema: { type: 'string' } }
      ],
      responses: {
        204: { description: 'Org member removed' },
        404: { description: 'Org member not found' }
      }
    }
  }
};
