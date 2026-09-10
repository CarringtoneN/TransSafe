import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

function ShiftRow({
  shift,
  onView,
  onEdit,
  onDelete,
}) {
  function badge(status) {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  }

  return (
    <tr className="border-b hover:bg-slate-50">

      <td className="px-4 py-3">
        {shift.driver.firstName}{" "}
        {shift.driver.lastName}
      </td>

      <td className="px-4 py-3">
        {shift.vehicle.registration}
      </td>

      <td className="px-4 py-3">
        {new Date(
          shift.shiftDate
        ).toLocaleDateString()}
      </td>

      <td className="px-4 py-3">
        {new Date(
          shift.startTime
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>

      <td className="px-4 py-3">
        {new Date(
          shift.endTime
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>

      <td className="px-4 py-3">
        {shift.totalHours}
      </td>

      <td className="px-4 py-3">

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${badge(
            shift.status
          )}`}
        >
          {shift.status}
        </span>

      </td>

      <td className="px-4 py-3">

        <div className="flex gap-2">

          <button
            onClick={() => onView(shift)}
            className="rounded bg-slate-100 p-2 hover:bg-slate-200"
          >
            <Eye size={17} />
          </button>

          <button
            onClick={() => onEdit(shift)}
            className="rounded bg-blue-100 p-2 hover:bg-blue-200"
          >
            <Pencil size={17} />
          </button>

          <button
            onClick={() => onDelete(shift.id)}
            className="rounded bg-red-100 p-2 hover:bg-red-200"
          >
            <Trash2 size={17} />
          </button>

        </div>

      </td>

    </tr>
  );
}

export default ShiftRow;