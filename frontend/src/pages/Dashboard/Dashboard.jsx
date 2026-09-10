import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, Fuel, ShieldCheck, Truck, Users, Wrench } from "lucide-react";
import reportsService from "../../services/reportsService";

const KSh = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("en-KE");

function StatCard({ title, value, subtitle, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
    slate: "bg-slate-100 text-slate-700",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className={`rounded-xl p-3 ${tones[tone] || tones.blue}`}><Icon size={22} /></div>
      </div>
    </div>
  );
}

function statusLabel(value) {
  return String(value || "UNKNOWN").replaceAll("_", " ");
}

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const [summaryResult, dataResult] = await Promise.all([
          reportsService.summary(),
          reportsService.data({ limit: 8 }),
        ]);
        if (!active) return;
        setSummary(summaryResult);
        setData(dataResult);
      } catch (err) {
        console.error("Dashboard load error:", err);
        if (active) setError(err?.response?.data?.message || err.message || "Unable to load dashboard data.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const k = summary?.kpis || {};
  const breakdowns = summary?.breakdowns || {};
  const trips = data?.trips || [];
  const incidents = data?.incidents || [];
  const workOrders = data?.workOrders || [];

  const openWorkOrders = useMemo(
    () => workOrders.filter((x) => !["COMPLETED", "CLOSED", "CANCELLED"].includes(x.status)).length,
    [workOrders]
  );

  if (loading) return <div className="rounded-2xl bg-white p-8 text-slate-500 shadow-sm">Loading dashboard...</div>;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        <div className="flex items-center gap-3 font-semibold"><AlertTriangle size={20} /> Dashboard data could not be loaded.</div>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="mt-2 text-slate-500">Live operational overview of the TransSafe fleet. Financial and fuel figures below are for the last 30 days.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Vehicles" value={number.format(k.vehicles || 0)} subtitle="Registered fleet" icon={Truck} tone="blue" />
        <StatCard title="Drivers" value={number.format(k.drivers || 0)} subtitle="Registered drivers" icon={Users} tone="green" />
        <StatCard title="Trips" value={number.format(k.trips || 0)} subtitle={`${k.tripCompletionRate || 0}% completed`} icon={CalendarClock} tone="orange" />
        <StatCard title="Maintenance" value={number.format(k.maintenanceSchedules || 0)} subtitle={`${openWorkOrders} active work orders`} icon={Wrench} tone="red" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3"><Fuel className="text-blue-600" size={22} /><h2 className="font-semibold">Fuel</h2></div>
          <p className="mt-4 text-2xl font-bold">{KSh.format(k.fuelCost || 0)}</p>
          <p className="text-sm text-slate-500">{number.format(k.fuelLitres || 0)} litres consumed in the last 30 days</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3"><AlertTriangle className="text-red-600" size={22} /><h2 className="font-semibold">Incidents</h2></div>
          <p className="mt-4 text-2xl font-bold">{number.format(k.incidentCount || 0)}</p>
          <p className="text-sm text-slate-500">Estimated impact in the last 30 days: {KSh.format(k.incidentCost || 0)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3"><ShieldCheck className="text-green-600" size={22} /><h2 className="font-semibold">Compliance</h2></div>
          <p className="mt-4 text-2xl font-bold">{number.format(k.expiredDocuments || 0)}</p>
          <p className="text-sm text-slate-500">Expired documents</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5"><h2 className="text-xl font-semibold">Recent Trips</h2><p className="text-sm text-slate-500">Latest trips recorded in the system.</p></div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50"><tr><th className="px-5 py-3 text-left">Date</th><th className="px-5 py-3 text-left">Vehicle</th><th className="px-5 py-3 text-left">Driver</th><th className="px-5 py-3 text-left">Destination</th><th className="px-5 py-3 text-left">Status</th></tr></thead>
              <tbody>
                {trips.length === 0 ? <tr><td colSpan="5" className="p-8 text-center text-slate-500">No trips recorded.</td></tr> : trips.map((trip) => (
                  <tr key={trip.id} className="border-t hover:bg-slate-50">
                    <td className="px-5 py-3">{trip.departureTime ? new Date(trip.departureTime).toLocaleDateString("en-KE") : "-"}</td>
                    <td className="px-5 py-3">{trip.vehicle?.registration || "-"}</td>
                    <td className="px-5 py-3">{trip.driver ? `${trip.driver.firstName || ""} ${trip.driver.lastName || ""}`.trim() : "-"}</td>
                    <td className="px-5 py-3">{trip.destination || trip.route || "-"}</td>
                    <td className="px-5 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">{statusLabel(trip.status)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5"><h2 className="text-xl font-semibold">Operational Alerts</h2><p className="text-sm text-slate-500">Items requiring attention.</p></div>
          <div className="space-y-3 p-5">
            <div className="rounded-xl bg-red-50 p-4"><p className="font-semibold text-red-800">Incidents</p><p className="text-sm text-red-700">{k.incidentCount || 0} incidents in the reporting period.</p></div>
            <div className="rounded-xl bg-orange-50 p-4"><p className="font-semibold text-orange-800">Work Orders</p><p className="text-sm text-orange-700">{openWorkOrders} active work orders in the latest records.</p></div>
            <div className="rounded-xl bg-yellow-50 p-4"><p className="font-semibold text-yellow-800">Compliance</p><p className="text-sm text-yellow-700">{k.expiredDocuments || 0} expired documents.</p></div>
            <div className="rounded-xl bg-blue-50 p-4"><p className="font-semibold text-blue-800">Maintenance Cost</p><p className="text-sm text-blue-700">{KSh.format(k.maintenanceCost || 0)} recorded in the last 30 days.</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Trip Status</p><p className="mt-2 text-sm font-semibold">{Object.entries(breakdowns.tripByStatus || {}).map(([s,c]) => `${statusLabel(s)}: ${c}`).join(" • ") || "No data"}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Incident Severity</p><p className="mt-2 text-sm font-semibold">{Object.entries(breakdowns.incidentBySeverity || {}).map(([s,c]) => `${statusLabel(s)}: ${c}`).join(" • ") || "No data"}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Shift Hours</p><p className="mt-2 text-2xl font-bold">{number.format(k.shiftHours || 0)}</p></div>
      </div>
    </div>
  );
}

export default Dashboard;
