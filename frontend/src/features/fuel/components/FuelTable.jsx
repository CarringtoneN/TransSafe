import FuelRow from "./FuelRow";

function FuelTable({
  records,
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
              Vehicle
            </th>

            <th className="px-6 py-4 text-left">
              Date
            </th>

            <th className="px-6 py-4 text-left">
              Litres
            </th>

            <th className="px-6 py-4 text-left">
              Cost
            </th>

            <th className="px-6 py-4 text-left">
              Odometer
            </th>

            <th className="px-6 py-4 text-left">
              Station
            </th>

            <th className="px-6 py-4 text-center">
              Actions
            </th>

          </tr>
        </thead>

        <tbody>

          {records.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="py-10 text-center"
              >
                No fuel records found.
              </td>
            </tr>
          ) : (
            records.map((record, index) => (
              <FuelRow
                key={record.id}
                record={record}
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

export default FuelTable;