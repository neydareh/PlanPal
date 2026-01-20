export const teamPaths = {
  '/orgs/{orgId}/teams': {
    get: {
      summary: 'List teams for org',
      tags: ['Teams'],
      parameters: [
        { in: 'path', name: 'orgId', required: true, schema: { type: 'string' } }
      ],
      responses: {
        200: {
          description: 'List of teams',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Team' }
              }
            }
          }
        }
      }
    },
    post: {
      summary: 'Create team',
      tags: ['Teams'],
      parameters: [
        { in: 'path', name: 'orgId', required: true, schema: { type: 'string' } }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateTeam' }
          }
        }
      },
      responses: {
        201: {
          description: 'Team created',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Team' }
            }
          }
        }
      }
    }
  },
  '/orgs/{orgId}/teams/{teamId}': {
    get: {
      summary: 'Get team',
      tags: ['Teams'],
      parameters: [
        { in: 'path', name: 'orgId', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'teamId', required: true, schema: { type: 'string' } }
      ],
      responses: {
        200: {
          description: 'Team detail',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Team' }
            }
          }
        },
        404: { description: 'Team not found' }
      }
    },
    put: {
      summary: 'Update team',
      tags: ['Teams'],
      parameters: [
        { in: 'path', name: 'orgId', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'teamId', required: true, schema: { type: 'string' } }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateTeam' }
          }
        }
      },
      responses: {
        200: {
          description: 'Team updated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Team' }
            }
          }
        },
        404: { description: 'Team not found' }
      }
    },
    delete: {
      summary: 'Delete team',
      tags: ['Teams'],
      parameters: [
        { in: 'path', name: 'orgId', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'teamId', required: true, schema: { type: 'string' } }
      ],
      responses: {
        204: { description: 'Team deleted' },
        404: { description: 'Team not found' }
      }
    }
  },
  '/orgs/{orgId}/teams/{teamId}/members': {
    get: {
      summary: 'List team members',
      tags: ['Teams'],
      parameters: [
        { in: 'path', name: 'orgId', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'teamId', required: true, schema: { type: 'string' } }
      ],
      responses: {
        200: {
          description: 'List of team members',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/TeamMembership' }
              }
            }
          }
        }
      }
    },
    post: {
      summary: 'Add team member',
      tags: ['Teams'],
      parameters: [
        { in: 'path', name: 'orgId', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'teamId', required: true, schema: { type: 'string' } }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AddTeamMember' }
          }
        }
      },
      responses: {
        201: {
          description: 'Team member added',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TeamMembership' }
            }
          }
        },
        409: { description: 'Member already exists' }
      }
    }
  },
  '/orgs/{orgId}/teams/{teamId}/members/{memberId}': {
    patch: {
      summary: 'Update team member',
      tags: ['Teams'],
      parameters: [
        { in: 'path', name: 'orgId', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'teamId', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'memberId', required: true, schema: { type: 'string' } }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateTeamMember' }
          }
        }
      },
      responses: {
        200: {
          description: 'Team member updated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TeamMembership' }
            }
          }
        },
        404: { description: 'Team member not found' }
      }
    },
    delete: {
      summary: 'Remove team member',
      tags: ['Teams'],
      parameters: [
        { in: 'path', name: 'orgId', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'teamId', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'memberId', required: true, schema: { type: 'string' } }
      ],
      responses: {
        204: { description: 'Team member removed' },
        404: { description: 'Team member not found' }
      }
    }
  }
};
