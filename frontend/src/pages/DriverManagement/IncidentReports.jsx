import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CircleDollarSign,
  Clock3,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Siren,
  X,
} from "lucide-react";

import incidentService from "../../services/incidentService";
import vehicleService from "../../services/vehicleService";
import driverService from "../../services/driverService";
import IncidentModal from "../../features/incidents/components/IncidentModal";
import ViewIncidentModal from "../../features/incidents/components/ViewIncidentModal";
import IncidentTable from "../../features/incidents/components/IncidentTable";
import useIncidents from "../../features/incidents/hooks/useIncidents";
import useAuth from "../../hooks/useAuth";

const STATUSES = [
  ["", "All statuses"],
  ["OPEN", "Open"],
  ["UNDER_INVESTIGATION", "Under investigation"],
  ["RESOLVED", "Resolved"],
  ["CLOSED", "Closed"],
];

const SEVERITIES = [
  ["", "All severities"],
  ["LOW", "Low"],
  ["MEDIUM", "Medium"],
  ["HIGH", "High"],
  ["CRITICAL", "Critical"],
];

function formatKES(value) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    currencyDisplay: "symbol",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function StatCard({ icon, title, value, subtitle, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className="rounded-xl bg-slate-100 p-3 text-slate-700">{icon}</div>
      </div>
    </div>
  );
}

