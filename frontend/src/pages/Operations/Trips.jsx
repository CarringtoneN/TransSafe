import { useEffect, useState } from "react";
import { Eye, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import operationsService from "../../services/operationsService";
import tripService from "../../services/tripService";
import vehicleService from "../../services/vehicleService";
import driverService from "../../services/driverService";
import assignmentService from "../../services/assignmentService";
import TripModal from "../../features/operations/components/TripModal";
import TripView from "../../features/operations/components/TripView";
import { Badge, dateTime } from "../../features/operations/components/OperationsUI";

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [view, setView] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setError("");
      const [t, v, d, a] = await Promise.all([
        tripService.list({ search: query, status }),
        vehicleService.list(),
        driverService.list(),
        assignmentService.getAllAssignments(),
      ]);
      setTrips(t); setVehicles(v); setDrivers(d); setAssignments(a || []);
    } catch (e) { setError(e.response?.data?.message || e.message); }
  }

  useEffect(() => { load(); }, [status]);

  async function save(payload) {
    try {
      setSaving(true); setError("");
      if (editing) await tripService.update(editing.id, payload);
      else await tripService.create(payload);
      setModal(false); setEditing(null); await load();
    } catch (e) { setError(e.response?.data?.message || e.message); }
    finally { setSaving(false); }
  }

  async function remove(id) {
    if (!window.confirm("Delete this trip?")) return;
    try { await tripService.remove(id); await load(); }
    catch (e) { setError(e.response?.data?.message || e.message); }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-slate-900">Trips</h1><p className="mt-1 text-slate-500">Create trips that feed allocations, manifests and monitoring.</p></div>
        <button onClick={() => { setEditing(null); setModal(true); }} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"><Plus size={18}/> New Trip</button>
      </header>

      <div className="flex flex-wrap gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl border bg-white px-3"><Search size={18} className="text-slate-400"/><input className="w-full py-3 outline-none" placeholder="Search trips..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && load()} /></div>
        <select className="rounded-xl border bg-white px-4" value={status} onChange={e => setStatus(e.target.value)}>
          <option>ALL</option><option>SCHEDULED</option><option>IN_PROGRESS</option><option>COMPLETED</option><option>CANCELLED</option>
        </select>
        <button onClick={load} className="rounded-xl border bg-white p-3"><RefreshCw size={18}/></button>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}

      <div className="overflow-hidden rounded-2xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50"><tr>{["Route","Vehicle","Driver","Departure","Status","Actions"].map(h=><th key={h} className="px-5 py-4 font-bold">{h}</th>)}</tr></thead>
          <tbody>
            {!trips.length ? <tr><td colSpan="6" className="px-5 py-16 text-center text-slate-500">No trips found.</td></tr> :
              trips.map(t => <tr key={t.id} className="border-t hover:bg-slate-50">
                <td className="px-5 py-4"><div className="font-semibold">{t.origin} → {t.destination}</div><div className="text-xs text-slate-500">Trip #{t.id}</div></td>
                <td className="px-5 py-4">{t.vehicle?.registration || "—"}</td>
                <td className="px-5 py-4">
                  {t.driver ? `${t.driver.firstName} ${t.driver.lastName}` : "—"}
                  {(t.tripDriver || []).filter(s => s.planned).map(s => <div key={s.id} className="text-xs text-purple-600">+ {s.driver ? `${s.driver.firstName} ${s.driver.lastName}` : `Driver #${s.driverId}`}</div>)}
                </td>
                <td className="px-5 py-4">{dateTime(t.departureTime)}</td>
                <td className="px-5 py-4"><Badge value={t.status}/></td>
                <td className="px-5 py-4"><div className="flex gap-1">
                  <button title="View" onClick={()=>setView(t)} className="rounded-lg p-2 hover:bg-slate-100"><Eye size={17}/></button>
                  <button title="Edit" onClick={()=>{setEditing(t);setModal(true)}} className="rounded-lg p-2 hover:bg-slate-100"><Pencil size={17}/></button>
                  <button title="Delete" onClick={()=>remove(t.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17}/></button>
                </div></td>
              </tr>)
            }
          </tbody>
        </table>
      </div>

      <TripModal open={modal} onClose={()=>{setModal(false);setEditing(null)}} onSave={save} initialData={editing} vehicles={vehicles} drivers={drivers} assignments={assignments} saving={saving}/>
      <TripView open={!!view} onClose={()=>setView(null)} trip={view}/>
    </div>
  );
}
