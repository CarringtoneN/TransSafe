import { Button, Badge, Field, formatDateTime, Modal } from "./OperationsUI";
export default function TripView({ open, onClose, trip }) {
  if (!trip) return null;
  return <Modal open={open} onClose={onClose} title={`Trip #${trip.id}`}>
    <div className="grid gap-5 p-6 md:grid-cols-2">
      <Field label="Route"><div className="rounded-xl bg-slate-50 p-3">{trip.origin} → {trip.destination}</div></Field>
      <Field label="Status"><div><Badge tone={trip.status === "COMPLETED" ? "green" : trip.status === "CANCELLED" ? "red" : "blue"}>{trip.status}</Badge></div></Field>
      <Field label="Vehicle"><div className="rounded-xl bg-slate-50 p-3">{trip.vehicle?.registration || "—"}</div></Field>
      <Field label="Driver"><div className="rounded-xl bg-slate-50 p-3">{trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : "—"}</div></Field>
      <Field label="Departure"><div className="rounded-xl bg-slate-50 p-3">{formatDateTime(trip.departureTime)}</div></Field>
      <Field label="Arrival"><div className="rounded-xl bg-slate-50 p-3">{formatDateTime(trip.arrivalTime)}</div></Field>
      <Field label="Distance"><div className="rounded-xl bg-slate-50 p-3">{trip.distance == null ? "—" : `${trip.distance} km`}</div></Field>
      <div className="md:col-span-2 flex justify-end"><Button variant="secondary" onClick={onClose}>Close</Button></div>
    </div>
  </Modal>;
}
