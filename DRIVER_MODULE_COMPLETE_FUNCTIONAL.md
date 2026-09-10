# TransSafe Driver Module — Fully Functional Update

This update completes the authenticated Driver workspace while preserving the existing role-based navigation and logout functionality.

## Driver capabilities

- Driver dashboard with live counts and active-shift status.
- Start Shift against an active vehicle assignment.
- End the current shift and calculate actual hours.
- Vehicle safety inspection from the Driver portal.
- Automatic PASS/FAIL inspection result from the checklist.
- My Driver Profile loaded from the current server-side driver record.
- My Assignments with assigned vehicle, assignment date, status and notes.
- My Shifts with start/end times, duration and status.
- My Vehicle Inspections with result, odometer and remarks.
- My Incident Reports with a driver-only incident submission workflow.
- Incident submission supports vehicle, date/time, type, severity, location, injuries, estimated cost, police-report flag, description and optional PDF/image evidence.
- Driver incident reports are restricted to vehicles currently assigned to that driver.
- Uploaded incident evidence is served through the backend `/uploads` route.
- Refresh controls on driver resource pages.
- Existing logout remains available from the sidebar and profile menu.

## Backend additions

Added:

- `POST /api/me/driver/incidents`
- Driver authorization and assignment validation.
- Server-side driver identity assignment (`driverId` and `reportedBy` come from the authenticated account).
- Incident validation and reuse of the existing incident service/evidence handling.
- Static serving of `/uploads` for stored incident evidence.

No new Prisma migration is required for this update because it uses the existing `incident` model and incident-evidence fields already present in this project.

## Installation

Replace the corresponding `frontend` and `backend` folders/files with the contents of this package.

Backend:

```powershell
cd backend
npm install
npm run dev
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Do not run `prisma migrate reset` just for this driver update.
