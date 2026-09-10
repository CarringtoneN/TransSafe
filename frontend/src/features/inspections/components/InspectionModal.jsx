import InspectionForm from "./InspectionForm";

function InspectionModal({
  isOpen,
  inspection,
  vehicles,
  drivers,
  onSave,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold">

            {inspection
              ? "Edit Vehicle Inspection"
              : "New Vehicle Inspection"}

          </h2>

          <button
            onClick={onClose}
            className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Close
          </button>

        </div>

        <InspectionForm
          inspection={inspection}
          vehicles={vehicles}
          drivers={drivers}
          onSubmit={onSave}
        />

      </div>

    </div>
  );
}

export default InspectionModal;