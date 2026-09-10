# TransSafe Vehicle `bodyType` Database Fix

This update fixes the database error:

`The column transsafe.vehicle.bodyType does not exist in the current database.`

## What changed

- Repaired `backend/sync-vehicle-user-history.mjs`.
- Removed the MySQL raw-query syntax that caused error `1064` near `?`.
- The sync now checks whether `vehicle.bodyType` exists and adds it only when missing.
- The synchronization now runs automatically before `npm run dev` and `npm start`.

## After replacing the files

From `TransSafe/backend` run:

```powershell
npx prisma generate
npm run db:sync-vehicle-history
npm run dev
```

The expected result is:

```text
Synchronizing vehicle/user history features...
✓ bodyType added
✓ Vehicle/user history synchronization complete.
```

If the column already exists, it will safely report that and continue.
