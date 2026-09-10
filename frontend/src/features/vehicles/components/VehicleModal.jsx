function VehicleModal({
  isOpen,
  title,
  children,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl">

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-3xl font-bold text-gray-500 hover:text-red-600"
        >
          ×
        </button>

        <div className="border-b px-6 py-4">
          <h2 className="text-2xl font-bold">
            {title}
          </h2>
        </div>

        <div className="p-6">
          {children}
        </div>

      </div>
    </div>
  );
}

export default VehicleModal;