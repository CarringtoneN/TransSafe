# Prisma Maintenance Migration Fix

Fixed migration `20260810150000_add_maintenance_module`.

Changes:
- Added PRIMARY KEY (`id`) to maintenance_schedule, work_order, repair, and compliance.
- Changed large VARCHAR(5000) columns in the maintenance models to MySQL TEXT to avoid MySQL error 1118 (row size too large).
- Updated prisma/schema.prisma with matching @db.Text annotations.

Run from backend:

```powershell
npx prisma migrate dev
npx prisma generate
npx prisma migrate status
```

Do not reset the database or use migrate resolve unless Prisma explicitly requires it after reviewing the new output.
