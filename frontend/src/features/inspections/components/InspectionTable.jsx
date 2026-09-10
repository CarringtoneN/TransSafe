import InspectionRow from "./InspectionRow";

function InspectionTable({
  inspections,
  onView,
  onEdit,
  onDelete,
}) {
  const total = inspections.length;

  const passed = inspections.filter(
    (inspection) => inspection.overallStatus === "PASS"
  ).length;

  const failed = inspections.filter(
    (inspection) => inspection.overallStatus === "FAIL"
  ).length;

  const passRate =
    total === 0
      ? 0
      : ((passed / total) * 100).toFixed(1);

  return (
    <div className="space-y-6">

      {/* Statistics Cards */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">
            Total Inspections
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-800">
            {total}
          </h2>
        </div>

        <div className="rounded-xl bg-green-50 p-5 shadow border border-green-200">
          <p className="text-sm text-green-700">
            Passed
          </p>

          <h2 className="mt-2 text-3xl font-bold text-green-700">
            {passed}
          </h2>
        </div>

        <div className="rounded-xl bg-red-50 p-5 shadow border border-red-200">
          <p className="text-sm text-red-700">
            Failed
          </p>

          <h2 className="mt-2 text-3xl font-bold text-red-700">
            {failed}
          </h2>
        </div>

        <div className="rounded-xl bg-blue-50 p-5 shadow border border-blue-200">
          <p className="text-sm text-blue-700">
            Pass Rate
          </p>

          <h2 className="mt-2 text-3xl font-bold text-blue-700">
            {passRate}%
          </h2>
        </div>

      </div>

      {/* Empty State */}

      {total === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center shadow">
          <h2 className="text-xl font-semibold text-slate-700">
            No inspections found
          </h2>

          <p className="mt-2 text-gray-500">
            Create your first vehicle inspection to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow">

          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="bg-slate-100">

                <tr>

                  <th className="px-4 py-3 text-left">
                    Vehicle
                  </th>

                  <th className="px-4 py-3 text-left">
                    Driver
                  </th>

                  <th className="px-4 py-3 text-left">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left">
                    Odometer
                  </th>

                  <th className="px-4 py-3 text-left">
                    Inspector
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

                {inspections.map((inspection) => (

                  <InspectionRow
                    key={inspection.id}
                    inspection={inspection}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />

                ))}

              </tbody>

            </table>

          </div>

        </div>
      )}

    </div>
  );
}

export default InspectionTable;