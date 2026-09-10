# TransSafe login fix

The previous package could leave an existing admin password unchanged because the seed only updated role/name/active. This version always resets the setup admin password when the seed/reset command is run.

## Fix existing database
From `backend`:

```powershell
npm install
npx prisma generate
npm run db:reset-admin
npm run dev
```

Then sign in with:
- Email: `admin@transsafe.com`
- Password: `Trans#2026`

Do **not** run `prisma migrate reset`.

If login still fails, look at the backend terminal. The API now distinguishes invalid credentials, inactive accounts, and server/database errors.
