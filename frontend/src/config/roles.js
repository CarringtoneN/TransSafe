export const ROLE_CONFIG = {
  ADMIN: { label: "Administrator", dashboard: "/", paths: ["*"] },
  DRIVER: { label: "Driver", dashboard: "/driver-dashboard", paths: ["/driver-dashboard", "/driver-profile", "/my-trips", "/my-assignments", "/my-shifts", "/my-inspections", "/my-incidents"] },
  FLEET_MANAGER: { label: "Fleet Manager", dashboard: "/fleet-dashboard", paths: ["/fleet-dashboard", "/vehicles", "/fleet-assets", "/fuel-records", "/documents", "/approval-report"] },
  OPERATIONS_MANAGER: { label: "Operations & Scheduling Manager", dashboard: "/operations-dashboard", paths: ["/operations-dashboard", "/trips", "/vehicle-allocation", "/driver-allocation", "/manifest", "/monitoring", "/drivers", "/assignments", "/shifts", "/inspections", "/incidents"] },
  MAINTENANCE_COMPLIANCE: { label: "Maintenance & Compliance", dashboard: "/maintenance-dashboard", paths: ["/maintenance-dashboard", "/maintenance-schedule", "/work-orders", "/repairs", "/service-history", "/compliance", "/incidents", "/inspections", "/approval-report"] },
  TECHNICIAN_MECHANIC: { label: "Mechanic", dashboard: "/mechanic-dashboard", paths: ["/mechanic-dashboard", "/maintenance-schedule", "/work-orders", "/repairs", "/service-history", "/incidents", "/inspections", "/approval-report"] },
};
export function roleLabel(role) { return ROLE_CONFIG[role]?.label || role || "User"; }
export function canAccess(role, path) {
  if (role === "ADMIN") return true;
  return (ROLE_CONFIG[role]?.paths || []).some((allowed) => allowed === path || allowed === "*" || (allowed !== "/" && path.startsWith(`${allowed}/`)));
}
