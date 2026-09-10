import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

function DriverRow({
  driver,
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
        {driver.employeeNumber}
      </td>

      <td className="px-6 py-4">
        {driver.firstName} {driver.lastName}
      </td>

      <td className="px-6 py-4">
        {driver.licenseNumber}
      </td>

      <td className="px-6 py-4">
        {driver.phone || "-"}
      </td>

      <td className="px-6 py-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            driver.status === "ACTIVE"
              ? "bg-green-100 text-green-700"
              : driver.status === "SUSPENDED"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {driver.status}
        </span>
      </td>

      <td className="px-6 py-4">
        <div className="flex justify-center gap-2">

          <button
            onClick={() => onView(driver)}
            className="rounded bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
          >
            <Eye size={18} />
          </button>

          <button
            onClick={() => onEdit(driver)}
            className="rounded bg-green-100 p-2 text-green-600 hover:bg-green-200"
          >
            <Pencil size={18} />
          </button>

          <button
            onClick={() => onDelete(driver.id)}
            className="rounded bg-red-100 p-2 text-red-600 hover:bg-red-200"
          >
            <Trash2 size={18} />
          </button>

        </div>
      </td>
    </tr>
  );
}

export default DriverRow;