# TransSafe Dashboard Navigation Update

This build adds role-aware dashboard navigation across the authenticated application.

## Dashboard destinations

- Administrator -> `/`
- Driver -> `/driver-dashboard`
- Fleet Manager -> `/fleet-dashboard`
- Operations & Scheduling Manager -> `/operations-dashboard`
- Maintenance & Compliance -> `/maintenance-dashboard`
- Technician / Mechanic -> `/technician-dashboard`

## Changes

1. The Sidebar Dashboard item now automatically points to the authenticated user's role dashboard.
2. The TransSafe brand in the top navigation is clickable and returns to the role dashboard.
3. The user profile dropdown now contains a Dashboard action.
4. Existing logout behavior is preserved.
5. Role-based access control remains enforced through the existing `ROLE_CONFIG` and `RoleRoute` logic.

No database migration is required for this update.
