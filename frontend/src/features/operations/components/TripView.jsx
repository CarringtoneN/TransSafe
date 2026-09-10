import { Modal, Badge, dateTime } from "./OperationsUI";

export default function TripView({ open, onClose, trip }) {
  if (!trip) return null;
  return (
    <Modal open={open} onClose={onClose} title={`Trip #${trip.id}`} subtitle={`${trip.origin} → ${trip.destination}`}>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["Vehicle", trip.vehicle?.registration],
          ["Driver", trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : "—"],
          ["Departure", dateTime(trip.departureTime)],
          ["Arrival", dateTime(trip.arrivalTime)],
          ["Planned Distance", trip.distance != null ? `${trip.distance} km` : "—"],
          ["Starting Mileage", trip.startOdometer != null ? `${Number(trip.startOdometer).toLocaleString()} km` : "—"],
          ["Ending Mileage", trip.endOdometer != null ? `${Number(trip.endOdometer).toLocaleString()} km` : "—"],
          ["Actual Distance", trip.actualDistance != null ? `${Number(trip.actualDistance).toLocaleString()} km` : "—"],
          ["Status", <Badge value={trip.status} />],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
            <div className="mt-1 font-semibold text-slate-900">{value}</div>
          </div>
        ))}
      </div>
      {(trip.tripDriver?.length || trip.tripEvent?.length) && <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4"><h3 className="mb-3 font-bold">Driving Segments</h3><div className="space-y-2">{(trip.tripDriver || []).map(segment => <div key={segment.id} className="rounded-lg bg-slate-50 p-3"><p className="font-semibold">{segment.driver ? `${segment.driver.firstName} ${segment.driver.lastName}` : `Driver #${segment.driverId}`} {segment.planned && <span className="ml-2 rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700">Scheduled co-driver</span>}</p><p className="text-xs text-slate-500">{dateTime(segment.startTime)} → {dateTime(segment.endTime)}{segment.startLocation ? ` · ${segment.startLocation}` : ""}</p></div>)}</div></div>
        <div className="rounded-xl border border-slate-200 p-4"><h3 className="mb-3 font-bold">Trip Timeline</h3><div className="space-y-2">{(trip.tripEvent || []).map(event => <div key={event.id} className="rounded-lg bg-slate-50 p-3"><div className="flex justify-between gap-2"><span className="font-semibold">{event.eventType.replaceAll("_", " ")}{event.stopName ? ` — ${event.stopName}` : ""}</span><span className="text-xs text-slate-500">{dateTime(event.eventTime)}</span></div>{(event.location || event.notes) && <p className="mt-1 text-xs text-slate-600">{event.location || ""}{event.location && event.notes ? " · " : ""}{event.notes || ""}</p>}</div>)}</div></div>
      </div>}
    </Modal>
  );
}
