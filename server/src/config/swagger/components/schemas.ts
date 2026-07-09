export const schemas = {
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
      orgId: { type: 'string' },
      title: { type: 'string' },
      date: { type: 'string', format: 'date-time' },
      createdBy: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  EventInput: {
    type: 'object',
    required: ['title', 'date', 'createdBy'],
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      date: { type: 'string', format: 'date-time' },
      createdBy: { type: 'string' }
    }
  },
  Song: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      orgId: { type: 'string' },
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
    required: ['title', 'artist', 'key', 'createdBy'],
    properties: {
      title: { type: 'string' },
      artist: { type: 'string' },
      key: { type: 'string' },
      tempo: { type: 'number', minimum: 20, maximum: 300 },
      youtubeUrl: { type: 'string', format: 'uri' },
      createdBy: { type: 'string' }
    }
  },
  User: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      authProviderId: { type: 'string', nullable: true },
      email: { type: 'string', format: 'email' },
      firstName: { type: 'string', nullable: true },
      lastName: { type: 'string', nullable: true },
      profileImageUrl: { type: 'string', nullable: true },
      role: { type: 'string', enum: ['admin', 'user'] },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  UpdateUser: {
    type: 'object',
    properties: {
      authProviderId: { type: 'string' },
      email: { type: 'string', format: 'email' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      profileImageUrl: { type: 'string' },
      role: { type: 'string', enum: ['admin', 'user'] }
    }
  },
  Blockout: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      orgId: { type: 'string' },
      userId: { type: 'string' },
      startDate: { type: 'string', format: 'date-time' },
      endDate: { type: 'string', format: 'date-time' },
      reason: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  BlockoutInput: {
    type: 'object',
    required: ['userId', 'startDate', 'endDate'],
    properties: {
      userId: { type: 'string' },
      startDate: { type: 'string', format: 'date-time' },
      endDate: { type: 'string', format: 'date-time' },
      reason: { type: 'string' }
    }
  },
  Organization: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      orgCode: { type: 'string', nullable: true },
      createdBy: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  Team: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      orgId: { type: 'string' },
      name: { type: 'string' },
      createdBy: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  OrgTeamMembership: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      orgId: { type: 'string' },
      teamId: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  TeamMembership: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      teamId: { type: 'string' },
      userId: { type: 'string' },
      role: { type: 'string', enum: ['admin', 'user'] },
      memberFunction: {
        type: 'string',
        enum: ['vocalist', 'bass', 'piano', 'guitar', 'other'],
        nullable: true
      },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  CreateOrganization: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' },
      orgCode: { type: 'string' }
    }
  },
  UpdateOrganization: {
    type: 'object',
    properties: {
      name: { type: 'string' }
    }
  },
  CreateTeam: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' }
    }
  },
  UpdateTeam: {
    type: 'object',
    properties: {
      name: { type: 'string' }
    }
  },
  AddOrgMember: {
    type: 'object',
    required: ['teamId'],
    properties: {
      teamId: { type: 'string' }
    }
  },
  UpdateOrgMember: {
    type: 'object',
    required: ['teamId'],
    properties: {
      teamId: { type: 'string' }
    }
  },
  AddTeamMember: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: { type: 'string' },
      role: { type: 'string', enum: ['admin', 'user'] },
      memberFunction: {
        type: 'string',
        enum: ['vocalist', 'bass', 'piano', 'guitar', 'other']
      }
    }
  },
  UpdateTeamMember: {
    type: 'object',
    properties: {
      role: { type: 'string', enum: ['admin', 'user'] },
      memberFunction: {
        type: 'string',
        enum: ['vocalist', 'bass', 'piano', 'guitar', 'other']
      }
    }
  },
  TeamInvite: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      teamId: { type: 'string' },
      email: { type: 'string', format: 'email' },
      role: { type: 'string', enum: ['admin', 'user'] },
      memberFunction: {
        type: 'string',
        enum: ['vocalist', 'bass', 'piano', 'guitar', 'other'],
        nullable: true
      },
      message: { type: 'string', nullable: true },
      status: {
        type: 'string',
        enum: ['pending', 'accepted', 'declined', 'expired', 'revoked']
      },
      expiresAt: { type: 'string', format: 'date-time' },
      createdBy: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  CreateTeamInvite: {
    type: 'object',
    required: ['email', 'role'],
    properties: {
      email: { type: 'string', format: 'email' },
      role: { type: 'string', enum: ['admin', 'user'] },
      memberFunction: {
        type: 'string',
        enum: ['vocalist', 'bass', 'piano', 'guitar', 'other']
      },
      message: { type: 'string', maxLength: 500 },
      expiresInDays: { type: 'integer', minimum: 1, maximum: 60 }
    }
  },
  TeamInviteTokenResponse: {
    type: 'object',
    properties: {
      invite: { $ref: '#/components/schemas/TeamInvite' },
      token: { type: 'string' }
    }
  },
  TeamInviteLookupResponse: {
    type: 'object',
    properties: {
      invite: { $ref: '#/components/schemas/TeamInvite' },
      team: {
        type: 'object',
        nullable: true,
        properties: {
          id: { type: 'string' },
          name: { type: 'string' }
        }
      }
    }
  }
};
