# Work Order Approval and Repair Workflow Update

Implemented:
- Complete Work Order Details view.
- Final Cost removed from Work Orders UI and completion workflow.
- Fleet Manager approval endpoint and action: PENDING_APPROVAL -> APPROVED.
- Technician start action: APPROVED -> IN_PROGRESS.
- Technician can record work performed and mark work order DONE/COMPLETED.
- Done status is shared by all views because the same work order record is updated.
- Filters by year, month and vehicle.
- "Do The Repair" action on approved/in-progress work orders creates a manual Repair record, where final repair cost remains.
- Maintenance Schedule already uses approvalStatus and can now be approved through /maintenance/schedules/:id/approve.

No destructive database migration is required; existing schema fields are retained for compatibility.
