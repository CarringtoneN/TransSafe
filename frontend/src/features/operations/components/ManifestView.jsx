import { Modal, Badge, dateTime } from "./OperationsUI";

export default function ManifestView({ open, onClose, data }) {
  if (!data) return null;
  const { trip, allocation, manifest } = data;
  return (
    <Modal open={open} onClose={onClose} title={`Manifest ${manifest.reference}`} subtitle="Trip, crew and vehicle information" wide>
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-blue-50 p-4"><div className="text-xs uppercase text-blue-600">Route</div><div className="mt-1 font-bold">{trip.origin} → {trip.destination}</div></div>
          <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs uppercase text-slate-500">Status</div><div className="mt-1"><Badge value={trip.status} /></div></div>
          <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs uppercase text-slate-500">Generated</div><div className="mt-1 font-semibold">{dateTime(manifest.generatedAt)}</div></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border p-5">
            <h3 className="font-bold">Vehicle</h3>
            <p className="mt-2">{trip.vehicle?.registration}</p>
            <p className="text-sm text-slate-500">{trip.vehicle?.make} {trip.vehicle?.model} ({trip.vehicle?.year})</p>
          </div>
          <div className="rounded-xl border p-5">
            <h3 className="font-bold">Driver</h3>
            <p className="mt-2">{trip.driver?.firstName} {trip.driver?.lastName}</p>
            <p className="text-sm text-slate-500">{trip.driver?.phone || trip.driver?.employeeNumber}</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs uppercase text-slate-500">Departure</div><div className="mt-1 font-semibold">{dateTime(trip.departureTime)}</div></div>
          <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs uppercase text-slate-500">Arrival</div><div className="mt-1 font-semibold">{dateTime(trip.arrivalTime)}</div></div>
        </div>
        <div className="flex justify-end">
          <button onClick={() => window.print()} className="rounded-xl bg-slate-900 px-5 py-2.5 font-semibold text-white">Print Manifest</button>
        </div>
      </div>
    </Modal>
  );
}
