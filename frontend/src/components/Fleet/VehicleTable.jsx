import vehicles from "../../data/vehicles";
import VehicleRow from "./VehicleRow";

function VehicleTable() {
  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-4 py-3">Registration</th>
            <th className="text-left px-4 py-3">Make</th>
            <th className="text-left px-4 py-3">Model</th>
            <th className="text-left px-4 py-3">Year</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-left px-4 py-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {vehicles.map((vehicle) => (
            <VehicleRow
              key={vehicle.id}
              vehicle={vehicle}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default VehicleTable;