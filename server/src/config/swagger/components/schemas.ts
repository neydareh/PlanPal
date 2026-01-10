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
  },
  Blockout: {
    type: 'object',
    properties: {
      id: { type: 'string' },
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
  }
};
