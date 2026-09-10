function ViewAssignmentModal({
  isOpen,
  assignment,
  onClose,
}) {
  if (!isOpen || !assignment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">

        <div className="flex items-center justify-between border-b px-6 py-4">

          <h2 className="text-2xl font-bold">
            Assignment Details
          </h2>

          <button
            onClick={onClose}
            className="text-3xl font-bold text-gray-500 hover:text-red-600"
          >
            ×
          </button>

        </div>

        <div className="grid grid-cols-2 gap-6 p-6">

          <div>
            <p className="text-sm text-gray-500">
              Driver
            </p>

            <p className="font-semibold">
              {assignment.driver.firstName}{" "}
              {assignment.driver.lastName}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Vehicle
            </p>

            <p className="font-semibold">
              {assignment.vehicle.registration}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Assigned Date
            </p>

            <p className="font-semibold">
              {new Date(
                assignment.assignedAt
              ).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Status
            </p>

            <p className="font-semibold">
              {assignment.status}
            </p>
          </div>

          <div className="col-span-2">

            <p className="text-sm text-gray-500">
              Notes
            </p>

            <p className="font-semibold">
              {assignment.notes || "-"}
            </p>

          </div>

        </div>

        <div className="flex justify-end border-t px-6 py-4">

          <button
            onClick={onClose}
            className="rounded-lg bg-slate-700 px-5 py-2 text-white"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}

export default ViewAssignmentModal;