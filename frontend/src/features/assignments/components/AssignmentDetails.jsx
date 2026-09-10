function AssignmentDetails({
  open,
  assignment,
  onClose,
}) {
  if (!open || !assignment) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

      <div className="bg-white rounded-lg p-6 w-full max-w-lg">

        <div className="flex justify-between mb-5">

          <h2 className="text-xl font-bold">
            Assignment Details
          </h2>

          <button onClick={onClose}>
            ✕
          </button>

        </div>

        <div className="space-y-3">

          <p>
            <strong>Driver:</strong>{" "}
            {assignment.driver
              ? `${assignment.driver.firstName} ${assignment.driver.lastName}`
              : "-"}
          </p>

          <p>
            <strong>Vehicle:</strong>{" "}
            {assignment.vehicle?.registration}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {assignment.status}
          </p>

          <p>
            <strong>Start:</strong>{" "}
            {assignment.startDate
              ? new Date(
                  assignment.startDate
                ).toLocaleDateString()
              : "-"}
          </p>

          <p>
            <strong>End:</strong>{" "}
            {assignment.endDate
              ? new Date(
                  assignment.endDate
                ).toLocaleDateString()
              : "-"}
          </p>

          <p>
            <strong>Notes:</strong>{" "}
            {assignment.notes || "-"}
          </p>

        </div>

      </div>

    </div>
  );
}

export default AssignmentDetails;