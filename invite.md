# ChurchFLow - Team Invitation System Plan

## Core pieces
- **Invite record:** `id`, `teamId`, `email`, `role`, `token` (hashed), `status` (pending/accepted/declined/expired), expiresAt, createdBy.
- **Secure token:** random, unguessable; store hash in DB, send raw token in URL.
- **Endpoints:**
  - POST /teams/:teamId/invites (admin only): create invite, email link.
  - GET /invites/:token: fetch invite details if valid.
  - POST /invites/:token/accept: accept invite.
  - POST /invites/:token/decline: decline invite.

## Flow
1) Admin generates invite for email + role -> system emails invite link.
2) User opens link:
   - If invalid/expired: show error.
   - If logged in:
     - If email matches invite: accept/decline.
     - If mismatch: prompt to switch account.
   - If not logged in: show Sign up / Log in choice.
3) After auth:
   - If user email matches invite: create team membership and mark accepted.
   - If not: block or require verification (policy choice).

## Key decisions
- Single-use token; set expiration (e.g., 7-14 days).
- Email match required to prevent wrong-account accept.
- Role assigned on accept.

## Implementation checklist
- Server: Invite model/table + routes + service layer.
- Client: Invite landing page + auth gate + accept/decline UI.
- Email: send invite link.
