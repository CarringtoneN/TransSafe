import ShiftRow from "./ShiftRow";

function ShiftTable({
  shifts,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow">

      <table className="w-full">

        <thead className="bg-slate-100">

          <tr>

            <th className="px-4 py-3 text-left">
              Driver
            </th>

            <th className="px-4 py-3 text-left">
              Vehicle
            </th>

            <th className="px-4 py-3 text-left">
              Date
            </th>

            <th className="px-4 py-3 text-left">
              Start
            </th>

            <th className="px-4 py-3 text-left">
              End
            </th>

            <th className="px-4 py-3 text-left">
              Hours
            </th>

            <th className="px-4 py-3 text-left">
              Status
            </th>

            <th className="px-4 py-3 text-center">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {shifts.length === 0 ? (
            <tr>

              <td
                colSpan={8}
                className="py-8 text-center text-gray-500"
              >
                No shifts found.
              </td>

            </tr>
          ) : (
            shifts.map((shift) => (
              <ShiftRow
                key={shift.id}
                shift={shift}
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

export default ShiftTable;