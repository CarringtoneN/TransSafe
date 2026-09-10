function ViewDocumentModal({
  isOpen,
  document,
  onClose,
}) {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">

        <div className="flex items-center justify-between border-b px-6 py-4">

          <h2 className="text-2xl font-bold">
            Document Details
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
              Document Name
            </p>

            <p className="font-semibold">
              {document.documentName}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Type
            </p>

            <p className="font-semibold">
              {document.documentType}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Vehicle
            </p>

            <p className="font-semibold">
              {document.vehicle?.registration ||
                "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Status
            </p>

            <p className="font-semibold">
              {document.status}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Issue Date
            </p>

            <p className="font-semibold">
              {document.issueDate
                ? new Date(
                    document.issueDate
                  ).toLocaleDateString()
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Expiry Date
            </p>

            <p className="font-semibold">
              {document.expiryDate
                ? new Date(
                    document.expiryDate
                  ).toLocaleDateString()
                : "-"}
            </p>
          </div>

          <div className="col-span-2">
            <p className="text-sm text-gray-500">
              File Path
            </p>

            <p className="font-semibold break-all">
              {document.filePath || "-"}
            </p>
          </div>

          <div className="col-span-2">
            <p className="text-sm text-gray-500">
              Notes
            </p>

            <p className="font-semibold whitespace-pre-wrap">
              {document.notes || "-"}
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

export default ViewDocumentModal;