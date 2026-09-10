import { Button, Badge, Field, formatDateTime, Modal } from "./OperationsUI";
export default function MonitoringModal({ open, onClose, item }) {
  if (!item) return null;
  return <Modal open={open} onClose={onClose} title={`Trip #${item.tripId} Monitoring`}>
    <div className="grid gap-4 p-6 md:grid-cols-2">
      <Field label="Route"><div className="rounded-xl bg-slate-50 p-3">{item.route}</div></Field>
      <Field label="Status"><div><Badge tone={item.status === "COMPLETED" ? "green" : item.status === "CANCELLED" ? "red" : item.status === "IN_PROGRESS" ? "amber" : "blue"}>{item.status}</Badge></div></Field>
      <Field label="Vehicle"><div className="rounded-xl bg-slate-50 p-3">{item.vehicle?.registration || "—"}</div></Field>
      <Field label="Driver"><div className="rounded-xl bg-slate-50 p-3">{item.driver ? `${item.driver.firstName} ${item.driver.lastName}` : "—"}</div></Field>
      <Field label="Departure"><div className="rounded-xl bg-slate-50 p-3">{formatDateTime(item.departureTime)}</div></Field>
      <Field label="Last Updated"><div className="rounded-xl bg-slate-50 p-3">{formatDateTime(item.updatedAt)}</div></Field>
      <div className="md:col-span-2 flex justify-end"><Button variant="secondary" onClick={onClose}>Close</Button></div>
    </div>
  </Modal>;
}
