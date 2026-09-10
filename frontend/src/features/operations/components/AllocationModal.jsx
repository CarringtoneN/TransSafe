import { useEffect, useState } from "react";
import { Modal } from "./OperationsUI";
import { FormField, inputClass } from "./FormField";

const blank = { driverId: "", vehicleId: "", assignedAt: "", unassignedAt: "", status: "ACTIVE", notes: "" };

export default function AllocationModal({ open, onClose, onSave, initialData, vehicles, drivers, saving, title = "Vehicle Allocation" }) {
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(initialData ? {
        driverId: String(initialData.driverId || ""),
        vehicleId: String(initialData.vehicleId || ""),
        assignedAt: initialData.assignedAt ? new Date(initialData.assignedAt).toISOString().slice(0,16) : "",
        unassignedAt: initialData.unassignedAt ? new Date(initialData.unassignedAt).toISOString().slice(0,16) : "",
        status: initialData.status || "ACTIVE",
        notes: initialData.notes || "",
      } : { ...blank, assignedAt: new Date().toISOString().slice(0,16) });
      setError("");
    }
  }, [open, initialData]);

  async function submit(e) {
    e.preventDefault();
    if (!form.vehicleId || !form.driverId) return setError("Vehicle and driver are required.");
    if (!form.assignedAt) return setError("Assigned date is required.");
    if (form.unassignedAt && new Date(form.unassignedAt) <= new Date(form.assignedAt)) {
      return setError("Unassigned date must be later than assigned date.");
    }
    await onSave({ ...form, vehicleId: Number(form.vehicleId), driverId: Number(form.driverId) });
  }

  return (
    <Modal open={open} onClose={onClose} title={initialData ? "Edit Allocation" : title} subtitle="Allocations are shared by Vehicle Allocation, Driver Allocation and Monitoring.">
      <form onSubmit={submit} className="space-y-5">
        {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Vehicle" required>
            <select className={inputClass()} value={form.vehicleId} onChange={e => setForm(f => ({...f, vehicleId: e.target.value}))}>
              <option value="">Select vehicle</option>
              {vehicles.filter(v => v.status === "ACTIVE").map(v => <option key={v.id} value={v.id}>{v.registration} — {v.make} {v.model}</option>)}
            </select>
          </FormField>
          <FormField label="Driver" required>
            <select className={inputClass()} value={form.driverId} onChange={e => setForm(f => ({...f, driverId: e.target.value}))}>
              <option value="">Select driver</option>
              {drivers.filter(d => d.status === "ACTIVE").map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}
            </select>
          </FormField>
          <FormField label="Assigned At" required>
            <input type="datetime-local" className={inputClass()} value={form.assignedAt} onChange={e => setForm(f => ({...f, assignedAt: e.target.value}))} />
          </FormField>
          <FormField label="Unassigned At">
            <input type="datetime-local" className={inputClass()} value={form.unassignedAt} onChange={e => setForm(f => ({...f, unassignedAt: e.target.value}))} />
          </FormField>
          <FormField label="Status">
            <select className={inputClass()} value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </FormField>
        </div>
        <FormField label="Notes">
          <textarea rows="4" className={inputClass()} value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} />
        </FormField>
        <div className="flex justify-end gap-3 border-t pt-4">
          <button type="button" onClick={onClose} className="rounded-xl border px-5 py-2.5">Cancel</button>
          <button disabled={saving} className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : "Save Allocation"}</button>
        </div>
      </form>
    </Modal>
  );
}
