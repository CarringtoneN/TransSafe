# TransSafe Dynamic Dashboard & Reports Update

## What changed

### Dashboard
- Time-bound selectors: Today, Last 7 Days, Last 30 Days, Last 90 Days.
- Vehicle filter for dashboard metrics.
- Active vehicle, maintenance and out-of-service counts.
- Active driver count.
- Upcoming/ongoing/completed trip metrics for the selected period.
- Total and average trip mileage.
- Fuel cost, litres, average fuel price and calculated litres per 100 km when trip distance exists.
- Open incidents, maintenance costs and compliance alerts.
- Daily trip activity chart generated from actual trip records.
- Top vehicles by recorded trip distance.
- Recent trips and operational alerts.

### Reports
- Custom From/To date range.
- Vehicle filter.
- Driver filter.
- Dynamic KPI cards and financial totals.
- Daily trip trend chart.
- Top vehicles by distance.
- Status/severity breakdowns.
- Combined activity table.
- CSV export and print support.

## Backend API
- `GET /reports/summary`
- `GET /reports/data`
- `GET /reports/vehicles`
- `GET /reports/drivers`

## Installation
1. Extract this package over your current TransSafe project and allow files to be replaced.
2. In `backend` run:

```powershell
npm install
npx prisma generate
npm run dev
```

3. In a second terminal, start the frontend as you normally do:

```powershell
cd frontend
npm install
npm run dev
```

No new Prisma migration is required for this update. The implementation uses the existing TransSafe schema.
