# API — Quick Reference

A short, human-friendly reference for the most-used Diran API endpoints. This file is intentionally concise and organized by feature.

Base URL

- Local: `http://localhost:4003/v1`
- Production: `https://api.diran.app/v1`

## Auth

- All protected endpoints require: `Authorization: Bearer <token>`

- POST /auth/signup — public — create account
- POST /auth/login — public — returns { token, refreshToken }
- POST /auth/refresh — public — exchange refresh token
- POST /auth/logout — auth — invalidate refresh token
- POST /auth/forgot-password — public — request reset email
- POST /auth/reset-password — public — reset using token
- POST /auth/verify-email — public — verify email with OTP
- POST /auth/resend-otp — public — resend verification OTP

## User

- GET /user/profile — auth — current user profile
- PATCH /user/profile — auth — update profile
- POST /user/profile/photo — auth — multipart upload
- POST /user/change-password — auth — change password

## Team

- GET /team — auth — list teams
- POST /team — auth — create team
- GET /team/{teamId} — auth — get team details
- PUT /team/{teamId} — auth — update team
- DELETE /team/{teamId} — auth — delete team
- POST /team/{teamId}/member — auth — add member
- PUT /team/{teamId}/member/{memberId} — auth — update member role
- DELETE /team/{teamId}/member/{memberId} — auth — remove member
- POST /team/{teamId}/leave — auth — leave team
- GET /team/{teamId}/pages — auth — get team pages
- POST /team/{teamId}/pages — auth — create team page

## Block

- POST /block — auth — create block
- GET /block/search?q=... — auth — search blocks
- GET /block/{id} — auth — get block
- PUT /block/{id} — auth — update block
- DELETE /block/{id} — auth — delete block
- GET /block/{id}/children — auth — direct children
- GET /block/{id}/tree — auth — nested children tree
  - Permissions: `/block/{id}/permissions` (GET/POST/PUT/DELETE) — auth + owner role

## Page

- GET /page — auth — list pages user can access
- POST /page — auth — create page
- GET /page/s/{slug} — public — get published page
- Publish (owner only): `/page/{id}/publish` (GET/POST/PUT/DELETE)

## AI

- POST /ai — public — perform generation/rewrites (no auth required)

## Extras

- POST /extras/waitlist — public — join waitlist
- GET /health — public — health check

## Collab (Realtime)

- WebSocket: `GET /ws/collab` (upgrade to websocket; include `Authorization` header during handshake)

## Notes

- This is a concise reference; for a more detailed, interactive spec see `docs/openapi.yaml` and open `docs/index.html` (ReDoc) or run `bunx run docs:serve`.
- If you want any specific example requests added here, tell me which endpoints and I’ll add one-liners.
