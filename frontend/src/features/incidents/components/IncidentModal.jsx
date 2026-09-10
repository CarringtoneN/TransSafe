import { useEffect, useMemo, useState } from "react";
import { API_ORIGIN } from "../../../services/api";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";

const INCIDENT_TYPES = [
  ["COLLISION", "Collision"],
  ["BREAKDOWN", "Breakdown"],
  ["THEFT", "Theft"],
  ["VANDALISM", "Vandalism"],
  ["WEATHER", "Weather related"],
  ["FIRE", "Fire"],
  ["INJURY", "Injury"],
  ["MECHANICAL_FAILURE", "Mechanical failure"],
  ["ROAD_HAZARD", "Road hazard"],
  ["OTHER", "Other"],
];

const SEVERITIES = [
  ["LOW", "Low"],
  ["MEDIUM", "Medium"],
  ["HIGH", "High"],
  ["CRITICAL", "Critical"],
];

const STATUSES = [
  ["OPEN", "Open"],
  ["UNDER_INVESTIGATION", "Under investigation"],
  ["RESOLVED", "Resolved"],
  ["CLOSED", "Closed"],
];

const initialForm = {
  vehicleId: "",
  driverId: "",
  incidentDate: "",
  incidentType: "",
  incidentTypeOther: "",
  severity: "LOW",
  location: "",
  description: "",
  injuries: "0",
  estimatedCost: "",
  policeReported: false,
  reportedBy: "",
  status: "OPEN",
  attachment: null,
  removeAttachment: false,
};

function toLocalDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function getVehicleLabel(vehicle) {
  const registration = vehicle?.registration || `Vehicle #${vehicle?.id}`;
  const details = [vehicle?.make, vehicle?.model].filter(Boolean).join(" ");
  return details ? `${registration} — ${details}` : registration;
}

function getDriverLabel(driver) {
  const name = [driver?.firstName, driver?.lastName].filter(Boolean).join(" ");
  return `${name || `Driver #${driver?.id}`}${driver?.employeeNumber ? ` — ${driver.employeeNumber}` : ""}`;
}

function validate(form, isEdit) {
  const errors = {};
  if (!form.vehicleId) errors.vehicleId = "Select a vehicle.";
  if (!form.incidentDate) errors.incidentDate = "Select the incident date and time.";
  if (form.incidentDate && new Date(form.incidentDate).getTime() > Date.now()) {
    errors.incidentDate = "Incident date cannot be in the future.";
  }
  if (!form.incidentType) errors.incidentType = "Select an incident type.";
  if (form.incidentType === "OTHER" && form.incidentTypeOther.trim().length < 2) {
    errors.incidentTypeOther = "Describe the incident type.";
  }
  if (!form.location.trim()) errors.location = "Location is required.";
  if (form.location.trim().length > 255) errors.location = "Location is too long.";
  if (form.description.trim().length < 10) errors.description = "Enter at least 10 characters describing what happened.";
  if (form.description.trim().length > 5000) errors.description = "Description is too long.";
  if (!Number.isInteger(Number(form.injuries)) || Number(form.injuries) < 0) errors.injuries = "Enter a valid non-negative number.";
  if (form.estimatedCost !== "" && (!Number.isFinite(Number(form.estimatedCost)) || Number(form.estimatedCost) < 0)) {
    errors.estimatedCost = "Enter a valid non-negative cost.";
  }
  if (!form.reportedBy.trim() || form.reportedBy.trim().length < 2) errors.reportedBy = "Enter the reporter's name.";
  if (form.reportedBy.trim().length > 150) errors.reportedBy = "Reporter name is too long.";
  if (!isEdit) {
    // New incidents always start as OPEN; status is controlled automatically.
  }
  return errors;
}

