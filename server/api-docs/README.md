# PlanPal API Documentation

## Overview

PlanPal is a ministry management platform that helps churches streamline scheduling, song library management, and team coordination. This document provides information about the API endpoints and how to use them.

## Authentication

All API endpoints require Kinde bearer token authentication, except health checks.

### Bearer Token Authentication

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## Rate Limiting

- Default rate limit: 1000 requests per 15 minutes
- Authentication endpoints: 100 requests per 15 minutes
- Account creation: 100 accounts per 24 hours

## Error Handling

All errors follow a standard format:

```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {},
  "correlationId": "unique-request-id"
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Invalid input data
- `AUTHENTICATION_ERROR`: Authentication required
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND_ERROR`: Resource not found
- `RATE_LIMIT_ERROR`: Too many requests

## Pagination

List endpoints support pagination with the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Response format:
```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasMore": true
  }
}
```

## Interactive Documentation

When running in development mode, you can access the interactive API documentation at:

- Swagger UI: `/api-docs`
- OpenAPI Specification: `/api-docs.json`

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Org scoping

Event, song, blockout, org, team, and invite endpoints are org-scoped. The API resolves the active organization from the Kinde JWT `org_code` or `orgCode` claim.

Example:

```bash
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/events
```

UI paths:

- `/orgs/ORG_ID/dashboard`
- `/orgs/ORG_ID/calendar`
- `/orgs/ORG_ID/songs`
- `/orgs/ORG_ID/blockouts`

### Events

- `GET /api/events` - List events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/:id/songs` - List event songs
- `POST /api/events/:id/songs` - Add song to event

### Organizations

- `GET /api/orgs` - List organizations
- `POST /api/orgs` - Create organization
- `GET /api/orgs/:orgId` - Get organization
- `GET /api/orgs/:orgId/members` - List org teams
- `POST /api/orgs/:orgId/members` - Add org team

### Users

- `GET /api/users` - List users
- `GET /api/users/current` - Get current user
- `POST /api/users/current` - Pair current Kinde user with local user
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user

### Teams

- `GET /api/orgs/:orgId/teams` - List teams
- `POST /api/orgs/:orgId/teams` - Create team
- `GET /api/orgs/:orgId/teams/:teamId` - Get team
- `GET /api/orgs/:orgId/teams/:teamId/members` - List team members
- `POST /api/orgs/:orgId/teams/:teamId/members` - Add team member
- `PATCH /api/orgs/:orgId/teams/:teamId/members/:memberId` - Update team member
- `GET /api/orgs/:orgId/teams/:teamId/invites` - List team invites
- `POST /api/orgs/:orgId/teams/:teamId/invites` - Create team invite
- `POST /api/orgs/:orgId/teams/:teamId/invites/:inviteId/regenerate` - Regenerate team invite

### Invites

- `GET /api/invites/:token` - Get invite
- `POST /api/invites/:token/accept` - Accept invite
- `POST /api/invites/:token/decline` - Decline invite

### Songs

- `GET /api/songs` - List songs
- `POST /api/songs` - Create song
- `PUT /api/songs/:id` - Update song
- `DELETE /api/songs/:id` - Delete song

### Blockouts

- `GET /api/blockouts` - List blockouts
- `POST /api/blockouts` - Create blockout
- `GET /api/blockouts/:id` - Get blockout
- `DELETE /api/blockouts/:id` - Delete blockout

## Health Checks

- `GET /api/health` - Service health status
- `GET /api/health/readiness` - Service readiness status
