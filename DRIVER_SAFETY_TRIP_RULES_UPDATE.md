# Driver Safety & Trip Rules Update

This update adds server-side enforcement for the driver trip safety rules requested for TransSafe.

## Rules implemented

1. **4-hour break alert**
   - Continuous driving time is tracked from actual `tripDriver` driving segments.
   - A driver receives a HIGH operational alert after 4 continuous hours of driving.
   - The My Trips page also displays the continuous driving time and break warning.
   - Pausing a trip closes the current driving segment; resuming creates a new segment, so stop-overs do not incorrectly count as driving time.

2. **10-hour driving limit**
   - Driving time is accumulated over a rolling 24-hour window.
   - A driver cannot start or resume driving once the 10-hour limit has been reached.
   - If an active segment reaches the 10-hour limit, the backend automatically closes that driving segment and records a `DRIVING_LIMIT` trip event. The trip remains ongoing so a driver handover or trip end can be completed.

3. **Pre-trip vehicle inspection**
   - A driver cannot start a scheduled trip without a PASS pre-trip vehicle inspection for the assigned vehicle on the same calendar day.
   - Failed inspections do not satisfy the requirement.
   - The inspection is tied to the driver and vehicle.

4. **Six-hour rest period**
   - After a driver ends a trip, a six-hour rest period is enforced before that driver can start another trip.
   - The remaining rest time is exposed through the driver safety status and operational alerts.

5. **Workshop mechanical issue block**
   - A vehicle cannot be scheduled/allocated for a trip if it has an active workshop issue in:
     - maintenance schedule: `IN_PROGRESS`
     - work order: `ASSIGNED`, `AWAITING_PARTS`, or `IN_PROGRESS`
     - repair: `IN_PROGRESS`, `AWAITING_PARTS`, or `READY_FOR_INSPECTION`
   - The check is also repeated when starting/resuming a trip so a vehicle that develops a workshop issue after scheduling cannot be started.

## Database impact

No new Prisma models or migration are required. The feature uses the existing `tripDriver`, `tripEvent`, `inspection`, `workOrder`, `repair`, and `maintenanceSchedule` structures already present in the working TransSafe package.

Continue using the existing `db:sync-trip-features` synchronization strategy rather than `prisma migrate dev`, because the existing project database has migration drift.
