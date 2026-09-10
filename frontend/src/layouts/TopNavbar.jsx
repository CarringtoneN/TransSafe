import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut, UserCircle, AlertTriangle, CalendarClock, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { roleLabel, ROLE_CONFIG } from "../config/roles";
import alertsService from "../services/alertsService";

function TopNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [alertError, setAlertError] = useState("");
  const menuRef = useRef(null);
  const alertsRef = useRef(null);

  useEffect(() => {
    function closeMenu(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
      if (alertsRef.current && !alertsRef.current.contains(event.target)) setAlertsOpen(false);
    }
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  function handleLogout() {
    setOpen(false);
    logout();
    navigate("/login", { replace: true });
  }

  const dashboardPath = ROLE_CONFIG[user?.role]?.dashboard || "/";
  const alertRoles = ["DRIVER", "OPERATIONS_MANAGER", "MAINTENANCE_COMPLIANCE", "TECHNICIAN_MECHANIC"];
  const hasAlerts = alertRoles.includes(user?.role);

  useEffect(() => {
    let active = true;
    if (!hasAlerts) { setAlerts([]); return undefined; }
    const loadAlerts = async () => {
      try {
        const result = await alertsService.getOperationalAlerts();
        if (active) { setAlerts(result?.alerts || []); setAlertError(""); }
      } catch (error) {
        if (active) setAlertError(error?.response?.data?.message || "Unable to load alerts.");
      }
    };
    loadAlerts();
    const timer = window.setInterval(loadAlerts, 60000);
    return () => { active = false; window.clearInterval(timer); };
  }, [hasAlerts]);

  const criticalAlertCount = alerts.filter((item) => item.severity === "CRITICAL" || item.severity === "HIGH").length;

  const initials = (user?.name || "U")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <button
        type="button"
        onClick={() => navigate(dashboardPath)}
        className="text-xl font-semibold text-gray-800 transition hover:text-blue-600"
        title="Go to dashboard"
      >
        TransSafe
      </button>

      <div className="flex items-center gap-4">
        {hasAlerts && (
          <div className="relative" ref={alertsRef}>
            <button
              type="button"
              onClick={() => setAlertsOpen((value) => !value)}
              className="relative rounded-lg p-2 text-gray-600 hover:bg-slate-100 hover:text-black"
              aria-label="Operational alerts"
              title="Operational alerts"
            >
              <Bell size={19} />
              {criticalAlertCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">{criticalAlertCount > 9 ? "9+" : criticalAlertCount}</span>}
            </button>
            {alertsOpen && (
              <div className="absolute right-0 z-50 mt-2 w-[360px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div><p className="font-semibold text-slate-900">Operational Alerts</p><p className="text-xs text-slate-500">{alerts.length} active item{alerts.length === 1 ? "" : "s"}</p></div>
                  <AlertTriangle size={18} className={criticalAlertCount ? "text-red-600" : "text-slate-400"} />
                </div>
                {alertError ? <div className="p-4 text-sm text-red-600">{alertError}</div> : alerts.length === 0 ? <div className="p-5 text-center text-sm text-slate-500">No active alerts.</div> : (
                  <div className="max-h-[420px] overflow-y-auto p-2">
                    {alerts.slice(0, 8).map((alert) => (
                      <button key={alert.id} type="button" onClick={() => { setAlertsOpen(false); navigate(alert.path); }} className="flex w-full items-start gap-3 rounded-lg p-3 text-left hover:bg-slate-50">
                        <div className={`mt-0.5 rounded-lg p-2 ${alert.type === "MAINTENANCE" || alert.type === "WORK_ORDER" ? "bg-blue-50 text-blue-600" : alert.type === "INCIDENT" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}><Wrench size={16} /></div>
                        <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{alert.title}</p><p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{alert.message}</p><p className="mt-1 text-[10px] text-slate-400">{new Date(alert.timestamp).toLocaleString()}</p></div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
              {initials}
            </div>
            <div className="hidden text-left sm:block">
              <div className="font-medium">{user?.name || "User"}</div>
              <div className="text-xs text-slate-500">{roleLabel(user?.role)}</div>
            </div>
            <ChevronDown size={17} className="text-slate-500" />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl"
            >
              <div className="border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-3">
                  <UserCircle size={34} className="text-slate-400" />
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-800">{user?.name || "User"}</div>
                    <div className="truncate text-xs text-slate-500">{user?.email || ""}</div>
                    <div className="mt-0.5 text-xs text-blue-600">{roleLabel(user?.role)}</div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                role="menuitem"
                onClick={() => { setOpen(false); navigate(dashboardPath); }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-50 text-blue-600">⌂</span>
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopNavbar;
