import AssignmentRow from "./AssignmentRow";

function AssignmentTable({
  assignments,
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
              Driver
            </th>

            <th className="px-6 py-4 text-left">
              Vehicle
            </th>

            <th className="px-6 py-4 text-left">
              Assigned Date
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

          {assignments.length === 0 ? (

            <tr>

              <td
                colSpan={5}
                className="py-10 text-center text-gray-500"
              >
                No assignments found.
              </td>

            </tr>

          ) : (

            assignments.map((assignment,index)=>(
              <AssignmentRow
                key={assignment.id}
                assignment={assignment}
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

export default AssignmentTable;