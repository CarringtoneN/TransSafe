function ViewShiftModal({
  isOpen,
  shift,
  onClose,
}) {
  if (!isOpen || !shift) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">

        <h2 className="mb-6 text-2xl font-bold">
          Shift Details
        </h2>

        <div className="space-y-3">

          <p>
            <strong>Driver:</strong>{" "}
            {shift.driver.firstName} {shift.driver.lastName}
          </p>

          <p>
            <strong>Vehicle:</strong>{" "}
            {shift.vehicle.registration}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            {new Date(
              shift.shiftDate
            ).toLocaleDateString()}
          </p>

          <p>
            <strong>Start:</strong>{" "}
            {new Date(
              shift.startTime
            ).toLocaleString()}
          </p>

          <p>
            <strong>End:</strong>{" "}
            {new Date(
              shift.endTime
            ).toLocaleString()}
          </p>

          <p>
            <strong>Total Hours:</strong>{" "}
            {shift.totalHours}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {shift.status}
          </p>

          <p>
            <strong>Notes:</strong>{" "}
            {shift.notes || "-"}
          </p>

        </div>

        <div className="mt-6 flex justify-end">

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

export default ViewShiftModal;