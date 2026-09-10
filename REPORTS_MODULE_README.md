# TransSafe Reports Module — Complete

This package upgrades the Reports module from a placeholder page into a
working fleet-wide reporting module.

## Included reporting domains

- Fleet vehicles and drivers
- Trips and completion rate
- Fuel usage and KSh cost
- Incidents and estimated cost
- Maintenance cost
- Work orders
- Repairs
- Compliance
- Inspections
- Driver/vehicle assignments
- Shift hours
- Vehicle document expiry

## API

- GET `/api/reports/summary?from=YYYY-MM-DD&to=YYYY-MM-DD&vehicleId=ID`
- GET `/api/reports/data?from=YYYY-MM-DD&to=YYYY-MM-DD&vehicleId=ID&limit=100`
- GET `/api/reports/vehicles`

## Frontend

The Reports page is available at:

`/reports`

Features:

- Date range filtering
- Vehicle filtering
- Generate report
- KES currency formatting
- KPI cards
- Status/severity breakdowns
- Combined activity table
- CSV export
- Browser print

## Installation

Replace the files from this package in your current TransSafe project.

Then from `backend`:

```powershell
npx prisma generate
npm run dev
```

From `frontend`:

```powershell
npm run dev
```

No new database migration is required because the reports module reads the
existing TransSafe data models and performs reporting/aggregation only.
