import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, CalendarDays, Route as RouteIcon, ClipboardCheck, FileWarning, Gauge, ShieldCheck, Truck, Wrench } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import meService from "../../services/meService";
import { roleLabel } from "../../config/roles";
import DriverStartShiftModal from "../../features/shifts/components/DriverStartShiftModal";
import DriverInspectionModal from "../../features/inspections/components/DriverInspectionModal";
import DriverIncidentModal from "../../features/incidents/DriverIncidentModal";
import OperationalAlerts from "../../components/OperationalAlerts";

const ROLE_LINKS = {
  FLEET_MANAGER: [
    ["Vehicles", "/vehicles", Truck], ["Fleet Assets", "/fleet-assets", BriefcaseBusiness], ["Fuel Records", "/fuel-records", Gauge], ["Documents", "/documents", FileWarning],
  ],
  OPERATIONS_MANAGER: [
    ["Trips", "/trips", Truck], ["Vehicle Allocation", "/vehicle-allocation", ClipboardCheck], ["Driver Allocation", "/driver-allocation", BriefcaseBusiness], ["Manifest", "/manifest", FileWarning], ["Monitoring", "/monitoring", Gauge],
    ["Drivers", "/drivers", BriefcaseBusiness], ["Assignments", "/assignments", Truck], ["Shifts", "/shifts", CalendarDays], ["Vehicle Inspections", "/inspections", ClipboardCheck], ["Incident Reports", "/incidents", FileWarning],
  ],
  MAINTENANCE_COMPLIANCE: [
    ["Maintenance Schedule", "/maintenance-schedule", CalendarDays], ["Work Orders", "/work-orders", ClipboardCheck], ["Repairs", "/repairs", Wrench], ["Service History", "/service-history", FileWarning], ["Compliance", "/compliance", ShieldCheck], ["Incident Reports", "/incidents", FileWarning], ["Vehicle Inspections", "/inspections", ClipboardCheck],
  ],
  TECHNICIAN_MECHANIC: [
    ["Maintenance Schedule", "/maintenance-schedule", CalendarDays], ["Work Orders", "/work-orders", ClipboardCheck], ["Repairs", "/repairs", Wrench], ["Service History", "/service-history", FileWarning], ["Incident Reports", "/incidents", FileWarning], ["Vehicle Inspections", "/inspections", ClipboardCheck],
  ],
};

function Stat({ label, value, icon: Icon }) {
  return <div className="rounded-xl bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-slate-900">{value}</p></div><div className="rounded-xl bg-blue-50 p-3 text-blue-600"><Icon size={22}/></div></div></div>;
}

function DriverDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [startOpen, setStartOpen] = useState(false);
  const [inspectionOpen, setInspectionOpen] = useState(false);
  const [incidentOpen, setIncidentOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const response = await meService.dashboard();
      setData(response.data.data);
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load driver dashboard.");
    }
  };

  useEffect(() => { load(); }, []);

  async function startShift(payload) {
    setSaving(true); setError("");
    try { await meService.startShift(payload); setStartOpen(false); setNotice("Shift started successfully."); await load(); }
    catch (e) { setError(e.response?.data?.message || "Unable to start shift."); }
    finally { setSaving(false); }
  }

  async function endShift() {
    if (!window.confirm("End your current shift now?")) return;
    setSaving(true); setError("");
    try { await meService.endShift(); setNotice("Shift ended successfully."); await load(); }
    catch (e) { setError(e.response?.data?.message || "Unable to end shift."); }
    finally { setSaving(false); }
  }

  async function submitIncident(payload) {
    setSaving(true); setError("");
    try { await meService.createIncident(payload); setIncidentOpen(false); setNotice("Incident reported successfully."); await load(); }
    catch (e) { setError(e.response?.data?.message || "Unable to report incident."); }
    finally { setSaving(false); }
  }

  async function submitInspection(payload) {
    setSaving(true); setError("");
    try { await meService.createInspection(payload); setInspectionOpen(false); setNotice("Pre-trip vehicle inspection submitted successfully."); await load(); }
    catch (e) { setError(e.response?.data?.message || "Unable to submit vehicle inspection."); }
    finally { setSaving(false); }
  }

  const activeShift = data?.activeShift;
  const vehicles = (data?.assignedVehicles?.length ? data.assignedVehicles : (data?.assignments || []).filter((assignment) => ["ACTIVE", "ASSIGNED", "IN_PROGRESS"].includes(String(assignment.status || "").trim().toUpperCase()) && (!assignment.unassignedAt || new Date(assignment.unassignedAt) > new Date()) && (!assignment.assignedAt || new Date(assignment.assignedAt) <= new Date())));

  return <div className="space-y-6">
    <div><h1 className="text-3xl font-bold">Driver Dashboard</h1><p className="mt-1 text-slate-500">Welcome, {user?.name}. Complete your shift and vehicle safety checks from here.</p></div>
    {error && <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}
    {notice && <div className="rounded-xl bg-green-50 p-4 text-green-700">{notice}</div>}

    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><p className="text-sm text-slate-500">Shift status</p><p className="mt-1 text-xl font-bold">{activeShift ? `ON SHIFT — ${activeShift.vehicle?.registration || "Vehicle"}` : "NOT ON SHIFT"}</p>{activeShift && <p className="text-sm text-slate-500">Started {new Date(activeShift.startTime).toLocaleString()}</p>}</div>
        <div className="flex flex-wrap gap-3">
          {activeShift ? <button disabled={saving} onClick={endShift} className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white disabled:opacity-60">End Shift</button> : <button disabled={!vehicles.length || saving} onClick={() => setStartOpen(true)} className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white disabled:opacity-60">Start Shift</button>}
          <button disabled={!vehicles.length || saving} onClick={() => setInspectionOpen(true)} className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-60">Pre-Trip Vehicle Inspection</button>
          <button disabled={!vehicles.length || saving} onClick={() => setIncidentOpen(true)} className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white disabled:opacity-60">Report Incident</button>
        </div>
      </div>
      {!vehicles.length && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">You do not have an active vehicle assignment yet. Ask Operations & Scheduling to assign a vehicle before starting a shift or submitting an inspection.</p>}
    </div>

    <div className="grid gap-4 md:grid-cols-4"><Stat label="Assignments" value={data?.assignments?.length ?? 0} icon={Truck}/><Stat label="Shifts" value={data?.shifts?.length ?? 0} icon={CalendarDays}/><Stat label="Inspections" value={data?.inspections?.length ?? 0} icon={ClipboardCheck}/><Stat label="Incidents" value={data?.incidents?.length ?? 0} icon={FileWarning}/></div>
    <div className="grid gap-4 md:grid-cols-2">{[["My Driver Profile","/driver-profile",BriefcaseBusiness],["My Trips","/my-trips",RouteIcon],["My Assignments","/my-assignments",Truck],["My Shifts","/my-shifts",CalendarDays],["My Pre-Trip Vehicle Inspections","/my-inspections",ClipboardCheck],["My Incident Reports","/my-incidents",FileWarning]].map(([title,path,Icon])=><Link key={path} to={path} className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm hover:shadow-md"><span className="flex items-center gap-3 font-semibold"><Icon size={20} className="text-blue-600"/>{title}</span><ArrowRight size={18}/></Link>)}</div>

    <DriverStartShiftModal open={startOpen} vehicles={vehicles} onSubmit={startShift} onClose={() => setStartOpen(false)} submitting={saving}/>
    <DriverInspectionModal open={inspectionOpen} vehicles={vehicles} onSubmit={submitInspection} onClose={() => setInspectionOpen(false)} submitting={saving}/>
    <DriverIncidentModal open={incidentOpen} vehicles={vehicles} onSubmit={submitIncident} onClose={() => setIncidentOpen(false)} submitting={saving}/>
  </div>;
}

export default function RoleDashboard({ role }) {
  const links = ROLE_LINKS[role] || [];
  if (role === "DRIVER") return <DriverDashboard />;
  return <div className="space-y-6"><div><h1 className="text-3xl font-bold">{roleLabel(role)} Dashboard</h1><p className="mt-1 text-slate-500">A focused workspace for your assigned TransSafe responsibilities.</p></div><div className="grid gap-4 md:grid-cols-3"><Stat label="Role" value="Active" icon={ShieldCheck}/><Stat label="Access Areas" value={links.length} icon={BriefcaseBusiness}/><Stat label="Account" value="Enabled" icon={Gauge}/></div><OperationalAlerts compact={false}/><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{links.map(([title,path,Icon])=><Link key={path} to={path} className="rounded-xl bg-white p-5 shadow-sm hover:shadow-md"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon size={22}/></div><h2 className="font-semibold">{title}</h2><div className="mt-3 flex items-center gap-1 text-sm text-blue-600">Open module <ArrowRight size={15}/></div></Link>)}</div></div>;
}
