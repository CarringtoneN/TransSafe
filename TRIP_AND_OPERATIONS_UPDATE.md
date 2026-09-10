# TransSafe Trip Operations Update

This package builds on the latest working TransSafe Vehicles UI package and adds the requested operational workflow.

### Driver portal
- My Trips page with Upcoming / Ongoing / Completed filters.
- Start Trip changes the trip to IN_PROGRESS automatically.
- Pause Trip records a named stop-over, location and time.
- Resume Trip records the resume event.
- End Trip changes the trip to COMPLETED and records end time/location.
- Change Driver records the takeover driver, takeover time and takeover location.
- A trip's driver segments and event timeline are shared between the driver profiles that operated it.

### Driver/vehicle allocation
- A driver can have only one active vehicle allocation.
- A vehicle can have a maximum of two active drivers.
- Trip scheduling can start from either driver or vehicle; active allocation data resolves the other side.
- If a vehicle has two active drivers, the scheduler must select which driver is operating the trip.

### Incidents and maintenance
- Fleet Managers receive operational incident alerts.
- Fleet/Maintenance/Technician users can create a maintenance ticket from an incident.
- Linked work orders show the incident reference.
- Completing a linked work order records the technician's explanation and resolves the incident across the system.
- Incidents can also be resolved directly with resolution notes.
- Only one maintenance service can be IN_PROGRESS for a vehicle at a time across maintenance schedules, work orders and repairs.

### Alerts
- Fleet Manager, Operations Manager, Maintenance & Compliance and Technician/Mechanic receive relevant operational alerts.
- Maintenance reminders and incidents are included for the maintenance-oriented roles.

### Dashboard metrics
- Fuel cost and litres are explicitly labelled as the last 30 days on the main dashboard.
- Reports already use a date-bounded reporting period and remain available for custom date ranges.

## Database synchronization
Do not use `prisma migrate dev` for this update because the project contains historical migration drift. From the `backend` directory run:

```powershell
npm run db:sync-trip-features
npx prisma generate
npm run dev
```

The synchronizer is idempotent. It creates the trip-driver and trip-event tables, adds incident/work-order linkage and resolution fields, adds incident evidence fields used by the existing incident module, and backfills the initial driver segment for existing trips.
