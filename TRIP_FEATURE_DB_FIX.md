# Trip Feature Database Fix

The previous package created `trip_driver` / `trip_event`, but Prisma models `tripDriver` / `tripEvent` use the Prisma default physical table names `tripDriver` / `tripEvent`. This package fixes the synchronization script.

From `backend`, run:

```powershell
npm run db:sync-trip-features
npx prisma generate
npm run dev
```

The script is idempotent. If legacy `trip_driver` or `trip_event` tables exist, it renames them to the Prisma-compatible names before continuing. Existing trip records are backfilled into `tripDriver`.

Do not run `prisma migrate dev` for this project because the development database has existing migration drift.
