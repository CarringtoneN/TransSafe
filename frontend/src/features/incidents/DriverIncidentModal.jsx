import { useEffect, useState } from "react";
import { AlertTriangle, Paperclip } from "lucide-react";

const TYPES = ["COLLISION", "BREAKDOWN", "THEFT", "VANDALISM", "WEATHER", "FIRE", "INJURY", "MECHANICAL_FAILURE", "ROAD_HAZARD", "OTHER"];
const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const emptyForm = {
  vehicleId: "",
  incidentDate: new Date().toISOString().slice(0, 16),
  incidentType: "OTHER",
  severity: "MEDIUM",
  location: "",
  description: "",
  injuries: 0,
  estimatedCost: "",
  policeReported: false,
  attachment: null,
};

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DriverIncidentModal({ open, vehicles, onSubmit, onClose, submitting = false }) {
  const [form, setForm] = useState(emptyForm);
  const [fileName, setFileName] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm({ ...emptyForm, vehicleId: vehicles[0]?.vehicleId || vehicles[0]?.vehicle?.id || "" });
    setFileName("");
    setLocalError("");
  }, [open, vehicles]);

  if (!open) return null;

  const update = (name, value) => setForm((previous) => ({ ...previous, [name]: value }));

  async function submit(event) {
    event.preventDefault();
    setLocalError("");
    try {
      let attachment;
      if (form.attachment) {
        if (form.attachment.size > 5 * 1024 * 1024) throw new Error("Attachment must be 5 MB or smaller.");
        const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
        if (!allowed.includes(form.attachment.type)) throw new Error("Only PDF, JPG, PNG, and WEBP files are supported.");
        attachment = {
          name: form.attachment.name,
          type: form.attachment.type,
          size: form.attachment.size,
          data: await fileToDataUrl(form.attachment),
        };
      }
      await onSubmit({ ...form, attachment, attachmentFile: undefined });
    } catch (error) {
      setLocalError(error.response?.data?.message || error.message || "Unable to prepare the incident report.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-red-600"><AlertTriangle size={22} /><h2 className="text-2xl font-bold text-slate-900">Report an Incident</h2></div>
            <p className="mt-1 text-sm text-slate-500">Submit an incident involving one of your currently assigned vehicles.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border px-3 py-2">Close</button>
        </div>

        {localError && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{localError}</div>}

        <form onSubmit={submit} className="mt-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">Vehicle
              <select required value={form.vehicleId} onChange={(e) => update("vehicleId", e.target.value)} className="mt-1 w-full rounded-lg border p-3">
                <option value="">Select assigned vehicle</option>
                {vehicles.map((item) => { const v = item.vehicle || item; return <option key={v.id} value={v.id}>{v.registration} — {v.make} {v.model}</option>; })}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">Incident date & time
              <input required type="datetime-local" value={form.incidentDate} max={new Date().toISOString().slice(0, 16)} onChange={(e) => update("incidentDate", e.target.value)} className="mt-1 w-full rounded-lg border p-3" />
            </label>
            <label className="text-sm font-medium text-slate-700">Incident type
              <select value={form.incidentType} onChange={(e) => update("incidentType", e.target.value)} className="mt-1 w-full rounded-lg border p-3">
                {TYPES.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">Severity
              <select value={form.severity} onChange={(e) => update("severity", e.target.value)} className="mt-1 w-full rounded-lg border p-3">
                {SEVERITIES.map((severity) => <option key={severity} value={severity}>{severity}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700 md:col-span-2">Location
              <input required value={form.location} onChange={(e) => update("location", e.target.value)} className="mt-1 w-full rounded-lg border p-3" placeholder="Road, depot, town or landmark" />
            </label>
            <label className="text-sm font-medium text-slate-700">Injuries
              <input min="0" type="number" value={form.injuries} onChange={(e) => update("injuries", e.target.value)} className="mt-1 w-full rounded-lg border p-3" />
            </label>
            <label className="text-sm font-medium text-slate-700">Estimated cost
              <input min="0" type="number" step="0.01" value={form.estimatedCost} onChange={(e) => update("estimatedCost", e.target.value)} className="mt-1 w-full rounded-lg border p-3" placeholder="Optional" />
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700">Description
            <textarea required minLength={10} rows="5" value={form.description} onChange={(e) => update("description", e.target.value)} className="mt-1 w-full rounded-lg border p-3" placeholder="Describe what happened, damage, hazards and immediate actions taken..." />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-lg border p-3 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={form.policeReported} onChange={(e) => update("policeReported", e.target.checked)} className="h-5 w-5" /> Police report made
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm font-medium text-slate-700">
              <Paperclip size={18} />
              <span className="truncate">{fileName || "Attach photo/PDF (optional)"}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={(e) => { const file = e.target.files?.[0] || null; update("attachment", file); setFileName(file?.name || ""); }} />
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2">Cancel</button>
            <button disabled={submitting} className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white disabled:opacity-60">{submitting ? "Submitting..." : "Submit Incident Report"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
