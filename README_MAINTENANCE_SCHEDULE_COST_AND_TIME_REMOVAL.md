# TransSafe Maintenance Schedule Cleanup

This update removes the following items from the Maintenance Schedule only:

- Cost column/table from the Maintenance Schedule list
- Estimated Labour Hours
- Estimated Duration (hours)

The maintenance schedule form, create/edit requests, and schedule validation were updated so these fields are no longer displayed or required.

Existing database columns were intentionally retained for backward compatibility. No Prisma migration is required.
