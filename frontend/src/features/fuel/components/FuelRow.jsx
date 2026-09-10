import { Eye, Pencil, Trash2 } from "lucide-react";

function FuelRow({
  record,
  index,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <tr
      className={`border-t ${
        index % 2 === 0 ? "bg-white" : "bg-slate-50"
      } hover:bg-blue-50`}
    >
      <td className="px-6 py-4">
        {record.vehicle?.registration}
      </td>

      <td className="px-6 py-4">
        {new Date(record.fuelDate).toLocaleDateString()}
      </td>

      <td className="px-6 py-4">
        {record.litres}
      </td>

      <td className="px-6 py-4">
        {record.cost}
      </td>

      <td className="px-6 py-4">
        {record.odometer}
      </td>

      <td className="px-6 py-4">
        {record.station}
      </td>

      <td className="px-6 py-4 text-center">
        <div className="flex justify-center gap-3">

          <button
            onClick={() => onView(record)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Eye size={18} />
          </button>

          <button
            onClick={() => onEdit(record)}
            className="text-green-600 hover:text-green-800"
          >
            <Pencil size={18} />
          </button>

          <button
            onClick={() => onDelete(record.id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={18} />
          </button>

        </div>
      </td>
    </tr>
  );
}

export default FuelRow;