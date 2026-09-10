import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import meService from "../../services/meService";
import useAuth from "../../hooks/useAuth";
import DriverIncidentModal from "../../features/incidents/DriverIncidentModal";

const CONFIG = {
  trips: { title: "My Trips", description: "Trips assigned to you, including shared driving segments and trip events." },
  assignments: { title: "My Assignments", description: "Vehicles currently and previously assigned to you." },
  shifts: { title: "My Shifts", description: "Your scheduled, active and completed shifts." },
  inspections: { title: "My Vehicle Inspections", description: "Safety inspections submitted from your driver portal." },
  incidents: { title: "My Incident Reports", description: "Incidents you have reported or that are linked to your driver account." },
};

function Status({ value }) {
  const normalized = String(value || "").toUpperCase();
  const good = ["ACTIVE", "COMPLETED", "PASS", "SCHEDULED", "IN_PROGRESS"].includes(normalized);
  const bad = ["FAIL", "CANCELLED", "SUSPENDED"].includes(normalized);
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${good ? "bg-green-100 text-green-700" : bad ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"}`}>{String(value || "-").replaceAll("_", " ")}</span>;
}

function formatDate(value, withTime = false) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-GB", withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" });
}

export default function DriverResource({ resource }) {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [incidentOpen, setIncidentOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [assignedVehicles, setAssignedVehicles] = useState([]);
  const config = CONFIG[resource] || { title: "Driver Records", description: "Records associated with your account." };

  async function load() {
    setLoading(true);
    try {
      const response = await meService.resource(resource);
      setRows(response.data.data || []);
      if (resource === "incidents") {
        const dashboard = await meService.dashboard();
        setAssignedVehicles(dashboard.data.data?.assignedVehicles || []);
      }
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load driver records.");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [resource]);

  async function reportIncident(payload) {
    setSaving(true);
    try {
      await meService.createIncident(payload);
      setIncidentOpen(false);
      setNotice("Incident reported successfully.");
      await load();
    } catch (e) {
      throw e;
    } finally { setSaving(false); }
  }

  const vehicleOptions = useMemo(() => assignedVehicles.map((item) => item.vehicle || item).filter(Boolean), [assignedVehicles]);

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div><Link to="/driver-dashboard" className="text-sm font-medium text-blue-600">← Driver Dashboard</Link><h1 className="mt-2 text-3xl font-bold text-slate-900">{config.title}</h1><p className="mt-1 text-slate-500">{config.description}</p></div>
      <div className="flex gap-2"><button onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 font-semibold text-slate-700 disabled:opacity-50"><RefreshCw size={17} className={loading ? "animate-spin" : ""}/> Refresh</button>{resource === "incidents" && vehicleOptions.length > 0 && <button onClick={() => setIncidentOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white"><AlertTriangle size={17}/> Report Incident</button>}</div>
    </div>
    {notice && <div className="rounded-lg bg-green-50 p-3 text-green-700">{notice}</div>}
    {error && <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>}

    {loading ? <div className="rounded-xl bg-white p-10 text-center text-slate-500"><RefreshCw className="mx-auto mb-2 animate-spin"/>Loading your records...</div> : (
      <>
        {resource === "trips" && <TripTable rows={rows}/>} {resource === "assignments" && <AssignmentTable rows={rows}/>} 
        {resource === "shifts" && <ShiftTable rows={rows}/>} 
        {resource === "inspections" && <InspectionTable rows={rows}/>} 
        {resource === "incidents" && <IncidentTable rows={rows}/>} 
      </>
    )}

    {resource === "incidents" && <DriverIncidentModal open={incidentOpen} vehicles={vehicleOptions.map((vehicle) => ({ vehicle }))} onSubmit={reportIncident} onClose={() => setIncidentOpen(false)} submitting={saving}/>} 
  </div>;
}

function Empty({ text }) { return <div className="rounded-xl bg-white p-10 text-center text-slate-500 shadow-sm">{text}</div>; }
function Table({ children }) { return <div className="overflow-x-auto rounded-xl bg-white shadow-sm"><table className="min-w-full text-sm"><tbody>{children}</tbody></table></div>; }

function TripTable({ rows }) {
  if (!rows.length) return <Empty text="No trips have been assigned to you."/>;
  return <Table><tr className="bg-slate-100 text-left text-xs uppercase text-slate-500"><th className="px-4 py-3">Route</th><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Departure</th><th className="px-4 py-3">Status</th></tr>{rows.map(row=><tr key={row.id} className="border-t"><td className="px-4 py-4 font-semibold">{row.origin} → {row.destination}</td><td className="px-4 py-4">{row.vehicle?.registration||"-"}</td><td className="px-4 py-4">{formatDate(row.departureTime,true)}</td><td className="px-4 py-4"><Status value={row.status}/></td></tr>)}</Table>;
}

function AssignmentTable({ rows }) {
  if (!rows.length) return <Empty text="No assignments have been recorded for you."/>;
  return <Table><tr className="bg-slate-100 text-left text-xs uppercase text-slate-500"><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Assigned</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Notes</th></tr>{rows.map((row) => <tr key={row.id} className="border-t"><td className="px-4 py-4 font-semibold">{row.vehicle?.registration || "-"} <span className="block text-xs font-normal text-slate-500">{row.vehicle?.make} {row.vehicle?.model}</span></td><td className="px-4 py-4">{formatDate(row.assignedAt)}</td><td className="px-4 py-4"><Status value={row.status}/></td><td className="px-4 py-4 text-slate-600">{row.notes || "-"}</td></tr>)}</Table>;
}

function ShiftTable({ rows }) {
  if (!rows.length) return <Empty text="No shifts have been recorded for you."/>;
  return <Table><tr className="bg-slate-100 text-left text-xs uppercase text-slate-500"><th className="px-4 py-3">Date</th><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Start</th><th className="px-4 py-3">End</th><th className="px-4 py-3">Hours</th><th className="px-4 py-3">Status</th></tr>{rows.map((row) => <tr key={row.id} className="border-t"><td className="px-4 py-4">{formatDate(row.shiftDate)}</td><td className="px-4 py-4 font-semibold">{row.vehicle?.registration || "-"}</td><td className="px-4 py-4">{formatDate(row.startTime, true)}</td><td className="px-4 py-4">{formatDate(row.endTime, true)}</td><td className="px-4 py-4">{Number(row.totalHours || 0).toFixed(2)}</td><td className="px-4 py-4"><Status value={row.status}/></td></tr>)}</Table>;
}

function InspectionTable({ rows }) {
  if (!rows.length) return <Empty text="No vehicle inspections have been submitted yet."/>;
  return <Table><tr className="bg-slate-100 text-left text-xs uppercase text-slate-500"><th className="px-4 py-3">Date</th><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Odometer</th><th className="px-4 py-3">Result</th><th className="px-4 py-3">Remarks</th></tr>{rows.map((row) => <tr key={row.id} className="border-t"><td className="px-4 py-4">{formatDate(row.inspectionDate, true)}</td><td className="px-4 py-4 font-semibold">{row.vehicle?.registration || "-"}</td><td className="px-4 py-4">{Number(row.odometer || 0).toLocaleString()} km</td><td className="px-4 py-4">{row.overallStatus === "PASS" ? <span className="inline-flex items-center gap-1 text-green-700"><CheckCircle2 size={16}/> PASS</span> : <span className="inline-flex items-center gap-1 text-red-700"><XCircle size={16}/> FAIL</span>}</td><td className="max-w-md px-4 py-4 text-slate-600">{row.remarks || "-"}</td></tr>)}</Table>;
}

function IncidentTable({ rows }) {
  if (!rows.length) return <Empty text="No incident reports have been submitted by you."/>;
  return <Table><tr className="bg-slate-100 text-left text-xs uppercase text-slate-500"><th className="px-4 py-3">Date</th><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Severity</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Status</th></tr>{rows.map((row) => <tr key={row.id} className="border-t"><td className="px-4 py-4">{formatDate(row.incidentDate, true)}</td><td className="px-4 py-4 font-semibold">{row.vehicle?.registration || "-"}</td><td className="px-4 py-4">{String(row.incidentType || "OTHER").replaceAll("_", " ")}</td><td className="px-4 py-4"><Status value={row.severity}/></td><td className="px-4 py-4">{row.location || "-"}</td><td className="px-4 py-4"><Status value={row.status}/></td></tr>)}</Table>;
}
