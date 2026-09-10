import { Button, Badge, Field, formatDateTime, Modal } from "./OperationsUI";
export default function ManifestView({ open, onClose, manifest }) {
  if (!manifest) return null;
  return <Modal open={open} onClose={onClose} title={manifest.manifestNumber}>
    <div className="space-y-5 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Route"><div className="rounded-xl bg-slate-50 p-3">{manifest.route}</div></Field>
        <Field label="Status"><div><Badge tone={manifest.status === "COMPLETED" ? "green" : manifest.status === "CANCELLED" ? "red" : "blue"}>{manifest.status}</Badge></div></Field>
        <Field label="Vehicle"><div className="rounded-xl bg-slate-50 p-3">{manifest.vehicle?.registration || "—"}</div></Field>
        <Field label="Driver"><div className="rounded-xl bg-slate-50 p-3">{manifest.driver ? `${manifest.driver.firstName} ${manifest.driver.lastName}` : "—"}</div></Field>
        <Field label="Departure"><div className="rounded-xl bg-slate-50 p-3">{formatDateTime(manifest.departureTime)}</div></Field>
        <Field label="Arrival"><div className="rounded-xl bg-slate-50 p-3">{formatDateTime(manifest.arrivalTime)}</div></Field>
      </div>
      <div className="flex justify-end"><Button variant="secondary" onClick={onClose}>Close</Button></div>
    </div>
  </Modal>;
}