function IncidentReports() {
  const { user } = useAuth();
  const readOnly = user?.role === "TECHNICIAN_MECHANIC";
  const { incidents, loading, error, stats, loadIncidents } = useIncidents();
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [lookupError, setLookupError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [actionLoading, setActionLoading] = useState(false);

  async function loadLookups() {
    setLoadingLookups(true);
    setLookupError("");
    try {
      if (readOnly) {
        setVehicles([]);
        setDrivers([]);
        return;
      }
      const [vehicleData, driverData] = await Promise.all([
        vehicleService.getAllVehicles(),
        driverService.getAllDrivers(),
      ]);
      setVehicles(Array.isArray(vehicleData) ? vehicleData : []);
      setDrivers(Array.isArray(driverData) ? driverData : []);
    } catch (err) {
      setLookupError(err?.response?.data?.message || "Vehicles or drivers could not be loaded.");
      setVehicles([]);
      setDrivers([]);
    } finally {
      setLoadingLookups(false);
    }
  }

  useEffect(() => {
    loadLookups();
  }, [readOnly]);

  useEffect(() => {
    if (!feedback.message) return undefined;
    const timer = window.setTimeout(() => setFeedback({ type: "", message: "" }), 5000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const filteredIncidents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return incidents.filter((incident) => {
      if (statusFilter && incident.status !== statusFilter) return false;
      if (severityFilter && incident.severity !== severityFilter) return false;
      if (vehicleFilter && String(incident.vehicleId) !== String(vehicleFilter)) return false;
      if (!query) return true;

      const haystack = [
        incident.vehicle?.registration,
        incident.vehicle?.make,
        incident.vehicle?.model,
        incident.driver?.firstName,
        incident.driver?.lastName,
        incident.incidentType,
        incident.location,
        incident.description,
        incident.reportedBy,
        incident.status,
        incident.severity,
      ].filter(Boolean).join(" ").toLowerCase();

      return haystack.includes(query);
    });
  }, [incidents, search, statusFilter, severityFilter, vehicleFilter]);

  function clearFilters() {
    setSearch("");
    setStatusFilter("");
    setSeverityFilter("");
    setVehicleFilter("");
  }

  function openAddModal() {
    if (vehicles.length === 0) {
      setFeedback({ type: "error", message: "Add at least one vehicle before reporting an incident." });
      return;
    }
    setEditingIncident(null);
    setIsModalOpen(true);
  }

  function openEditModal(incident) {
    setEditingIncident(incident);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (actionLoading) return;
    setEditingIncident(null);
    setIsModalOpen(false);
  }

  function openViewModal(incident) {
    setSelectedIncident(incident);
    setIsViewOpen(true);
  }

  function closeViewModal() {
    setSelectedIncident(null);
    setIsViewOpen(false);
  }

  async function createMaintenanceTicket(payload) {
    setActionLoading(true);
    try {
      await incidentService.createMaintenanceTicket(selectedIncident.id, { ...payload, requestedBy: user?.name || "Fleet Manager" });
      setFeedback({ type: "success", message: "Maintenance ticket created and incident sent to Maintenance." });
      await loadIncidents();
      closeViewModal();
    } catch (err) {
      setFeedback({ type: "error", message: err?.response?.data?.message || "Unable to create maintenance ticket." });
      throw err;
    } finally { setActionLoading(false); }
  }

  async function resolveSelectedIncident(payload) {
    setActionLoading(true);
    try {
      await incidentService.resolveIncident(selectedIncident.id, { ...payload, resolvedBy: user?.name || "Fleet Manager" });
      setFeedback({ type: "success", message: "Incident marked resolved across TransSafe." });
      await loadIncidents();
      closeViewModal();
    } catch (err) {
      setFeedback({ type: "error", message: err?.response?.data?.message || "Unable to resolve incident." });
      throw err;
    } finally { setActionLoading(false); }
  }

  async function saveIncident(data) {
    setActionLoading(true);
    try {
      if (editingIncident) {
        await incidentService.updateIncident(editingIncident.id, data);
        setFeedback({ type: "success", message: "Incident updated successfully." });
      } else {
        await incidentService.createIncident(data);
        setFeedback({ type: "success", message: "Incident reported successfully." });
      }

      await loadIncidents();
      setEditingIncident(null);
      setIsModalOpen(false);
    } catch (err) {
      setFeedback({ type: "error", message: err?.response?.data?.message || "The incident could not be saved." });
      throw err;
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteIncident(id) {
    const confirmed = window.confirm("Delete this incident permanently? This action cannot be undone.");
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await incidentService.deleteIncident(id);
      await loadIncidents();
      setFeedback({ type: "success", message: "Incident deleted successfully." });
    } catch (err) {
      setFeedback({ type: "error", message: err?.response?.data?.message || "The incident could not be deleted." });
    } finally {
      setActionLoading(false);
    }
  }

  async function refreshAll() {
    setFeedback({ type: "", message: "" });
    try {
      await Promise.all([loadIncidents(), loadLookups()]);
      setFeedback({ type: "success", message: "Incident data refreshed." });
    } catch {
      // The hook and lookup loader expose their own errors.
    }
  }

  if (loading && incidents.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-xl bg-white px-6 py-4 text-slate-600 shadow-sm">
          <RefreshCw className="animate-spin" size={20} />
          Loading incident reports...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-100 p-3 text-red-600"><Siren size={24} /></div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Incident Reports</h1>
              <p className="mt-1 text-slate-500">Record, investigate and track fleet incidents across TransSafe.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={refreshAll} disabled={loading || loadingLookups || actionLoading} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw size={18} className={loading || loadingLookups ? "animate-spin" : ""} /> Refresh
          </button>
          {!readOnly && <button type="button" onClick={openAddModal} disabled={actionLoading} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50">
            <Plus size={19} /> New Incident
          </button>}
        </div>
      </div>

      {feedback.message && (
        <div className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium ${feedback.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>
          <span>{feedback.message}</span>
          <button type="button" onClick={() => setFeedback({ type: "", message: "" })} className="rounded-lg p-1 hover:bg-black/5"><X size={17} /></button>
        </div>
      )}

      {(error || lookupError) && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error || lookupError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={<BarChart3 size={21} />} title="Total incidents" value={stats.total} subtitle="All recorded incidents" />
        <StatCard icon={<AlertTriangle size={21} />} title="Open" value={stats.open} subtitle="Require attention" className="border-red-100" />
        <StatCard icon={<Clock3 size={21} />} title="Investigating" value={stats.investigating} subtitle="Under investigation" className="border-yellow-100" />
        <StatCard icon={<ShieldCheck size={21} />} title="Resolved" value={stats.resolved} subtitle={`${stats.critical} critical incidents`} className="border-green-100" />
        <StatCard icon={<CircleDollarSign size={21} />} title="Estimated cost" value={formatKES(stats.estimatedCost)} subtitle={`${stats.injuries} recorded injuries`} className="border-blue-100" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search size={19} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search vehicle, driver, incident type, location, description..." className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
          </div>
          <button type="button" onClick={() => setShowFilters((value) => !value)} className="rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50">Filters</button>
          {(search || statusFilter || severityFilter || vehicleFilter) && <button type="button" onClick={clearFilters} className="rounded-xl px-4 py-3 font-semibold text-red-600 hover:bg-red-50">Clear</button>}
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-200 pt-4 md:grid-cols-3">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500">
              {STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500">
              {SEVERITIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select value={vehicleFilter} onChange={(event) => setVehicleFilter(event.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500">
              <option value="">All vehicles</option>
              {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.registration}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Showing <strong className="text-slate-800">{filteredIncidents.length}</strong> of <strong className="text-slate-800">{incidents.length}</strong> incidents</span>
        {loadingLookups && <span className="inline-flex items-center gap-2"><RefreshCw size={14} className="animate-spin" /> Loading vehicles and drivers...</span>}
      </div>

      {readOnly && <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">You have view-only access to incident reports. Use the incident details to review vehicle events and follow-up requirements.</div>}
      <IncidentTable incidents={filteredIncidents} onView={openViewModal} onEdit={readOnly ? undefined : openEditModal} onDelete={readOnly ? undefined : deleteIncident} />

      {!readOnly && <IncidentModal isOpen={isModalOpen} onClose={closeModal} onSave={saveIncident} incident={editingIncident} vehicles={vehicles} drivers={drivers} />}
      <ViewIncidentModal isOpen={isViewOpen} incident={selectedIncident} role={user?.role} onClose={closeViewModal} onCreateTicket={createMaintenanceTicket} onResolve={resolveSelectedIncident} />
    </div>
  );
}

export default IncidentReports;
