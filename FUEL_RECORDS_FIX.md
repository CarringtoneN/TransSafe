# Fuel Records Fix

## What was fixed

The Fuel Records page was calling a frontend API path that did not exist:

- Frontend was using `/fuel`
- Backend is mounted at `/api/fuel-records`

The frontend Fuel Records service now uses the canonical `/fuel-records` endpoint for list, view, create, update, and delete operations.

The Prisma schema defines the model as `fuelrecord` (lowercase), while the backend service was calling `prisma.fuelRecord`. The backend service now uses `prisma.fuelrecord` consistently.

## Result

Fuel Records now supports:

- Loading existing fuel records
- Searching fuel records
- Adding fuel records
- Viewing fuel records
- Editing fuel records
- Deleting fuel records
- Vehicle selection from the Vehicles module

## Database

No Prisma migration is required for this fix. The existing `fuelrecord` model and table are used.
