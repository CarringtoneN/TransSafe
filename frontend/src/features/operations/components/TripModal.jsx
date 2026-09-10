import { useEffect, useMemo, useState } from "react";
import { Modal } from "./OperationsUI";
import { FormField, inputClass } from "./FormField";

const blank = {
  origin: "",
  destination: "",
  departureTime: "",
  arrivalTime: "",
  distance: "",
  status: "SCHEDULED",
  vehicleId: "",
  driverId: "",
  secondDriverId: "",
};

export default function TripModal({ open, onClose, onSave, initialData, vehicles, drivers, assignments = [], saving }) {
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initialData ? {
        origin: initialData.origin || "",
        destination: initialData.destination || "",
        departureTime: initialData.departureTime ? new Date(initialData.departureTime).toISOString().slice(0,16) : "",
        arrivalTime: initialData.arrivalTime ? new Date(initialData.arrivalTime).toISOString().slice(0,16) : "",
        distance: initialData.distance ?? "",
        status: initialData.status || "SCHEDULED",
        vehicleId: String(initialData.vehicleId || ""),
        driverId: String(initialData.driverId || ""),
        secondDriverId: String((initialData.tripDriver || []).find(s => s.planned)?.driverId || ""),
      } : blank);
      setErrors({});
    }
  }, [open, initialData]);

  const activeAssignments = useMemo(() => assignments.filter(a => a.status === "ACTIVE"), [assignments]);
  const availableVehicles = useMemo(() => vehicles.filter(v => v.status === "ACTIVE"), [vehicles]);
  const availableDrivers = useMemo(() => {
    const selectedVehicle = Number(form.vehicleId);
    if (!selectedVehicle) return drivers.filter(d => d.status === "ACTIVE");
    const ids = new Set(activeAssignments.filter(a => Number(a.vehicleId) === selectedVehicle).map(a => Number(a.driverId)));
    return drivers.filter(d => d.status === "ACTIVE" && ids.has(Number(d.id)));
  }, [drivers, form.vehicleId, activeAssignments]);

  const availableSecondDrivers = useMemo(() => {
    const selectedVehicle = Number(form.vehicleId);
    const primary = Number(form.driverId);
    if (!selectedVehicle || !primary) return [];
    const ids = new Set(activeAssignments.filter(a => Number(a.vehicleId) === selectedVehicle).map(a => Number(a.driverId)));
    return drivers.filter(d => d.status === "ACTIVE" && ids.has(Number(d.id)) && Number(d.id) !== primary);
  }, [drivers, form.vehicleId, form.driverId, activeAssignments]);

  const update = (name, value) => {
    setForm(f => {
      const next = { ...f, [name]: value };
      if (name === "driverId" && value) {
        const driverAssignments = activeAssignments.filter(a => Number(a.driverId) === Number(value));
        if (driverAssignments.length === 1) next.vehicleId = String(driverAssignments[0].vehicleId);
        if (next.secondDriverId === value) next.secondDriverId = "";
      }
      if (name === "vehicleId" && value) {
        const vehicleAssignments = activeAssignments.filter(a => Number(a.vehicleId) === Number(value));
        if (vehicleAssignments.length >= 1) {
          const currentStillAssigned = vehicleAssignments.some(a => Number(a.driverId) === Number(f.driverId));
          next.driverId = currentStillAssigned ? String(f.driverId) : String(vehicleAssignments[0].driverId);
        } else {
          next.driverId = "";
        }
        if (!vehicleAssignments.some(a => Number(a.driverId) === Number(f.secondDriverId))) next.secondDriverId = "";
      }
      return next;
    });
  };

  async function submit(e) {
    e.preventDefault();
    const next = {};
    if (!form.origin.trim()) next.origin = "Origin is required.";
    if (!form.destination.trim()) next.destination = "Destination is required.";
    if (!form.departureTime) next.departureTime = "Departure time is required.";
    if (form.distance === "" || !Number.isFinite(Number(form.distance)) || Number(form.distance) <= 0) next.distance = "Trip distance must be greater than zero.";
    if (!form.vehicleId && !form.driverId) { next.vehicleId = "Select a driver or vehicle."; next.driverId = "Select a driver or vehicle."; }
    if (form.distance !== "" && Number(form.distance) > 500 && !form.secondDriverId) next.secondDriverId = "Trips over 500 km require two drivers allocated to the vehicle.";
    if (form.vehicleId && form.driverId) {
      const linked = activeAssignments.some(a => Number(a.vehicleId) === Number(form.vehicleId) && Number(a.driverId) === Number(form.driverId));
      if (!linked) { next.vehicleId = "Driver and vehicle must be an active allocation pair."; next.driverId = "Driver and vehicle must be an active allocation pair."; }
    }
    if (form.arrivalTime && form.departureTime && new Date(form.arrivalTime) <= new Date(form.departureTime)) {
      next.arrivalTime = "Arrival must be after departure.";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    await onSave({
      ...form,
      vehicleId: Number(form.vehicleId),
      driverId: Number(form.driverId),
      secondDriverId: form.secondDriverId ? Number(form.secondDriverId) : null,
      distance: form.distance === "" ? null : Number(form.distance),
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={initialData ? "Edit Trip" : "New Trip"} subtitle="Trips are the source of truth for Manifest and Monitoring." wide>
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Origin" required error={errors.origin}>
            <input className={inputClass(errors.origin)} value={form.origin} onChange={e => update("origin", e.target.value)} placeholder="e.g. Nairobi" />
          </FormField>
          <FormField label="Destination" required error={errors.destination}>
            <input className={inputClass(errors.destination)} value={form.destination} onChange={e => update("destination", e.target.value)} placeholder="e.g. Mombasa" />
          </FormField>
          <FormField label="Departure" required error={errors.departureTime}>
            <input type="datetime-local" className={inputClass(errors.departureTime)} value={form.departureTime} onChange={e => update("departureTime", e.target.value)} />
          </FormField>
          <FormField label="Arrival" error={errors.arrivalTime}>
            <input type="datetime-local" className={inputClass(errors.arrivalTime)} value={form.arrivalTime} onChange={e => update("arrivalTime", e.target.value)} />
          </FormField>
          <FormField label="Vehicle" error={errors.vehicleId}>
            <select className={inputClass(errors.vehicleId)} value={form.vehicleId} onChange={e => update("vehicleId", e.target.value)}>
              <option value="">Select vehicle (optional)</option>
              {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.registration} — {v.make} {v.model}</option>)}
            </select>
          </FormField>
          <FormField label="Driver" error={errors.driverId}>
            <select className={inputClass(errors.driverId)} value={form.driverId} onChange={e => update("driverId", e.target.value)}>
              <option value="">Select driver (optional)</option>
              {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName} — {d.employeeNumber}</option>)}
            </select>
          </FormField>
          <FormField label="Second Driver (optional)" error={errors.secondDriverId}>
            <select className={inputClass(errors.secondDriverId)} value={form.secondDriverId} onChange={e => update("secondDriverId", e.target.value)} disabled={!form.vehicleId || !form.driverId}>
              <option value="">No second driver</option>
              {availableSecondDrivers.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName} — {d.employeeNumber}</option>)}
            </select>
            <p className="mt-1 text-xs text-slate-500">Both drivers must be actively allocated to the same vehicle.</p>
          </FormField>
          <FormField label="Distance (km)" required error={errors.distance}>
            <input type="number" min="0.1" step="0.1" required className={inputClass(errors.distance)} value={form.distance} onChange={e => update("distance", e.target.value)} />
          </FormField>
          <FormField label="Status">
            <select className={inputClass()} value={form.status} onChange={e => update("status", e.target.value)}>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </FormField>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold">Cancel</button>
          <button disabled={saving} className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : "Save Trip"}</button>
        </div>
      </form>
    </Modal>
  );
}
