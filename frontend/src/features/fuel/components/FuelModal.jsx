import { useEffect, useState } from "react";
import FuelForm from "./FuelForm";
import vehicleService from "../../../services/vehicleService";

function FuelModal({
  isOpen,
  record,
  vehicles,
  onSave,
  onClose,
}) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  useEffect(() => {
    if (!isOpen) return;
    const id = record?.vehicleId;
    if (id) vehicleService.getVehicleById(id).then(setSelectedVehicle).catch(()=>setSelectedVehicle(null));
    else setSelectedVehicle(null);
  }, [isOpen, record]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-4xl rounded-xl bg-white shadow-xl">

        <div className="flex items-center justify-between border-b px-6 py-4">

          <h2 className="text-2xl font-bold">
            {record ? "Edit Fuel Record" : "Add Fuel Record"}
          </h2>

          <button
            onClick={onClose}
            className="text-3xl font-bold text-gray-500 hover:text-red-600"
          >
            ×
          </button>

        </div>

        <div className="p-6">
          {selectedVehicle?.fuelSummary?.kmPerLitre && selectedVehicle?.fuelSummary?.averageTripKm && <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900"><strong>Fuel planning:</strong> historical efficiency is {selectedVehicle.fuelSummary.kmPerLitre.toFixed(1)} km/L and average completed trip is {selectedVehicle.fuelSummary.averageTripKm.toFixed(0)} km. The litres entered above can be used to estimate range and approximate trips once the vehicle is selected.</div>}

          <FuelForm
            record={record}
            vehicles={vehicles}
            onSubmit={onSave}
            onCancel={onClose}
          />

        </div>

      </div>

    </div>
  );
}

export default FuelModal;