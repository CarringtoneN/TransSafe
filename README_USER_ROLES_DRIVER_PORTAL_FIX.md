# TransSafe — User Roles + Driver Portal Fix

This package fixes two areas:

1. Admin user creation for Fleet Manager, Operations & Scheduling Manager, Maintenance & Compliance, and Technician/Mechanic.
2. Driver portal shift and vehicle-inspection workflow.

## Backend setup

From `backend`:

```powershell
npm install
npx prisma generate
npm run db:sync-roles
npm run db:seed
npm run dev
```

`npm run db:sync-roles` is important for an existing MySQL database whose `user.role` enum still contains only the older roles. It safely changes the enum to:

- ADMIN
- DISPATCHER
- DRIVER
- FLEET_MANAGER
- OPERATIONS_MANAGER
- MAINTENANCE_COMPLIANCE
- TECHNICIAN_MECHANIC

It does not reset or delete existing users.

## Frontend setup

From `frontend`:

```powershell
npm install
npm run dev
```

## Admin accounts

The admin can create:

- Driver
- Fleet Manager
- Operations & Scheduling Manager
- Maintenance & Compliance
- Technician / Mechanic

New accounts receive the default password `Trans#2026` and the email entered by the administrator.

Driver accounts also create and link a driver profile using the employee number and license details.

## Driver portal

A linked driver can:

- View assigned vehicles.
- Start a shift from the Driver Dashboard.
- End an active shift.
- Complete a vehicle safety inspection.
- Submit inspection results directly against their linked driver profile and assigned vehicle.
- View their assignments, shifts, inspections and incidents.

A driver cannot start a shift or submit an inspection against a vehicle that is not currently assigned to them.
