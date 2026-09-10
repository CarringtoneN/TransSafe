# User Management Setup

1. Apply the new Prisma migration:

```powershell
cd backend
npx prisma migrate deploy
npx prisma generate
```

2. Create the default administrator once:

```powershell
npm run db:seed
```

Default local administrator:

- Email: `admin@transsafe.com`
- Password: `Trans#2026`

3. Start the backend:

```powershell
npm run dev
```

4. Start the frontend:

```powershell
cd ../frontend
npm run dev
```

5. Sign in as Admin and open **User Management**.

## Security note
`Trans#2026` is intentionally the project-specified initial password. For production deployment, change the administrator password and use a secure random initial-password workflow with forced password rotation.
