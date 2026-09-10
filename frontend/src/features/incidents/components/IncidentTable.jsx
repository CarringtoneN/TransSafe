import { Eye, Pencil, Trash2, FileText } from "lucide-react";
import { API_ORIGIN } from "../../../services/api";

function pretty(value) {
  return String(value || "-").replaceAll("_", " ");
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
}

function formatKES(value) {
  if (value === null || value === undefined || value === "") return "-";
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", currencyDisplay: "symbol", maximumFractionDigits: 2 }).format(Number(value));
}

function severityClass(value) {
  if (value === "LOW") return "bg-green-100 text-green-700";
  if (value === "MEDIUM") return "bg-yellow-100 text-yellow-700";
  if (value === "HIGH") return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-700";
}

function statusClass(value) {
  if (value === "OPEN") return "bg-red-100 text-red-700";
  if (value === "UNDER_INVESTIGATION") return "bg-yellow-100 text-yellow-700";
  if (value === "RESOLVED") return "bg-green-100 text-green-700";
  return "bg-slate-200 text-slate-700";
}

function IncidentTable({ incidents = [], onView, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Vehicle</th>
              <th className="px-5 py-4">Driver</th>
              <th className="px-5 py-4">Type</th>
              <th className="px-5 py-4">Severity</th>
              <th className="px-5 py-4">Cost</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {incidents.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-14 text-center text-slate-500">No incidents match your current filters.</td></tr>
            ) : incidents.map((incident) => (
              <tr key={incident.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                <td className="px-5 py-4 text-sm font-medium text-slate-700">{formatDate(incident.incidentDate)}</td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-800">{incident.vehicle?.registration || "-"}</td>
                <td className="px-5 py-4 text-sm text-slate-700">{incident.driver ? `${incident.driver.firstName} ${incident.driver.lastName}` : "-"}</td>
                <td className="px-5 py-4 text-sm text-slate-700">{pretty(incident.incidentType)}</td>
                <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${severityClass(incident.severity)}`}>{pretty(incident.severity)}</span></td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-700">{formatKES(incident.estimatedCost)}</td>
                <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClass(incident.status)}`}>{pretty(incident.status)}</span></td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-center gap-1">
                    {incident.attachmentPath && <a href={`${API_ORIGIN}${incident.attachmentPath}`} target="_blank" rel="noreferrer" title="Open attachment" className="rounded-lg p-2 text-purple-600 hover:bg-purple-50"><FileText size={17} /></a>}
                    {onView && <button type="button" onClick={() => onView(incident)} title="View incident" className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"><Eye size={17} /></button>}
                    {onEdit && <button type="button" onClick={() => onEdit(incident)} title="Edit incident" className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"><Pencil size={17} /></button>}
                    {onDelete && <button type="button" onClick={() => onDelete(incident.id)} title="Delete incident" className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default IncidentTable;
