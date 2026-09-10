import ShiftForm from "./ShiftForm";

function ShiftModal({
  isOpen,
  shift,
  drivers,
  vehicles,
  onSave,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

      <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl">

        <h2 className="mb-6 text-2xl font-bold">
          {shift ? "Edit Shift" : "New Shift"}
        </h2>

        <ShiftForm
          shift={shift}
          drivers={drivers}
          vehicles={vehicles}
          onSubmit={onSave}
          onCancel={onClose}
        />

      </div>

    </div>
  );
}

export default ShiftModal;