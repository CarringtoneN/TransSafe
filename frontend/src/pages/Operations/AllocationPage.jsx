import { useEffect, useState } from "react";
import { Eye, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import operationsService from "../../services/operationsService";
import vehicleService from "../../services/vehicleService";
import driverService from "../../services/driverService";
import AllocationModal from "../../features/operations/components/AllocationModal";
import AllocationView from "../../features/operations/components/AllocationView";
import { Badge, dateTime } from "../../features/operations/components/OperationsUI";

export default function AllocationPage({ mode = "vehicle" }) {
  const driverMode = mode === "driver";
  const title = driverMode ? "Driver Allocation" : "Vehicle Allocation";
  const description = driverMode
    ? "Manage driver-to-vehicle assignments. This is the same allocation data used by Vehicle Allocation and Monitoring."
    : "Manage vehicle-to-driver assignments. This is the same allocation data used by Driver Allocation and Monitoring.";

  const [rows, setRows] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setError("");
      const [allocations, vehicleRows, driverRows] = await Promise.all([
        operationsService.listAllocations({ search: query, status }),
        vehicleService.list(),
        driverService.list(),
      ]);
      setRows(allocations);
      setVehicles(vehicleRows);
      setDrivers(driverRows);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  }

  useEffect(() => {
    load();
  }, [status]);

  async function save(payload) {
    try {
      setSaving(true);
      setError("");
      if (editing) {
        await operationsService.updateAllocation(editing.id, payload);
      } else {
        await operationsService.createAllocation(payload);
      }
      setOpen(false);
      setEditing(null);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this allocation?")) return;
    try {
      await operationsService.deleteAllocation(id);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-slate-500">{description}</p>
        </div>
        <button
          onClick={() => { setEditing(null); setOpen(true); }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
        >
          <Plus size={18} /> New Allocation
        </button>
      </header>

      <div className="flex flex-wrap gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl border bg-white px-3">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full py-3 outline-none"
            placeholder={driverMode ? "Search driver or vehicle..." : "Search vehicle or driver..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
        </div>
        <select className="rounded-xl border bg-white px-4" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>ALL</option>
          <option>ACTIVE</option>
          <option>COMPLETED</option>
          <option>CANCELLED</option>
        </select>
        <button onClick={load} className="rounded-xl border bg-white p-3" title="Refresh">
          <RefreshCw size={18} />
        </button>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}

      <div className="overflow-hidden rounded-2xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {(driverMode
                ? ["Driver", "Vehicle", "Assigned", "Status", "Notes", "Actions"]
                : ["Vehicle", "Driver", "Assigned", "Status", "Notes", "Actions"]
              ).map((heading) => (
                <th className="px-5 py-4 font-bold" key={heading}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!rows.length ? (
              <tr><td colSpan="6" className="px-5 py-16 text-center text-slate-500">No allocations found.</td></tr>
            ) : rows.map((a) => (
              <tr className="border-t hover:bg-slate-50" key={a.id}>
                {driverMode ? (
                  <>
                    <td className="px-5 py-4 font-semibold">{a.driver?.firstName} {a.driver?.lastName}</td>
                    <td className="px-5 py-4">{a.vehicle?.registration}</td>
                  </>
                ) : (
                  <>
                    <td className="px-5 py-4 font-semibold">{a.vehicle?.registration}</td>
                    <td className="px-5 py-4">{a.driver?.firstName} {a.driver?.lastName}</td>
                  </>
                )}
                <td className="px-5 py-4">{dateTime(a.assignedAt)}</td>
                <td className="px-5 py-4"><Badge value={a.status} /></td>
                <td className="max-w-xs truncate px-5 py-4">{a.notes || "—"}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-1">
                    <button title="View" onClick={() => setView(a)} className="rounded-lg p-2 hover:bg-slate-100"><Eye size={17} /></button>
                    <button title="Edit" onClick={() => { setEditing(a); setOpen(true); }} className="rounded-lg p-2 hover:bg-slate-100"><Pencil size={17} /></button>
                    <button title="Delete" onClick={() => remove(a.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AllocationModal
        open={open}
        onClose={() => { setOpen(false); setEditing(null); }}
        onSave={save}
        initialData={editing}
        vehicles={vehicles}
        drivers={drivers}
        saving={saving}
        title={title}
      />
      <AllocationView open={!!view} onClose={() => setView(null)} allocation={view} />
    </div>
  );
}
