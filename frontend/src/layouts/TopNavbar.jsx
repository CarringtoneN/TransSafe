import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  UserCircle,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { roleLabel, ROLE_CONFIG } from "../config/roles";
import alertsService from "../services/alertsService";

function TopNavbar({ onMenuClick = () => {} }) {
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
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }

      if (
        alertsRef.current &&
        !alertsRef.current.contains(event.target)
      ) {
        setAlertsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeMenu);

    return () =>
      document.removeEventListener("mousedown", closeMenu);
  }, []);

  function handleLogout() {
    setOpen(false);
    logout();
    navigate("/login", { replace: true });
  }

  const dashboardPath =
    ROLE_CONFIG[user?.role]?.dashboard || "/";

  const alertRoles = [
    "DRIVER",
    "OPERATIONS_MANAGER",
    "MAINTENANCE_COMPLIANCE",
    "TECHNICIAN_MECHANIC",
  ];

  const hasAlerts = alertRoles.includes(user?.role);

  useEffect(() => {
    let active = true;

    if (!hasAlerts) {
      setAlerts([]);
      return undefined;
    }

    const loadAlerts = async () => {
      try {
        const result =
          await alertsService.getOperationalAlerts();

        if (active) {
          setAlerts(result?.alerts || []);
          setAlertError("");
        }
      } catch (error) {
        if (active) {
          setAlertError(
            error?.response?.data?.message ||
              "Unable to load alerts."
          );
        }
      }
    };

    loadAlerts();

    const timer = window.setInterval(
      loadAlerts,
      60000
    );

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [hasAlerts]);

  const criticalAlertCount = alerts.filter(
    (item) =>
      item.severity === "CRITICAL" ||
      item.severity === "HIGH"
  ).length;

  const initials = (user?.name || "U")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-gray-200 bg-white px-3 shadow-sm sm:px-4 md:px-6">
      {/* Left side */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {/* Mobile menu */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <Menu size={23} />
        </button>

        {/* Brand */}
        <button
          type="button"
          onClick={() => navigate(dashboardPath)}
          className="truncate text-lg font-semibold text-gray-800 transition hover:text-blue-600 sm:text-xl"
          title="Go to dashboard"
        >
          <span className="sm:hidden">
            🚛 TransSafe
          </span>

          <span className="hidden sm:inline">
            TransSafe
          </span>
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 sm:gap-3">
        {/* Alerts */}
        {hasAlerts && (
          <div
            className="relative"
            ref={alertsRef}
          >
            <button
              type="button"
              onClick={() =>
                setAlertsOpen((value) => !value)
              }
              className="relative rounded-lg p-2 text-gray-600 transition hover:bg-slate-100 hover:text-black"
              aria-label="Operational alerts"
              title="Operational alerts"
            >
              <Bell size={19} />

              {criticalAlertCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">
                  {criticalAlertCount > 9
                    ? "9+"
                    : criticalAlertCount}
                </span>
              )}
            </button>

            {alertsOpen && (
              <div className="absolute right-0 z-50 mt-2 w-[calc(100vw-1.5rem)] max-w-[360px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">
                      Operational Alerts
                    </p>

                    <p className="text-xs text-slate-500">
                      {alerts.length} active item
                      {alerts.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <AlertTriangle
                    size={18}
                    className={
                      criticalAlertCount
                        ? "text-red-600"
                        : "text-slate-400"
                    }
                  />
                </div>

                {alertError ? (
                  <div className="p-4 text-sm text-red-600">
                    {alertError}
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="p-5 text-center text-sm text-slate-500">
                    No active alerts.
                  </div>
                ) : (
                  <div className="max-h-[420px] overflow-y-auto p-2">
                    {alerts.slice(0, 8).map((alert) => (
                      <button
                        key={alert.id}
                        type="button"
                        onClick={() => {
                          setAlertsOpen(false);
                          navigate(alert.path);
                        }}
                        className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition hover:bg-slate-50"
                      >
                        <div
                          className={`mt-0.5 shrink-0 rounded-lg p-2 ${
                            alert.type === "MAINTENANCE" ||
                            alert.type === "WORK_ORDER"
                              ? "bg-blue-50 text-blue-600"
                              : alert.type === "INCIDENT"
                                ? "bg-red-50 text-red-600"
                                : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          <Wrench size={16} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-800">
                            {alert.title}
                          </p>

                          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                            {alert.message}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {new Date(
                              alert.timestamp
                            ).toLocaleString()}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* User menu */}
        <div
          className="relative"
          ref={menuRef}
        >
          <button
            type="button"
            onClick={() =>
              setOpen((value) => !value)
            }
            aria-expanded={open}
            aria-haspopup="menu"
            className="flex items-center gap-1 rounded-lg px-1.5 py-1.5 transition hover:bg-slate-100 sm:gap-2 sm:px-2"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
              {initials}
            </div>

            <div className="hidden text-left sm:block">
              <div className="max-w-[150px] truncate font-medium">
                {user?.name || "User"}
              </div>

              <div className="text-xs text-slate-500">
                {roleLabel(user?.role)}
              </div>
            </div>

            <ChevronDown
              size={17}
              className="hidden text-slate-500 sm:block"
            />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 w-[calc(100vw-1.5rem)] max-w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl"
            >
              <div className="border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-3">
                  <UserCircle
                    size={34}
                    className="shrink-0 text-slate-400"
                  />

                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-800">
                      {user?.name || "User"}
                    </div>

                    <div className="truncate text-xs text-slate-500">
                      {user?.email || ""}
                    </div>

                    <div className="mt-0.5 text-xs text-blue-600">
                      {roleLabel(user?.role)}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  navigate(dashboardPath);
                }}
                className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-50 text-blue-600">
                  ⌂
                </span>

                <span>Dashboard</span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
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