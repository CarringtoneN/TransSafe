import VehicleRow from "./VehicleRow";

function VehicleTable({ vehicles, loading = false, onView, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            {[
              "Registration",
              "Make",
              "Model",
              "Year",
              "Status",
              "Actions",
            ].map((heading) => (
              <th
                key={heading}
                className={`px-4 py-3 font-semibold text-slate-700 ${
                  heading === "Actions" ? "text-center" : "text-left"
                }`}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="p-10 text-center text-slate-500">
                Loading vehicles...
              </td>
            </tr>
          ) : vehicles.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-10 text-center text-slate-500">
                No vehicles found.
              </td>
            </tr>
          ) : (
            vehicles.map((vehicle) => (
              <VehicleRow
                key={vehicle.id}
                vehicle={vehicle}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default VehicleTable;
