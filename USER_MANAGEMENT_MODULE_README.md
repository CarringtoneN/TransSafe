TransSafe User Management & Role-Based Access module
# TransSafe User Management & Role-Based Access

## Roles
- ADMIN
- DRIVER
- FLEET_MANAGER
- OPERATIONS_MANAGER
- MAINTENANCE_COMPLIANCE
- TECHNICIAN_MECHANIC

## Default credentials for accounts created by the Admin
- Email: the email entered by the administrator
- Initial password: `Trans#2026`

## Admin
Run `npm run db:seed` in backend once after applying migrations to create:
`admin@transsafe.com` / `Trans#2026`

## Backend
- POST `/api/auth/login`
- GET `/api/auth/me`
- GET `/api/users`
- POST `/api/users`
- PATCH `/api/users/:id/status`
- POST `/api/users/:id/reset-password`
- GET `/api/me/driver-dashboard`
- GET `/api/me/driver/:resource`

## Access model
Frontend routes are protected by role, and admin-only user management is also protected server-side with JWT + role middleware.
