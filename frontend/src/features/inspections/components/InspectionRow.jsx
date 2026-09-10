import {
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";

function InspectionRow({
  inspection,
  onView,
  onEdit,
  onDelete,
}) {
  const inspectionDate = inspection.inspectionDate
    ? new Date(inspection.inspectionDate).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "-";

  return (
    <tr className="border-b transition-colors hover:bg-slate-50">

      <td className="px-4 py-4 font-medium text-slate-700">
        {inspection.vehicle?.registration || "-"}
      </td>

      <td className="px-4 py-4">
        {inspection.driver
          ? `${inspection.driver.firstName} ${inspection.driver.lastName}`
          : "-"}
      </td>

      <td className="px-4 py-4">
        {inspectionDate}
      </td>

      <td className="px-4 py-4">
        {inspection.odometer
          ? `${Number(inspection.odometer).toLocaleString()} km`
          : "-"}
      </td>

      <td className="px-4 py-4">
        {inspection.inspectorName}
      </td>

      <td className="px-4 py-4">

        {inspection.overallStatus === "PASS" ? (

          <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
            <CheckCircle size={16} />
            PASS
          </span>

        ) : (

          <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
            <XCircle size={16} />
            FAIL
          </span>

        )}

      </td>

      <td className="px-4 py-4">

        <div className="flex justify-center gap-2">

          <button
            title="View Inspection"
            onClick={() => onView(inspection)}
            className="rounded-lg bg-blue-100 p-2 text-blue-700 transition hover:scale-105 hover:bg-blue-200"
          >
            <Eye size={18} />
          </button>

          <button
            title="Edit Inspection"
            onClick={() => onEdit(inspection)}
            className="rounded-lg bg-yellow-100 p-2 text-yellow-700 transition hover:scale-105 hover:bg-yellow-200"
          >
            <Pencil size={18} />
          </button>

          <button
            title="Delete Inspection"
            onClick={() => onDelete(inspection.id)}
            className="rounded-lg bg-red-100 p-2 text-red-700 transition hover:scale-105 hover:bg-red-200"
          >
            <Trash2 size={18} />
          </button>

        </div>

      </td>

    </tr>
  );
}

export default InspectionRow;