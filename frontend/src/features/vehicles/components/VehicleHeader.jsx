import { Plus } from "lucide-react";

function VehicleHeader({ onAddVehicle }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Vehicles</h1>
        <p className="mt-2 text-slate-500">
          Manage vehicles, availability and fleet status.
        </p>
      </div>

      <button
        type="button"
        onClick={onAddVehicle}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
      >
        <Plus size={18} />
        Add Vehicle
      </button>
    </div>
  );
}

export default VehicleHeader;
