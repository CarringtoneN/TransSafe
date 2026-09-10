function ViewDriverModal({
  isOpen,
  driver,
  onClose,
}) {
  if (!isOpen || !driver) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">

        <div className="flex items-center justify-between border-b px-6 py-4">

          <h2 className="text-2xl font-bold">
            Driver Details
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
              Employee Number
            </p>

            <p className="font-semibold">
              {driver.employeeNumber}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Full Name
            </p>

            <p className="font-semibold">
              {driver.firstName} {driver.lastName}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Email
            </p>

            <p className="font-semibold">
              {driver.email || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Phone
            </p>

            <p className="font-semibold">
              {driver.phone || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              License Number
            </p>

            <p className="font-semibold">
              {driver.licenseNumber}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              License Expiry
            </p>

            <p className="font-semibold">
              {driver.licenseExpiry
                ? new Date(
                    driver.licenseExpiry
                  ).toLocaleDateString()
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Status
            </p>

            <p className="font-semibold">
              {driver.status}
            </p>
          </div>

        </div>

        <div className="flex justify-end border-t px-6 py-4">

          <button
            onClick={onClose}
            className="rounded-lg bg-slate-700 px-5 py-2 text-white hover:bg-slate-800"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}

export default ViewDriverModal;