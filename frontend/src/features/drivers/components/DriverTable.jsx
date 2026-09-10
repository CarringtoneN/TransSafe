import DriverRow from "./DriverRow";

function DriverTable({
  drivers,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow">

      <table className="min-w-full">

        <thead className="bg-slate-100">

          <tr>

            <th className="px-6 py-4 text-left">
              Employee No.
            </th>

            <th className="px-6 py-4 text-left">
              Driver
            </th>

            <th className="px-6 py-4 text-left">
              License
            </th>

            <th className="px-6 py-4 text-left">
              Phone
            </th>

            <th className="px-6 py-4 text-left">
              Status
            </th>

            <th className="px-6 py-4 text-center">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {drivers.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="py-10 text-center text-gray-500"
              >
                No drivers found.
              </td>
            </tr>
          ) : (
            drivers.map((driver, index) => (
              <DriverRow
                key={driver.id}
                driver={driver}
                index={index}
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

export default DriverTable;