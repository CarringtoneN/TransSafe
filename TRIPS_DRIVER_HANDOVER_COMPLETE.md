# TransSafe Trips + Driver Handover Update

## Included
- Driver portal **My Trips** with Upcoming / Ongoing / Completed views.
- Start Trip, Pause, Resume and End Trip actions.
- Stop-over name, location and notes recorded in a shared trip timeline.
- Driver takeover with takeover time and location.
- Shared trip history between all drivers who operated the same trip, with separate driving segments.
- Driver/vehicle scheduling can start from either a driver or a vehicle; the system resolves the other side from active allocations.
- A driver can have only one active vehicle allocation. A vehicle can have at most two active drivers.
- Pre-Trip Vehicle Inspection naming in the driver-facing areas.
- Fleet Manager incident alerts, maintenance-ticket creation and incident resolution workflow.
- Maintenance work orders linked to incidents; completing a linked work order resolves the incident everywhere.
- One active maintenance service per vehicle is enforced across schedules, work orders and repairs.
- Dashboard fuel/cost figures are explicitly labelled as the last 30 days.

## Database setup
Because the project currently has historical Prisma migration drift, this update includes a safe idempotent database synchronizer instead of requiring a migration reset. From `backend` run:

```powershell
npm run db:sync-trip-features
npx prisma generate
npm run dev
```

Run the sync script once after replacing the project ZIP. It creates the `trip_driver` and `trip_event` tables, adds incident/work-order linkage fields, and backfills the initial driver segment for existing trips.
