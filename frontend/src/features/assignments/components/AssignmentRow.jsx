import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

function AssignmentRow({
  assignment,
  index,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <tr
      className={`border-b ${
        index % 2 === 0
          ? "bg-white"
          : "bg-slate-50"
      }`}
    >
      <td className="px-6 py-4">
        {assignment.driver.firstName}{" "}
        {assignment.driver.lastName}
      </td>

      <td className="px-6 py-4">
        {assignment.vehicle.registration}
      </td>

      <td className="px-6 py-4">
        {new Date(
          assignment.assignedAt
        ).toLocaleDateString()}
      </td>

      <td className="px-6 py-4">

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            assignment.status === "ACTIVE"
              ? "bg-green-100 text-green-700"
              : assignment.status === "COMPLETED"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {assignment.status}
        </span>

      </td>

      <td className="px-6 py-4">

        <div className="flex justify-center gap-2">

          <button
            onClick={() => onView(assignment)}
            className="rounded bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
          >
            <Eye size={18}/>
          </button>

          <button
            onClick={() => onEdit(assignment)}
            className="rounded bg-green-100 p-2 text-green-600 hover:bg-green-200"
          >
            <Pencil size={18}/>
          </button>

          <button
            onClick={() => onDelete(assignment.id)}
            className="rounded bg-red-100 p-2 text-red-600 hover:bg-red-200"
          >
            <Trash2 size={18}/>
          </button>

        </div>

      </td>

    </tr>
  );
}

export default AssignmentRow;