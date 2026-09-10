import { useEffect, useState } from "react";
import { Button, Field, inputClass, Modal } from "./OperationsUI";
import operationsService from "../../../services/operationsService";

const empty = { origin: "", destination: "", departureTime: "", arrivalTime: "", distance: "", vehicleId: "", driverId: "", status: "SCHEDULED" };
const localInput = (value) => value ? new Date(value).toISOString().slice(0, 16) : "";

export default function TripModal({ open, onClose, onSaved, initial = null }) {
  const [form, setForm] = useState(empty);
  const [lookups, setLookups] = useState({ vehicles: [], drivers: [] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm(initial ? { ...initial, departureTime: localInput(initial.departureTime), arrivalTime: localInput(initial.arrivalTime) } : empty);
    setError("");
    operationsService.getLookups().then(setLookups).catch((e) => setError(e?.response?.data?.message || e.message));
  }, [open, initial]);

  const change = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.origin.trim() || !form.destination.trim() || !form.departureTime || !form.vehicleId || !form.driverId) {
      setError("Origin, destination, departure time, vehicle and driver are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, origin: form.origin.trim(), destination: form.destination.trim(), vehicleId: Number(form.vehicleId), driverId: Number(form.driverId), distance: form.distance === "" ? null : Number(form.distance), arrivalTime: form.arrivalTime || null };
      if (initial?.id) await operationsService.updateTrip(initial.id, payload); else await operationsService.createTrip(payload);
      onSaved();
      onClose();
    } catch (e) { setError(e?.response?.data?.message || e.message); } finally { setSaving(false); }
  }

  return <Modal open={open} onClose={onClose} title={initial ? "Edit Trip" : "New Trip"}>
    <form onSubmit={submit} className="space-y-5 p-6">
      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Origin" required><input className={inputClass} value={form.origin} onChange={(e) => change("origin", e.target.value)} /></Field>
        <Field label="Destination" required><input className={inputClass} value={form.destination} onChange={(e) => change("destination", e.target.value)} /></Field>
        <Field label="Departure" required><input type="datetime-local" className={inputClass} value={form.departureTime} onChange={(e) => change("departureTime", e.target.value)} /></Field>
        <Field label="Arrival"><input type="datetime-local" className={inputClass} value={form.arrivalTime} onChange={(e) => change("arrivalTime", e.target.value)} /></Field>
        <Field label="Vehicle" required><select className={inputClass} value={form.vehicleId} onChange={(e) => change("vehicleId", e.target.value)}><option value="">Select vehicle</option>{lookups.vehicles.map(v => <option key={v.id} value={v.id}>{v.registration} — {v.make} {v.model}</option>)}</select></Field>
        <Field label="Driver" required><select className={inputClass} value={form.driverId} onChange={(e) => change("driverId", e.target.value)}><option value="">Select driver</option>{lookups.drivers.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName} — {d.employeeNumber}</option>)}</select></Field>
        <Field label="Distance (km)"><input type="number" min="0" step="0.1" className={inputClass} value={form.distance} onChange={(e) => change("distance", e.target.value)} /></Field>
        <Field label="Status"><select className={inputClass} value={form.status} onChange={(e) => change("status", e.target.value)}><option>SCHEDULED</option><option>IN_PROGRESS</option><option>COMPLETED</option><option>CANCELLED</option></select></Field>
      </div>
      <div className="flex justify-end gap-3 border-t pt-5"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={saving}>{saving ? "Saving…" : "Save Trip"}</Button></div>
    </form>
  </Modal>;
}
