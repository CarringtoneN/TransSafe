function ViewFuelModal({
  isOpen,
  record,
  onClose,
}) {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">

        <div className="flex items-center justify-between border-b px-6 py-4">

          <h2 className="text-2xl font-bold">
            Fuel Record Details
          </h2>

          <button
            onClick={onClose}
            className="text-3xl font-bold text-gray-500 hover:text-red-600"
          >
            ×
          </button>

        </div>

        <div className="space-y-4 p-6">

          <div>
            <strong>Vehicle:</strong>{" "}
            {record.vehicle?.registration}
          </div>

          <div>
            <strong>Date:</strong>{" "}
            {new Date(record.fuelDate).toLocaleDateString()}
          </div>

          <div>
            <strong>Fuel Station:</strong>{" "}
            {record.station}
          </div>

          <div>
            <strong>Litres:</strong>{" "}
            {record.litres}
          </div>

          <div>
            <strong>Cost:</strong>{" "}
            {record.cost}
          </div>

          <div>
            <strong>Odometer:</strong>{" "}
            {record.odometer}
          </div>

          <div>
            <strong>Receipt Number:</strong>{" "}
            {record.receiptNo || "-"}
          </div>

          <div>
            <strong>Notes:</strong>
            <p className="mt-2 rounded-lg bg-slate-100 p-3">
              {record.notes || "No notes"}
            </p>
          </div>

        </div>

        <div className="border-t px-6 py-4 text-right">

          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}

export default ViewFuelModal;