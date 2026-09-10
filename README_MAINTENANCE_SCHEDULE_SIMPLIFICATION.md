# TransSafe Maintenance Schedule Simplification

This update is based on the user-provided current project version.

## Maintenance Schedule changes
- Removed Service Location.
- Retained Workshop (Assigned Workshop).
- Removed Estimated Parts Cost.
- Removed Estimated Labour Cost.
- Removed Estimated Total Cost.
- Removed those fields from the maintenance schedule request validation and persistence mapping so they are no longer required or processed for new or edited schedules.
- Removed maintenance schedule estimated cost from the combined maintenance/service history activity feed.
- Existing database columns are intentionally left in place for compatibility with existing records and to avoid a destructive migration.

No database migration is required.
