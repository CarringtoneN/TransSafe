import DriverInspectionForm from "./DriverInspectionForm";

export default function DriverInspectionModal({ open, vehicles, onSubmit, onClose, submitting }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div><h2 className="text-2xl font-bold">Pre-Trip Vehicle Inspection</h2><p className="text-sm text-slate-500">Complete the pre-drive safety inspection before operating the vehicle.</p></div>
          <button onClick={onClose} className="rounded-lg border px-3 py-2">Close</button>
        </div>
        <DriverInspectionForm vehicles={vehicles} onSubmit={onSubmit} onCancel={onClose} submitting={submitting} />
      </div>
    </div>
  );
}
