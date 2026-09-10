# Logout Update

Logout is now available to every authenticated profile:

- Administrator
- Driver
- Fleet Manager
- Operations & Scheduling Manager
- Maintenance & Compliance
- Technician / Mechanic

There are two logout entry points:

1. The permanent **Logout** button at the bottom of the sidebar.
2. The authenticated user's profile menu in the top-right navbar.

Logout clears the TransSafe JWT and cached user profile from browser storage and redirects to `/login`.

No database migration is required.
