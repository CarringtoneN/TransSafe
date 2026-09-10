import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, BellRing, CalendarClock, ClipboardList, ExternalLink, RefreshCw, ShieldAlert, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import alertsService from "../services/alertsService";
import useAuth from "../hooks/useAuth";

const ROLE_ALERTS = new Set(["OPERATIONS_MANAGER", "MAINTENANCE_COMPLIANCE", "TECHNICIAN_MECHANIC"]);

function tone(severity) {
  if (severity === "CRITICAL") return "border-red-200 bg-red-50 text-red-900";
  if (severity === "HIGH") return "border-orange-200 bg-orange-50 text-orange-900";
  return "border-blue-200 bg-blue-50 text-blue-900";
}

function icon(type) {
  if (type === "MAINTENANCE" || type === "WORK_ORDER") return Wrench;
  if (type === "INCIDENT") return ShieldAlert;
  if (type === "COMPLIANCE") return ClipboardList;
  return CalendarClock;
}

export default function OperationalAlerts({ compact = false }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const enabled = ROLE_ALERTS.has(user?.role);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      setData(await alertsService.getOperationalAlerts());
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load operational alerts.");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    load();
    if (!enabled) return undefined;
    const timer = window.setInterval(load, 60000);
    return () => window.clearInterval(timer);
  }, [load, enabled]);

  const alerts = useMemo(() => data?.alerts || [], [data]);
  if (!enabled) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-50 p-3 text-amber-600"><BellRing size={21} /></div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Operational Alerts</h2>
            <p className="text-sm text-slate-500">Maintenance, incidents and operational items requiring attention.</p>
          </div>
        </div>
        <button type="button" onClick={load} disabled={loading} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50" title="Refresh alerts">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {!error && alerts.length === 0 && !loading && (
        <div className="p-8 text-center text-sm text-slate-500">No operational alerts right now.</div>
      )}

      <div className="space-y-3 p-5">
        {alerts.slice(0, compact ? 5 : 12).map((alert) => {
          const Icon = icon(alert.type);
          return (
            <Link key={alert.id} to={alert.path} className={`block rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm ${tone(alert.severity)}`}>
              <div className="flex items-start gap-3">
                <Icon size={19} className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{alert.title}</p>
                    <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-bold">{alert.severity}</span>
                  </div>
                  <p className="mt-1 text-sm opacity-90">{alert.message}</p>
                  <p className="mt-2 text-xs opacity-70">{new Date(alert.timestamp).toLocaleString()}</p>
                </div>
                <ExternalLink size={16} className="shrink-0 opacity-60" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
