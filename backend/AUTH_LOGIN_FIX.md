# TransSafe Authentication Fix

The previous seed only updated the admin role/status when the account already
existed. It did NOT replace the password hash. If the existing admin record had
a different password, login returned "Invalid email or password."

This version:
- always resets the seeded admin password to `Trans#2026`;
- uses a single Prisma singleton compatible with ESM imports;
- returns useful development-time auth errors;
- normalizes email addresses;
- keeps JWT role and driverId claims;
- preserves the existing user roles and Driver linkage.

## Apply

From `backend`:

```powershell
npx prisma generate
npm run auth:reset-admin
npm run dev
```

Admin:

```text
Email: admin@transsafe.com
Password: Trans#2026
```

`npm run db:seed` also resets the admin password, but `auth:reset-admin` is
safer when you only want to repair the administrator account.
