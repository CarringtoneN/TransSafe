import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

function AssetRow({
  asset,
  index,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <tr
      className={
        index % 2 === 0
          ? "bg-white"
          : "bg-slate-50"
      }
    >
      <td className="px-6 py-4">
        {asset.assetTag}
      </td>

      <td className="px-6 py-4">
        {asset.name}
      </td>

      <td className="px-6 py-4">
        {asset.category}
      </td>

      <td className="px-6 py-4">
        {asset.status}
      </td>

      <td className="px-6 py-4">
        {asset.vehicle
          ? asset.vehicle.registration
          : "-"}
      </td>

      <td className="px-6 py-4">
        <div className="flex justify-center gap-3">

          <button
            onClick={() => onView(asset)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Eye size={18} />
          </button>

          <button
            onClick={() => onEdit(asset)}
            className="text-green-600 hover:text-green-800"
          >
            <Pencil size={18} />
          </button>

          <button
            onClick={() => onDelete(asset.id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={18} />
          </button>

        </div>
      </td>
    </tr>
  );
}

export default AssetRow;