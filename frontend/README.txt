TRANSSAFE OPERATIONS MONITORING FIX

The Vite error says Monitoring.jsx imports:

../../features/operations/components/OperationsUI

but that file did not exist.

This ZIP adds:
src/features/operations/components/OperationsUI.jsx

It exports:
- Modal
- Badge
- dateTime

The existing MonitoringModal.jsx from the previous fix remains compatible.

INSTALL:
1. Extract this ZIP into your frontend project.
2. Confirm this file exists:
   src/features/operations/components/OperationsUI.jsx
3. Restart Vite:
   npm run dev

If Vite is still showing the old overlay, stop it with Ctrl+C and run npm run dev again.
