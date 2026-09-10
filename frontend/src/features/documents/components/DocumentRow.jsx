import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

function DocumentRow({
  document,
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
        {document.documentName}
      </td>

      <td className="px-6 py-4">
        {document.documentType}
      </td>

      <td className="px-6 py-4">
        {document.vehicle?.registration || "-"}
      </td>

      <td className="px-6 py-4">
        {document.expiryDate
          ? new Date(
              document.expiryDate
            ).toLocaleDateString()
          : "-"}
      </td>

      <td className="px-6 py-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            document.status === "VALID"
              ? "bg-green-100 text-green-700"
              : document.status === "EXPIRED"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {document.status}
        </span>
      </td>

      <td className="px-6 py-4">
        <div className="flex justify-center gap-2">

          <button
            onClick={() => onView(document)}
            className="rounded bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
          >
            <Eye size={18} />
          </button>

          <button
            onClick={() => onEdit(document)}
            className="rounded bg-green-100 p-2 text-green-600 hover:bg-green-200"
          >
            <Pencil size={18} />
          </button>

          <button
            onClick={() =>
              onDelete(document.id)
            }
            className="rounded bg-red-100 p-2 text-red-600 hover:bg-red-200"
          >
            <Trash2 size={18} />
          </button>

        </div>
      </td>
    </tr>
  );
}

export default DocumentRow;