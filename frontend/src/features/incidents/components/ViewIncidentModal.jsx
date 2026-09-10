import {
  AlertTriangle,
  Calendar,
  Car,
  User,
  MapPin,
  Banknote,
  Shield,
  ClipboardList,
  X,
  FileText,
  ExternalLink,
} from "lucide-react";
import { API_ORIGIN } from "../../../services/api";
import { useState } from "react";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatKES(value) {
  if (value === null || value === undefined || value === "") return "N/A";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    currencyDisplay: "symbol",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function pretty(value) {
  return String(value || "-").replaceAll("_", " ");
}

function severityClass(severity) {
  if (severity === "LOW") return "bg-green-100 text-green-700";
  if (severity === "MEDIUM") return "bg-yellow-100 text-yellow-700";
  if (severity === "HIGH") return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-700";
}

function statusClass(status) {
  if (status === "OPEN") return "bg-red-100 text-red-700";
  if (status === "UNDER_INVESTIGATION") return "bg-yellow-100 text-yellow-700";
  if (status === "RESOLVED") return "bg-green-100 text-green-700";
  return "bg-slate-200 text-slate-700";
}

function ViewIncidentModal({ isOpen, incident, onClose, role, onCreateTicket, onResolve }) {
  const [busy, setBusy] = useState(false);

  async function createTicket() {
    const workDescription = window.prompt("Describe the maintenance work required:", incident.description || "Investigate and repair reported incident.");
    if (!workDescription) return;
    const assignedTechnician = window.prompt("Assign mechanic (optional):", "");
    setBusy(true);
    try { await onCreateTicket({ workDescription, assignedTechnician: assignedTechnician || null }); } finally { setBusy(false); }
  }

  async function resolve() {
    const resolutionNotes = window.prompt("Explain what was done to resolve this incident:", "");
    if (!resolutionNotes) return;
    setBusy(true);
    try { await onResolve({ resolutionNotes }); } finally { setBusy(false); }
  }
  if (!isOpen || !incident) return null;

  const attachmentUrl = incident.attachmentPath
    ? `${API_ORIGIN}${incident.attachmentPath}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-100 p-3 text-red-600">
              <AlertTriangle size={25} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Incident Report</h2>
              <p className="text-sm text-slate-500">Incident #{incident.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Close incident details">
            <X size={24} />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto p-6">
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoCard icon={<Car size={18} />} label="Vehicle" value={incident.vehicle?.registration || "-"} color="text-blue-600" />
            <InfoCard icon={<User size={18} />} label="Driver" value={incident.driver ? `${incident.driver.firstName} ${incident.driver.lastName}` : "No driver assigned"} color="text-green-600" />
            <InfoCard icon={<Calendar size={18} />} label="Incident Date" value={formatDate(incident.incidentDate)} color="text-purple-600" />
            <InfoCard icon={<AlertTriangle size={18} />} label="Type" value={pretty(incident.incidentType)} color="text-red-600" />
            <InfoCard icon={<MapPin size={18} />} label="Location" value={incident.location || "-"} color="text-orange-600" />
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="mb-2 text-sm font-semibold text-slate-500">Severity</p>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${severityClass(incident.severity)}`}>{pretty(incident.severity)}</span>
            </div>
          </div>

          <section className="mb-6">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900"><ClipboardList size={20} /> Description</h3>
            <div className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-5 leading-7 text-slate-700">{incident.description || "No description provided."}</div>
          </section>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <InfoCard icon={<AlertTriangle size={18} />} label="Injuries" value={String(incident.injuries ?? 0)} color="text-red-600" />
            <InfoCard icon={<Banknote size={18} />} label="Estimated Cost" value={formatKES(incident.estimatedCost)} color="text-emerald-600" />
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-500"><Shield size={18} /> Police Report</p>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${incident.policeReported ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-700"}`}>{incident.policeReported ? "YES" : "NO"}</span>
            </div>
            <InfoCard label="Reported By" value={incident.reportedBy || "-"} color="text-slate-700" />
          </div>

          <div className="mb-6 rounded-xl border border-slate-200 p-4">
            <p className="mb-2 text-sm font-semibold text-slate-500">Status</p>
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClass(incident.status)}`}>{pretty(incident.status)}</span>
          </div>

          {attachmentUrl && (
            <section className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="shrink-0 text-blue-600" size={22} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-800">{incident.attachmentName || "Incident attachment"}</p>
                    <p className="text-xs text-slate-500">{incident.attachmentSize ? `${(Number(incident.attachmentSize) / 1024 / 1024).toFixed(2)} MB` : ""}</p>
                  </div>
                </div>
                <a href={attachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                  <ExternalLink size={16} /> Open attachment
                </a>
              </div>
            </section>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
          {!["RESOLVED", "CLOSED"].includes(incident.status) && ["FLEET_MANAGER", "MAINTENANCE_COMPLIANCE", "TECHNICIAN_MECHANIC"].includes(role) && (
            <button disabled={busy} onClick={createTicket} className="rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-50">Create Maintenance Ticket</button>
          )}
          {!["RESOLVED", "CLOSED"].includes(incident.status) && ["FLEET_MANAGER", "MAINTENANCE_COMPLIANCE", "TECHNICIAN_MECHANIC"].includes(role) && (
            <button disabled={busy} onClick={resolve} className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50">Mark Resolved</button>
          )}
          <button onClick={onClose} className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800">Close</button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value, color = "text-slate-700" }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className={`mb-2 flex items-center gap-2 text-sm font-semibold ${color}`}>{icon}<span>{label}</span></div>
      <p className="break-words text-base font-semibold text-slate-800">{value}</p>
    </div>
  );
}

export default ViewIncidentModal;
