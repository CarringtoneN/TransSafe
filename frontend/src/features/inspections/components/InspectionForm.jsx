import { useEffect, useState } from "react";

const defaultForm = {
  vehicleId: "",
  driverId: "",
  inspectionDate: new Date().toISOString().substring(0, 10),
  odometer: "",
  inspectorName: "",
  overallStatus: "PASS",

  brakes: true,
  tyres: true,
  lights: true,
  engine: true,
  battery: true,
  oilLevel: true,
  coolant: true,
  mirrors: true,
  windshield: true,
  fireExtinguisher: true,
  firstAidKit: true,

  remarks: "",
};

const checklistItems = [
  { key: "brakes", label: "Brakes" },
  { key: "tyres", label: "Tyres" },
  { key: "lights", label: "Lights" },
  { key: "engine", label: "Engine" },
  { key: "battery", label: "Battery" },
  { key: "oilLevel", label: "Oil Level" },
  { key: "coolant", label: "Coolant" },
  { key: "mirrors", label: "Mirrors" },
  { key: "windshield", label: "Windshield" },
  { key: "fireExtinguisher", label: "Fire Extinguisher" },
  { key: "firstAidKit", label: "First Aid Kit" },
];

function InspectionForm({
  inspection,
  vehicles,
  drivers,
  onSubmit,
}) {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (inspection) {
      setForm({
        ...inspection,
        inspectionDate: inspection.inspectionDate.substring(0, 10),
      });
    } else {
      setForm(defaultForm);
    }
  }, [inspection]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };
      if (name === "vehicleId") {
        const v = vehicles.find(x => Number(x.id) === Number(value));
        const eligible = (v?.assignment || []).filter(a => a.status === "ACTIVE" && !a.unassignedAt);
        const stillEligible = eligible.some(a => Number(a.driverId) === Number(f.driverId));
        next.driverId = stillEligible ? String(f.driverId) : (eligible.length ? String(eligible[0].driverId) : "");
      }
      return next;
    });
  }

  const eligibleDrivers = (() => {
    const selected = vehicles.find(v => Number(v.id) === Number(form.vehicleId));
    const ids = new Set((selected?.assignment || []).filter(a => a.status === "ACTIVE" && !a.unassignedAt).map(a => Number(a.driverId)));
    return form.vehicleId ? drivers.filter(d => ids.has(Number(d.id))) : drivers;
  })();

  function submit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={submit} className="space-y-8">

      {/* Basic Information */}

      <div>

        <h3 className="mb-4 text-xl font-semibold text-slate-800">
          Inspection Information
        </h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <div>

            <label className="mb-2 block font-medium text-slate-700">
              Vehicle
            </label>

            <select
              required
              name="vehicleId"
              value={form.vehicleId}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            >
              <option value="">
                Select Vehicle
              </option>

              {vehicles.map((vehicle) => (
                <option
                  key={vehicle.id}
                  value={vehicle.id}
                >
                  {vehicle.registration}
                </option>
              ))}

            </select>

          </div>

          <div>

            <label className="mb-2 block font-medium text-slate-700">
              Driver
            </label>

            <select
              name="driverId"
              value={form.driverId ?? ""}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            >
              <option value="">
                None
              </option>

              {eligibleDrivers.map((driver) => (
                <option
                  key={driver.id}
                  value={driver.id}
                >
                  {driver.firstName} {driver.lastName}
                </option>
              ))}

            </select>

          </div>

          <div>

            <label className="mb-2 block font-medium text-slate-700">
              Inspection Date
            </label>

            <input
              required
              type="date"
              name="inspectionDate"
              value={form.inspectionDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />

          </div>

          <div>

            <label className="mb-2 block font-medium text-slate-700">
              Odometer (km)
            </label>

            <input
              required
              type="number"
              name="odometer"
              value={form.odometer}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />

          </div>

          <div>

            <label className="mb-2 block font-medium text-slate-700">
              Inspector Name
            </label>

            <input
              required
              name="inspectorName"
              value={form.inspectorName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />

          </div>

          <div>

            <label className="mb-2 block font-medium text-slate-700">
              Overall Status
            </label>

            <select
              name="overallStatus"
              value={form.overallStatus}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            >
              <option value="PASS">
                PASS
              </option>

              <option value="FAIL">
                FAIL
              </option>

            </select>

          </div>

        </div>

      </div>

      {/* Checklist */}

      <div>

        <h3 className="mb-4 text-xl font-semibold text-slate-800">
          Vehicle Checklist
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {checklistItems.map((item) => (

            <label
              key={item.key}
              className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                form[item.key]
                  ? "border-green-300 bg-green-50"
                  : "border-red-300 bg-red-50"
              }`}
            >

              <span className="font-medium text-slate-700">
                {item.label}
              </span>

              <input
                type="checkbox"
                name={item.key}
                checked={form[item.key]}
                onChange={handleChange}
                className="h-5 w-5 accent-green-600"
              />

            </label>

          ))}

        </div>

      </div>

      {/* Remarks */}

      <div>

        <label className="mb-2 block text-lg font-semibold text-slate-800">
          Remarks
        </label>

        <textarea
          rows={5}
          name="remarks"
          value={form.remarks ?? ""}
          onChange={handleChange}
          placeholder="Enter any observations..."
          className="w-full rounded-xl border border-gray-300 p-4 focus:border-blue-500 focus:outline-none"
        />

      </div>

      <div className="flex justify-end">

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          Save Inspection
        </button>

      </div>

    </form>
  );
}

export default InspectionForm;