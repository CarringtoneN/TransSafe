import { useEffect, useState } from "react";

function VehicleForm({ vehicle, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    registration: "",
    make: "",
    model: "",
    year: "",
    status: "ACTIVE",
    vin: "",
    colour: "",
    fuelType: "",
    bodyType: "",
    carryingCapacity: "",
    currentMileage: "",
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        registration: vehicle.registration || "",
        make: vehicle.make || "",
        model: vehicle.model || "",
        year: vehicle.year || "",
        status: vehicle.status || "ACTIVE",
        vin: vehicle.vin || "",
        colour: vehicle.colour || "",
        fuelType: vehicle.fuelType || "",
        bodyType: vehicle.bodyType || "",
        carryingCapacity: vehicle.carryingCapacity ?? "",
        currentMileage: vehicle.currentMileage ?? "",
      });
    }
  }, [vehicle]);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: ["year","carryingCapacity","currentMileage"].includes(name) ? (value === "" ? "" : Number(value)) : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <input
        name="registration"
        value={formData.registration}
        onChange={handleChange}
        placeholder="Registration"
        className="w-full rounded border p-2"
        required
      />

      <input
        name="make"
        value={formData.make}
        onChange={handleChange}
        placeholder="Make"
        className="w-full rounded border p-2"
        required
      />

      <input
        name="model"
        value={formData.model}
        onChange={handleChange}
        placeholder="Model"
        className="w-full rounded border p-2"
        required
      />

      <input
        type="number"
        name="year"
        value={formData.year}
        onChange={handleChange}
        placeholder="Year"
        className="w-full rounded border p-2"
        required
      />

      <input
        name="vin"
        value={formData.vin}
        onChange={handleChange}
        placeholder="VIN"
        className="w-full rounded border p-2"
      />

      <input
        name="colour"
        value={formData.colour}
        onChange={handleChange}
        placeholder="Colour"
        className="w-full rounded border p-2"
      />

      <label className="block text-sm font-medium text-slate-700">Body Type
      <select name="bodyType" value={formData.bodyType} onChange={handleChange} className="mt-1 w-full rounded border p-2">
        <option value="">Select body type</option><option>Bus</option><option>Mini-bus</option><option>Lorry</option><option>Pick-up</option><option>SUV</option><option>Sedan</option>
      </select></label>

<input type="number" min="0" name="carryingCapacity" value={formData.carryingCapacity} onChange={handleChange} placeholder="Carrying Capacity (passengers)" className="w-full rounded border p-2"/>

      <input type="number" min="0" step="0.1" name="currentMileage" value={formData.currentMileage} onChange={handleChange} placeholder="Current Mileage (km)" className="w-full rounded border p-2" required/>

      <input
        name="fuelType"
        value={formData.fuelType}
        onChange={handleChange}
        placeholder="Fuel Type"
        className="w-full rounded border p-2"
      />

      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="w-full rounded border p-2"
      >
        <option value="ACTIVE">ACTIVE</option>
        <option value="MAINTENANCE">MAINTENANCE</option>
        <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
      </select>

      <div className="flex justify-end gap-3">

        <button
          type="button"
          onClick={onCancel}
          className="rounded bg-gray-500 px-4 py-2 text-white"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded bg-green-600 px-4 py-2 text-white"
        >
          {vehicle ? "Update Vehicle" : "Add Vehicle"}
        </button>

      </div>

    </form>
  );
}

export default VehicleForm;