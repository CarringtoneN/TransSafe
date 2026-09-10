import { useEffect, useState } from "react";

function AssetForm({
  asset,
  vehicles,
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    assetTag: "",
    name: "",
    category: "",
    serialNumber: "",
    purchaseDate: "",
    status: "ACTIVE",
    notes: "",
    assignedVehicleId: "",
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        assetTag: asset.assetTag || "",
        name: asset.name || "",
        category: asset.category || "",
        serialNumber: asset.serialNumber || "",
        purchaseDate: asset.purchaseDate
          ? asset.purchaseDate.substring(0, 10)
          : "",
        status: asset.status || "ACTIVE",
        notes: asset.notes || "",
        assignedVehicleId: asset.assignedVehicleId || "",
      });
    }
  }, [asset]);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(formData);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">

        <div>
          <label className="mb-1 block font-medium">
            Asset Tag
          </label>

          <input
            name="assetTag"
            value={formData.assetTag}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Name
          </label>

          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Category
          </label>

          <input
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Serial Number
          </label>

          <input
            name="serialNumber"
            value={formData.serialNumber}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Purchase Date
          </label>

          <input
            type="date"
            name="purchaseDate"
            value={formData.purchaseDate}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Status
          </label>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="mb-1 block font-medium">
            Assigned Vehicle
          </label>

          <select
            name="assignedVehicleId"
            value={formData.assignedVehicleId}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
          >
            <option value="">None</option>

            {vehicles.map((vehicle) => (
              <option
                key={vehicle.id}
                value={vehicle.id}
              >
                {vehicle.registration} - {vehicle.make} {vehicle.model}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="mb-1 block font-medium">
            Notes
          </label>

          <textarea
            rows={4}
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
          />
        </div>

      </div>

      <div className="flex justify-end gap-3">

        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-gray-500 px-5 py-2 text-white"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2 text-white"
        >
          {asset ? "Update Asset" : "Add Asset"}
        </button>

      </div>
    </form>
  );
}

export default AssetForm;