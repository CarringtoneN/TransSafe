import StatusBadge from "./StatusBadge";

function VehicleRow({ vehicle }) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-3">{vehicle.registration}</td>
      <td className="px-4 py-3">{vehicle.make}</td>
      <td className="px-4 py-3">{vehicle.model}</td>
      <td className="px-4 py-3">{vehicle.year}</td>
      <td className="px-4 py-3">
        <StatusBadge status={vehicle.status} />
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
            View
          </button>

          <button className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
            Edit
          </button>

          <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default VehicleRow;