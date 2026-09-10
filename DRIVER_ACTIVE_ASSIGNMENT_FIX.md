# Driver Active Vehicle Assignment Fix

This update fixes the Driver Portal when a driver has already been allocated a vehicle but the portal incorrectly reports that no active assignment exists.

The backend now uses one shared definition of a current assignment:
- status may be `ACTIVE`, `ASSIGNED`, or `IN_PROGRESS`;
- the assignment start time must not be in the future;
- the assignment must not have ended.

The same logic is used when loading the Driver Dashboard and when validating Start Shift, Pre-Trip Vehicle Inspection, and Driver Incident submissions.

The frontend also has a compatibility fallback that derives eligible vehicles from the driver's assignment records if the dedicated assignedVehicles response is empty.
