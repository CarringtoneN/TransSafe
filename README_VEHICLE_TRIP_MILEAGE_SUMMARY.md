# Vehicle Detail: Trip and Mileage Summary

This update adds two horizontal rectangular summary cards at the top of the Vehicle Details view:

- **Trips Done**: completed trips, with the total number of trip records shown underneath.
- **Recorded Mileage**: the highest available odometer reading recorded through Fuel Records or Vehicle Inspections.

The summary is returned by the existing `GET /vehicles/:id/history` endpoint, so no database migration is required.

## Run

From `backend`:

```powershell
npx prisma generate
npm run dev
```

Restart the frontend as well, then open a vehicle and click **View**.
