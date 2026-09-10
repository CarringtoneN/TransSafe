import { Modal, Badge, dateTime } from "./OperationsUI";

export default function AllocationView({ open, onClose, allocation }) {
  if (!allocation) return null;
  const driver = allocation.driver;
  const vehicle = allocation.vehicle;
  return (
    <Modal open={open} onClose={onClose} title={`Allocation #${allocation.id}`} subtitle="Shared allocation record">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs uppercase text-slate-500">Vehicle</div><div className="mt-1 font-semibold">{vehicle?.registration} — {vehicle?.make} {vehicle?.model}</div></div>
        <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs uppercase text-slate-500">Driver</div><div className="mt-1 font-semibold">{driver ? `${driver.firstName} ${driver.lastName}` : "—"}</div></div>
        <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs uppercase text-slate-500">Assigned</div><div className="mt-1 font-semibold">{dateTime(allocation.assignedAt)}</div></div>
        <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs uppercase text-slate-500">Unassigned</div><div className="mt-1 font-semibold">{dateTime(allocation.unassignedAt)}</div></div>
        <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs uppercase text-slate-500">Status</div><div className="mt-1"><Badge value={allocation.status} /></div></div>
        <div className="rounded-xl bg-slate-50 p-4 md:col-span-2"><div className="text-xs uppercase text-slate-500">Notes</div><div className="mt-1">{allocation.notes || "—"}</div></div>
      </div>
    </Modal>
  );
}
