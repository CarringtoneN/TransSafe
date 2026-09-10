import DocumentForm from "./DocumentForm";

function DocumentModal({
  isOpen,
  document,
  vehicles,
  onSave,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-4xl rounded-xl bg-white shadow-xl">

        <div className="flex items-center justify-between border-b px-6 py-4">

          <h2 className="text-2xl font-bold">
            {document ? "Edit Document" : "Add Document"}
          </h2>

          <button
            onClick={onClose}
            className="text-3xl font-bold text-gray-500 hover:text-red-600"
          >
            ×
          </button>

        </div>

        <div className="p-6">

          <DocumentForm
            document={document}
            vehicles={vehicles}
            onSubmit={onSave}
            onCancel={onClose}
          />

        </div>

      </div>

    </div>
  );
}

export default DocumentModal;