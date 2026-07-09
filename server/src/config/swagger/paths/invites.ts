export const invitePaths = {
  '/invites/{token}': {
    get: {
      summary: 'Get team invite',
      tags: ['Team Invites'],
      security: [{ BearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'token', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: {
          description: 'Invite details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TeamInviteLookupResponse' },
            },
          },
        },
        403: { description: 'Invite email mismatch' },
        404: { description: 'Invite not found' },
      },
    },
  },
  '/invites/{token}/accept': {
    post: {
      summary: 'Accept team invite',
      tags: ['Team Invites'],
      security: [{ BearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'token', required: true, schema: { type: 'string' } },
      ],
      responses: {
        201: {
          description: 'Invite accepted',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TeamMembership' },
            },
          },
        },
        403: { description: 'Invite email mismatch' },
        404: { description: 'Invite not found' },
        409: { description: 'Invite is not pending or user is already a member' },
      },
    },
  },
  '/invites/{token}/decline': {
    post: {
      summary: 'Decline team invite',
      tags: ['Team Invites'],
      security: [{ BearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'token', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: {
          description: 'Invite declined',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TeamInvite' },
            },
          },
        },
        403: { description: 'Invite email mismatch' },
        404: { description: 'Invite not found' },
        409: { description: 'Invite is not pending' },
      },
    },
  },
};
