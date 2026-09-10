import { useEffect, useState } from "react";

export default function DriverStartShiftModal({ open, vehicles, onSubmit, onClose, submitting = false }) {
  const [vehicleId, setVehicleId] = useState("");
  const [plannedEndTime, setPlannedEndTime] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setVehicleId(vehicles[0]?.vehicleId || vehicles[0]?.vehicle?.id || "");
    const end = new Date(Date.now() + 8 * 60 * 60 * 1000);
    end.setMinutes(end.getMinutes() - end.getTimezoneOffset());
    setPlannedEndTime(end.toISOString().slice(0, 16));
    setNotes("");
  }, [open, vehicles]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-bold">Start Shift</h2>
        <p className="mt-1 text-sm text-slate-500">Select the vehicle assigned to you for this shift.</p>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ vehicleId, plannedEndTime, notes }); }} className="mt-5 space-y-4">
          <label className="block text-sm font-medium">Assigned Vehicle
            <select required value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className="mt-1 w-full rounded-lg border p-3">
              <option value="">Select vehicle</option>
              {vehicles.map((item) => { const v = item.vehicle || item; return <option key={v.id} value={v.id}>{v.registration} — {v.make} {v.model}</option>; })}
            </select>
          </label>
          <label className="block text-sm font-medium">Planned End Time
            <input required type="datetime-local" value={plannedEndTime} onChange={(e) => setPlannedEndTime(e.target.value)} className="mt-1 w-full rounded-lg border p-3" />
          </label>
          <label className="block text-sm font-medium">Notes
            <textarea rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full rounded-lg border p-3" placeholder="Optional shift notes" />
          </label>
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2">Cancel</button>
            <button disabled={submitting || !vehicles.length} className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white disabled:opacity-60">{submitting ? "Starting..." : "Start Shift"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
