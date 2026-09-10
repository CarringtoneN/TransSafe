import { useEffect, useState } from "react";
import { Button, Field, inputClass, Modal } from "./OperationsUI";
import operationsService from "../../../services/operationsService";

export default function AllocationModal({ open, onClose, onSaved, initial = null }) {
  const [form, setForm] = useState({ vehicleId: "", driverId: "", assignedAt: "", unassignedAt: "", status: "ACTIVE", notes: "" });
  const [lookups, setLookups] = useState({ vehicles: [], drivers: [] });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!open) return;
    setForm(initial ? { vehicleId: initial.vehicleId, driverId: initial.driverId, assignedAt: initial.assignedAt ? new Date(initial.assignedAt).toISOString().slice(0,16) : "", unassignedAt: initial.unassignedAt ? new Date(initial.unassignedAt).toISOString().slice(0,16) : "", status: initial.status || "ACTIVE", notes: initial.notes || "" } : { vehicleId: "", driverId: "", assignedAt: new Date().toISOString().slice(0,16), unassignedAt: "", status: "ACTIVE", notes: "" });
    setError("");
    operationsService.getLookups().then(setLookups).catch(e => setError(e?.response?.data?.message || e.message));
  }, [open, initial]);
  const change = (k,v) => setForm(f => ({...f,[k]:v}));
  async function submit(e) {
    e.preventDefault(); setError("");
    if (!form.vehicleId || !form.driverId || !form.assignedAt) return setError("Vehicle, driver and assignment date are required.");
    setSaving(true);
    try {
      const payload = {...form, vehicleId:Number(form.vehicleId), driverId:Number(form.driverId), unassignedAt:form.unassignedAt || null, notes:form.notes.trim() || null};
      if (initial?.id) await operationsService.updateVehicleAllocation(initial.id,payload); else await operationsService.createVehicleAllocation(payload);
      onSaved(); onClose();
    } catch(e){ setError(e?.response?.data?.message || e.message); } finally {setSaving(false);}
  }
  return <Modal open={open} onClose={onClose} title={initial ? "Edit Allocation" : "New Vehicle / Driver Allocation"}>
    <form onSubmit={submit} className="space-y-5 p-6">
      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Vehicle" required><select className={inputClass} value={form.vehicleId} onChange={e=>change("vehicleId",e.target.value)}><option value="">Select vehicle</option>{lookups.vehicles.map(v=><option key={v.id} value={v.id}>{v.registration} — {v.make} {v.model}</option>)}</select></Field>
        <Field label="Driver" required><select className={inputClass} value={form.driverId} onChange={e=>change("driverId",e.target.value)}><option value="">Select driver</option>{lookups.drivers.map(d=><option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}</select></Field>
        <Field label="Assigned At" required><input type="datetime-local" className={inputClass} value={form.assignedAt} onChange={e=>change("assignedAt",e.target.value)} /></Field>
        <Field label="Unassigned At"><input type="datetime-local" className={inputClass} value={form.unassignedAt} onChange={e=>change("unassignedAt",e.target.value)} /></Field>
        <Field label="Status"><select className={inputClass} value={form.status} onChange={e=>change("status",e.target.value)}><option>ACTIVE</option><option>INACTIVE</option><option>COMPLETED</option></select></Field>
        <Field label="Notes"><input className={inputClass} value={form.notes} onChange={e=>change("notes",e.target.value)} /></Field>
      </div>
      <div className="flex justify-end gap-3 border-t pt-5"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={saving}>{saving ? "Saving…" : "Save Allocation"}</Button></div>
    </form>
  </Modal>;
}
