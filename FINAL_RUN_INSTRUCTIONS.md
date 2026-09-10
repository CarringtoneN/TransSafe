# Final Run Instructions

From PowerShell:

## Backend
```powershell
cd C:\Users\Admin\Documents\TransSafe\backend
npm install
npx prisma generate
npm run db:sync-trip-features
npm run db:sync-enhancements
npm run db:sync-vehicle-history
npm run dev
```

## Frontend (second PowerShell window)
```powershell
cd C:\Users\Admin\Documents\TransSafe\frontend
npm install
npm run dev
```

Do not run `npx prisma migrate reset` or `npx prisma migrate dev` against the existing TransSafe database unless you intentionally want to rebuild the database. The supplied synchronization scripts are idempotent and designed for the existing database.
