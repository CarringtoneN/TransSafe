# TransSafe Operational Enhancements

This build adds integrated trip/vehicle/maintenance controls.

## Important first step
Because the existing project has a migration history with prior drift, use the included synchronization script before starting the API:

```powershell
cd backend
npm run db:sync-enhancements
npx prisma generate
npm run dev
```

Do not run `prisma migrate reset` unless you intentionally want to delete all development data.

## Included
- Driver trip pause/resume state.
- Driver takeover/handover with location/time captured in trip events and driving segments.
- End-trip odometer capture; actual distance is stored and vehicle current mileage is updated.
- Trip >500 km requires two drivers actively allocated to the same vehicle.
- Maintenance-date scheduling blocks trips on a vehicle's scheduled service day.
- Service-mileage rule keeps a 50 km buffer before the next due-mileage service.
- Vehicle registration now supports carrying capacity and current mileage.
- Vehicle details prominently show registration and trip/mileage summary.
- Fuel entry shows estimated range and approximate average-trip coverage when historical data exists.
- Pre-trip driver checklist starts unchecked and must be physically ticked.
- Admin can register a Mechanic with a workshop.
- Work-order mechanic selection uses registered active Mechanic users and auto-loads workshop.
- "Do The Repair" opens the Record Repair workflow.
- Approval audit records are captured for maintenance schedules and work orders.
- Approval Summary page is available at `/approval-report` for authorized management roles.
