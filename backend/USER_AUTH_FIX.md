# TransSafe Backend - Authentication Prisma Fix

The authentication/user-management controllers import `../lib/prisma.js` as a default ESM export.
The previous file used CommonJS `require()`/`module.exports` even though this project has `"type": "module"`.

The fixed `src/lib/prisma.js` now re-exports the existing `src/config/prisma.js` singleton as both a named and default ESM export.

Run:

```powershell
npx prisma generate
npm run db:seed
npm run dev
```
