import { useEffect, useState } from "react";
import vehicleService from "../../../services/vehicleService";

function FuelForm({
  record,
  vehicles,
  onSubmit,
  onCancel,
}) {
  const [vehicleInsight, setVehicleInsight] = useState(null);
  const [formData, setFormData] = useState({
    vehicleId: "",
    fuelDate: "",
    litres: "",
    cost: "",
    odometer: "",
    station: "",
    receiptNo: "",
    notes: "",
  });

  useEffect(() => {
    if (record) {
      setFormData({
        vehicleId: record.vehicleId || "",
        fuelDate: record.fuelDate
          ? record.fuelDate.substring(0, 10)
          : "",
        litres: record.litres || "",
        cost: record.cost || "",
        odometer: record.odometer || "",
        station: record.station || "",
        receiptNo: record.receiptNo || "",
        notes: record.notes || "",
      });
    } else {
      setFormData({
        vehicleId: "",
        fuelDate: "",
        litres: "",
        cost: "",
        odometer: "",
        station: "",
        receiptNo: "",
        notes: "",
      });
    }
  }, [record]);

  useEffect(() => {
    if (!formData.vehicleId) { setVehicleInsight(null); return; }
    vehicleService.getVehicleById(formData.vehicleId).then(setVehicleInsight).catch(()=>setVehicleInsight(null));
  }, [formData.vehicleId]);

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
      className="space-y-5"
    >
      <div className="grid grid-cols-2 gap-4">

        <div className="col-span-2">
          <label className="mb-1 block font-medium">
            Vehicle
          </label>

          <select
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
            required
          >
            <option value="">Select Vehicle</option>

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

        <div>
          <label className="mb-1 block font-medium">
            Fuel Date
          </label>

          <input
            type="date"
            name="fuelDate"
            value={formData.fuelDate}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Fuel Station
          </label>

          <input
            name="station"
            value={formData.station}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Litres
          </label>

          <input
            type="number"
            step="0.01"
            name="litres"
            value={formData.litres}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Cost
          </label>

          <input
            type="number"
            step="0.01"
            name="cost"
            value={formData.cost}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Odometer
          </label>

          <input
            type="number"
            step="0.1"
            name="odometer"
            value={formData.odometer}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Receipt Number
          </label>

          <input
            name="receiptNo"
            value={formData.receiptNo}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
          />
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

      {vehicleInsight?.fuelSummary?.kmPerLitre && vehicleInsight?.fuelSummary?.averageTripKm && Number(formData.litres) > 0 && <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"><strong>Estimated trip coverage:</strong> {Number(formData.litres).toFixed(1)} litres × {vehicleInsight.fuelSummary.kmPerLitre.toFixed(1)} km/L ≈ {(Number(formData.litres)*vehicleInsight.fuelSummary.kmPerLitre).toFixed(0)} km, or approximately {(Number(formData.litres)*vehicleInsight.fuelSummary.kmPerLitre/vehicleInsight.fuelSummary.averageTripKm).toFixed(1)} average trips.</div>}

      <div className="flex justify-end gap-3">

        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-gray-500 px-5 py-2 text-white hover:bg-gray-600"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          {record ? "Update Fuel Record" : "Add Fuel Record"}
        </button>

      </div>
    </form>
  );
}

export default FuelForm;