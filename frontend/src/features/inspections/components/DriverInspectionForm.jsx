import { useState } from "react";

const checklist = [
  ["brakes", "Brakes"], ["tyres", "Tyres"], ["lights", "Lights"], ["engine", "Engine"],
  ["battery", "Battery"], ["oilLevel", "Oil Level"], ["coolant", "Coolant"], ["mirrors", "Mirrors"],
  ["windshield", "Windshield"], ["fireExtinguisher", "Fire Extinguisher"], ["firstAidKit", "First Aid Kit"],
];

const initial = Object.fromEntries(checklist.map(([key]) => [key, false]));

export default function DriverInspectionForm({ vehicles, onSubmit, onCancel, submitting = false }) {
  const [form, setForm] = useState({
    vehicleId: vehicles[0]?.vehicleId || vehicles[0]?.vehicle?.id || "",
    inspectionDate: new Date().toISOString().slice(0, 10),
    odometer: "",
    remarks: "",
    ...initial,
  });

  const set = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));
  const passed = checklist.every(([key]) => form[key]);

  function submit(e) {
    e.preventDefault();
    onSubmit({ ...form, overallStatus: passed ? "PASS" : "FAIL" });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Vehicle
          <select required value={form.vehicleId} onChange={(e) => set("vehicleId", e.target.value)} className="mt-1 w-full rounded-lg border p-3">
            <option value="">Select assigned vehicle</option>
            {vehicles.map((item) => {
              const vehicle = item.vehicle || item;
              return <option key={vehicle.id} value={vehicle.id}>{vehicle.registration} — {vehicle.make} {vehicle.model}</option>;
            })}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Inspection Date
          <input required type="date" value={form.inspectionDate} onChange={(e) => set("inspectionDate", e.target.value)} className="mt-1 w-full rounded-lg border p-3" />
        </label>
        <label className="text-sm font-medium text-slate-700 md:col-span-2">
          Odometer (km)
          <input required min="0" type="number" value={form.odometer} onChange={(e) => set("odometer", e.target.value)} className="mt-1 w-full rounded-lg border p-3" placeholder="e.g. 125430" />
        </label>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Pre-Trip Vehicle Checklist</h3><p className="mb-3 text-sm text-slate-500">Tick each item after physically checking it. The inspection only passes when every item is checked.</p>
        <div className="grid gap-3 md:grid-cols-2">
          {checklist.map(([key, label]) => (
            <label key={key} className={`flex items-center justify-between rounded-lg border p-3 ${form[key] ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
              <span>{label}</span>
              <input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)} className="h-5 w-5" />
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-3">
          <p className="text-sm font-medium text-slate-700">Overall Status</p>
          <p className={`mt-2 font-bold ${passed ? "text-green-700" : "text-red-700"}`}>{passed ? "PASS — All checklist items passed" : "FAIL — One or more checklist items require attention"}</p>
        </div>
        <label className="text-sm font-medium text-slate-700 md:col-span-2">
          Remarks
          <textarea rows="3" value={form.remarks} onChange={(e) => set("remarks", e.target.value)} className="mt-1 w-full rounded-lg border p-3" placeholder="Describe any defects or observations..." />
        </label>
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
        <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2">Cancel</button>
        <button disabled={submitting} className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white disabled:opacity-60">{submitting ? "Submitting..." : "Submit Inspection"}</button>
      </div>
    </form>
  );
}
