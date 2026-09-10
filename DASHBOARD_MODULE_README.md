# TransSafe Dashboard Module

This replacement makes the Dashboard consume live data from the existing Reports API, which aggregates Vehicles, Drivers, Trips, Fuel, Incidents, Maintenance, Compliance, Inspections, Assignments and Shifts.

## Dashboard data

The dashboard calls:
- GET /api/reports/summary
- GET /api/reports/data?limit=8

No new database tables or migrations are required.

## Collapsible navigation

Fleet Management, Driver Management, Maintenance and Operations are collapsible. Their open/closed state is stored in localStorage, and a section automatically opens when its current route is active.

## KSh localization

Dashboard financial values are formatted as Kenyan Shillings (KES/KSh).
