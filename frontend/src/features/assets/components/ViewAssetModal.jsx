function ViewAssetModal({
  isOpen,
  asset,
  onClose,
}) {
  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">

        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-2xl font-bold">
            Asset Details
          </h2>

          <button
            onClick={onClose}
            className="text-2xl font-bold text-gray-500 hover:text-red-600"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 p-6">

          <div>
            <p className="text-sm text-gray-500">
              Asset Tag
            </p>
            <p className="font-semibold">
              {asset.assetTag}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Name
            </p>
            <p className="font-semibold">
              {asset.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Category
            </p>
            <p className="font-semibold">
              {asset.category}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Serial Number
            </p>
            <p className="font-semibold">
              {asset.serialNumber || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Status
            </p>
            <p className="font-semibold">
              {asset.status}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Assigned Vehicle
            </p>

            <p className="font-semibold">
              {asset.vehicle
                ? asset.vehicle.registration
                : "-"}
            </p>
          </div>

          <div className="col-span-2">
            <p className="text-sm text-gray-500">
              Notes
            </p>

            <p className="font-semibold">
              {asset.notes || "-"}
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

export default ViewAssetModal;