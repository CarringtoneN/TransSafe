import { Eye, Pencil, Trash2 } from "lucide-react";
import StatusBadge from "./StatusBadge";

function VehicleRow({ vehicle, onView, onEdit, onDelete }) {
  return (
    <tr className="border-t border-slate-200 transition hover:bg-slate-50">
      <td className="px-4 py-3 font-semibold text-slate-800">
        {vehicle.registration || "—"}
      </td>
      <td className="px-4 py-3 text-slate-700">{vehicle.make || "—"}</td>
      <td className="px-4 py-3 text-slate-700">{vehicle.model || "—"}</td>
      <td className="px-4 py-3 text-slate-700">{vehicle.year || "—"}</td>
      <td className="px-4 py-3">
        <StatusBadge status={vehicle.status} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            title="View vehicle"
            aria-label={`View ${vehicle.registration || "vehicle"}`}
            onClick={() => onView(vehicle)}
            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
          >
            <Eye size={17} />
          </button>

          <button
            type="button"
            title="Edit vehicle"
            aria-label={`Edit ${vehicle.registration || "vehicle"}`}
            onClick={() => onEdit(vehicle)}
            className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
          >
            <Pencil size={17} />
          </button>

          <button
            type="button"
            title="Delete vehicle"
            aria-label={`Delete ${vehicle.registration || "vehicle"}`}
            onClick={() => onDelete(vehicle.id)}
            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default VehicleRow;
