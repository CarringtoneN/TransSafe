# Two-Driver Trip Integration

This release adds first-class support for scheduling and operating one trip with up to two drivers.

- A trip may have one primary driver and one optional co-driver.
- Both drivers must be actively assigned to the same vehicle.
- A vehicle remains limited to two active driver allocations.
- A driver remains limited to one active vehicle allocation.
- The primary driver starts the trip.
- The scheduled co-driver sees the ongoing trip and gets a **Take Over Trip** action.
- Takeover closes the current driver's driving segment and opens the co-driver's segment at the takeover time/location.
- The trip timeline remains shared while driving time remains driver-specific.
- The 4-hour break alert, 10-hour driving limit, 6-hour rest rule, pre-trip inspection rule, and workshop mechanical-issue rule apply to each driver when they start or take over.
- The database sync adds `tripDriver.planned` safely to existing databases.

Run from `backend`:

```powershell
npm run db:sync-trip-features
npx prisma generate
npm run dev
```

Do not reset the database or run `prisma migrate dev` for this update because this project uses the existing idempotent synchronization strategy.