function IncidentModal({ isOpen, onClose, onSave, incident, vehicles = [], drivers = [] }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [fileError, setFileError] = useState("");

  const isEdit = Boolean(incident);

  useEffect(() => {
    if (!isOpen) return;

    // The modal form is intentionally synchronized with the selected incident when the dialog opens.
    if (incident) {
      const knownType = INCIDENT_TYPES.some(([value]) => value === incident.incidentType);
      setForm({
        ...initialForm,
        vehicleId: incident.vehicleId ?? incident.vehicle?.id ?? "",
        driverId: incident.driverId ?? incident.driver?.id ?? "",
        incidentDate: toLocalDateTime(incident.incidentDate),
        incidentType: knownType ? incident.incidentType : "OTHER",
        incidentTypeOther: knownType ? "" : incident.incidentType || "",
        severity: incident.severity || "LOW",
        location: incident.location || "",
        description: incident.description || "",
        injuries: String(incident.injuries ?? 0),
        estimatedCost: incident.estimatedCost == null ? "" : String(incident.estimatedCost),
        policeReported: Boolean(incident.policeReported),
        reportedBy: incident.reportedBy || "",
        status: incident.status || "OPEN",
        attachment: null,
        removeAttachment: false,
      });
    } else {
      setForm({
        ...initialForm,
        incidentDate: toLocalDateTime(new Date()),
      });
    }

    setErrors({});
    setFileError("");
  }, [incident, isOpen]);

  const existingAttachment = useMemo(() => {
    if (!incident?.attachmentPath || form.removeAttachment || form.attachment) return null;
    return {
      name: incident.attachmentName || "Incident attachment",
      path: incident.attachmentPath,
      size: incident.attachmentSize,
    };
  }, [incident, form.attachment, form.removeAttachment]);

  const eligibleDrivers = form.vehicleId ? drivers.filter(d => new Set((vehicles.find(v=>Number(v.id)===Number(form.vehicleId))?.assignment||[]).filter(a=>a.status==="ACTIVE"&&!a.unassignedAt).map(a=>Number(a.driverId))).has(Number(d.id))) : drivers;
  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((previous) => {
      const next={...previous,[name]:type==="checkbox"?checked:value};
      if(name==="vehicleId"){
        const v=vehicles.find(x=>Number(x.id)===Number(value));
        const eligible=(v?.assignment||[]).filter(a=>a.status==="ACTIVE"&&!a.unassignedAt);
        const currentStillLinked=eligible.some(a=>Number(a.driverId)===Number(previous.driverId)); next.driverId=currentStillLinked?String(previous.driverId):(eligible.length?String(eligible[0].driverId):"");
      }
      return next;
    });
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setFileError("Only PDF, JPG, PNG, and WEBP files are supported.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError("The attachment must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setForm((previous) => ({
        ...previous,
        attachment: {
          name: file.name,
          type: file.type,
          size: file.size,
          data,
        },
        removeAttachment: false,
      }));
      setFileError("");
    } catch {
      setFileError("The file could not be read. Please try again.");
    }
  }

  function removeSelectedFile() {
    setForm((previous) => ({ ...previous, attachment: null, removeAttachment: Boolean(incident?.attachmentPath) }));
    setFileError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validate(form, isEdit);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);

    const incidentType = form.incidentType === "OTHER" ? form.incidentTypeOther.trim() : form.incidentType;
    const payload = {
      vehicleId: Number(form.vehicleId),
      driverId: form.driverId ? Number(form.driverId) : null,
      incidentDate: new Date(form.incidentDate).toISOString(),
      incidentType,
      severity: form.severity,
      location: form.location.trim(),
      description: form.description.trim(),
      injuries: Number(form.injuries),
      estimatedCost: form.estimatedCost === "" ? null : Number(form.estimatedCost),
      policeReported: Boolean(form.policeReported),
      reportedBy: form.reportedBy.trim(),
      ...(isEdit ? { status: form.status } : { status: "OPEN" }),
      ...(form.attachment ? { attachment: form.attachment } : {}),
      ...(form.removeAttachment ? { removeAttachment: true } : {}),
    };

    try {
      await onSave(payload);
    } catch {
      // Parent handles the visible API error; keep the modal open for correction.
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  const fieldClass = (field) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
      errors[field] ? "border-red-500 ring-2 ring-red-100" : "border-slate-300"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
              <AlertTriangle size={25} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{isEdit ? "Edit Incident" : "Report Incident"}</h2>
              <p className="text-sm text-slate-500">Record the incident details and supporting evidence.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={saving} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Close incident form">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="min-h-0 overflow-y-auto">
          <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Vehicle <span className="text-red-500">*</span></label>
                <select name="vehicleId" value={form.vehicleId} onChange={handleChange} className={fieldClass("vehicleId")} required>
                  <option value="">Select a vehicle...</option>
                  {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{getVehicleLabel(vehicle)}</option>)}
                </select>
                {vehicles.length === 0 && <p className="mt-1 text-xs text-amber-600">No vehicles were returned by the API.</p>}
                {errors.vehicleId && <p className="mt-1 text-xs text-red-600">{errors.vehicleId}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Driver</label>
                <select name="driverId" value={form.driverId} onChange={handleChange} className={fieldClass("driverId")}>
                  <option value="">Select a driver (optional)...</option>
                  {drivers.map((driver) => <option key={driver.id} value={driver.id}>{getDriverLabel(driver)}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Date & Time <span className="text-red-500">*</span></label>
                <input type="datetime-local" name="incidentDate" value={form.incidentDate} onChange={handleChange} max={toLocalDateTime(new Date())} className={fieldClass("incidentDate")} required />
                {errors.incidentDate && <p className="mt-1 text-xs text-red-600">{errors.incidentDate}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Incident Type <span className="text-red-500">*</span></label>
                <select name="incidentType" value={form.incidentType} onChange={handleChange} className={fieldClass("incidentType")} required>
                  <option value="">Select type...</option>
                  {INCIDENT_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                {errors.incidentType && <p className="mt-1 text-xs text-red-600">{errors.incidentType}</p>}
              </div>

              {form.incidentType === "OTHER" && (
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Other Incident Type <span className="text-red-500">*</span></label>
                  <input name="incidentTypeOther" value={form.incidentTypeOther} onChange={handleChange} className={fieldClass("incidentTypeOther")} placeholder="Describe the incident type" />
                  {errors.incidentTypeOther && <p className="mt-1 text-xs text-red-600">{errors.incidentTypeOther}</p>}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Severity</label>
                <select name="severity" value={form.severity} onChange={handleChange} className={fieldClass("severity")}>
                  {SEVERITIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Location <span className="text-red-500">*</span></label>
                <input name="location" value={form.location} onChange={handleChange} className={fieldClass("location")} placeholder="Road, town, street address or coordinates" maxLength={255} required />
                {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Description <span className="text-red-500">*</span></label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={5} maxLength={5000} className={fieldClass("description")} placeholder="Describe what happened, damage observed, immediate action taken, and any relevant details..." required />
              <div className="mt-1 flex justify-between text-xs">
                <span className="text-red-600">{errors.description || ""}</span>
                <span className="text-slate-400">{form.description.length}/5000</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Number of Injuries</label>
                <input type="number" min="0" step="1" name="injuries" value={form.injuries} onChange={handleChange} className={fieldClass("injuries")} />
                {errors.injuries && <p className="mt-1 text-xs text-red-600">{errors.injuries}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Estimated Cost (KSh)</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-500">KSh</span>
                  <input type="number" min="0" step="0.01" name="estimatedCost" value={form.estimatedCost} onChange={handleChange} className={`${fieldClass("estimatedCost")} pl-14`} placeholder="0.00" />
                </div>
                {errors.estimatedCost && <p className="mt-1 text-xs text-red-600">{errors.estimatedCost}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Reported By <span className="text-red-500">*</span></label>
                <input name="reportedBy" value={form.reportedBy} onChange={handleChange} className={fieldClass("reportedBy")} placeholder="Name of person reporting" required />
                {errors.reportedBy && <p className="mt-1 text-xs text-red-600">{errors.reportedBy}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Police Report</label>
                <label className="flex min-h-[50px] cursor-pointer items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3">
                  <input type="checkbox" name="policeReported" checked={form.policeReported} onChange={handleChange} className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm font-medium text-slate-700">Police were notified and a report was filed</span>
                </label>
              </div>

              {isEdit ? (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className={fieldClass("status")}>
                    {STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
              ) : (
                <div className="flex items-end">
                  <div className="w-full rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                    New incidents are automatically created with <strong>OPEN</strong> status.
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">Evidence / Attachment</label>
                <span className="text-xs text-slate-400">PDF, JPG, PNG or WEBP • max 5 MB</span>
              </div>
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-4 transition hover:border-blue-400 hover:bg-blue-50">
                <Upload className="text-blue-600" size={22} />
                <div>
                  <p className="font-medium text-slate-800">Choose an incident photo or document</p>
                  <p className="text-xs text-slate-500">Upload evidence, police documentation, or supporting paperwork.</p>
                </div>
                <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={handleFileChange} className="hidden" />
              </label>

              {fileError && <p className="mt-2 text-sm text-red-600">{fileError}</p>}

              {form.attachment && (
                <div className="mt-3 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="shrink-0 text-green-600" size={20} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{form.attachment.name}</p>
                      <p className="text-xs text-slate-500">{(form.attachment.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button type="button" onClick={removeSelectedFile} className="rounded-lg p-2 text-red-600 hover:bg-red-100" title="Remove selected attachment">
                    <X size={18} />
                  </button>
                </div>
              )}

              {existingAttachment && (
                <div className="mt-3 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-3">
                  <a href={`${API_ORIGIN}${existingAttachment.path}`} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-3 text-blue-700 hover:underline">
                    <FileText className="shrink-0" size={20} />
                    <span className="truncate text-sm font-medium">{existingAttachment.name}</span>
                  </a>
                  <button type="button" onClick={removeSelectedFile} className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100">Remove</button>
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
            <button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
              {saving ? "Saving..." : isEdit ? "Update Incident" : "Save Incident"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default IncidentModal;
