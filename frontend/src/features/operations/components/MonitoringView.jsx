import { Modal, Badge, dateTime } from "./OperationsUI";

export default function MonitoringView({ open, onClose, trip }) {
  if (!trip) return null;
  return (
    <Modal open={open} onClose={onClose} title={`Trip #${trip.id}`} subtitle="Live operational status">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs uppercase text-slate-500">Route</div><div className="mt-1 font-bold">{trip.origin} → {trip.destination}</div></div>
        <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs uppercase text-slate-500">Status</div><div className="mt-1"><Badge value={trip.status} /></div></div>
        <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs uppercase text-slate-500">Vehicle</div><div className="mt-1 font-semibold">{trip.vehicle?.registration}</div></div>
        <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs uppercase text-slate-500">Driver</div><div className="mt-1 font-semibold">{trip.driver?.firstName} {trip.driver?.lastName}</div></div>
        <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs uppercase text-slate-500">Departure</div><div className="mt-1 font-semibold">{dateTime(trip.departureTime)}</div></div>
        <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs uppercase text-slate-500">Arrival</div><div className="mt-1 font-semibold">{dateTime(trip.arrivalTime)}</div></div>
      </div>
    </Modal>
  );
}
