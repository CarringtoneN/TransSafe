# Operational Alerts & Mechanic Incident Visibility

Implemented the requested cross-module operational awareness improvements.

## Mechanic / Technician
- Can open and view the full Incident Reports module.
- Incident Reports are view-only for the Technician / Mechanic profile.
- Receives upcoming maintenance alerts from the maintenance schedule.
- Receives active work-order alerts.
- Receives open / under-investigation incident alerts.

## Maintenance & Compliance
- Receives upcoming/overdue maintenance alerts.
- Receives active work-order alerts.
- Receives open / under-investigation incident alerts.
- Receives compliance expiry/missing alerts.

## Operations & Scheduling
- Receives upcoming trip alerts.
- Receives open / under-investigation incident alerts.
- Receives maintenance schedule alerts that may affect operations.

## Notification delivery
- A live Operational Alerts panel is shown on the three role dashboards.
- The top navigation Bell now displays active high/critical alert counts.
- Alerts refresh automatically every 60 seconds and can also be refreshed manually.
- Alerts link directly to the relevant module.

No Prisma migration is required for this update; it uses the existing maintenance, work-order, incident, compliance and trip data.
