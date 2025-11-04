# PlanPal API Documentation

## Overview

PlanPal is a ministry management platform that helps churches streamline scheduling, song library management, and team coordination. This document provides information about the API endpoints and how to use them.

## Authentication

All API endpoints require authentication. We support two types of authentication:

1. Bearer Token Authentication (for user-facing applications)
2. API Key Authentication (for service-to-service communication)

### Bearer Token Authentication

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```

### API Key Authentication

Include your API key in the X-API-Key header:
```
X-API-Key: <your_api_key>
```

## Rate Limiting

- Default rate limit: 100 requests per 15 minutes
- Authentication endpoints: 5 requests per hour
- Account creation: 3 accounts per 24 hours

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

### Events

- `GET /api/events` - List events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Users

- `GET /api/users` - List users
- `GET /api/users/me` - Get current user
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user

### Songs

- `GET /api/songs` - List songs
- `POST /api/songs` - Create song
- `PUT /api/songs/:id` - Update song
- `DELETE /api/songs/:id` - Delete song

## Health Checks

- `GET /health` - Service health status
- `GET /readiness` - Service readiness status