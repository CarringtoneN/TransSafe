import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock3, MapPin, PauseCircle, PlayCircle, RefreshCw, Route as RouteIcon, UserRound, Users, XCircle, AlertTriangle } from "lucide-react";
import tripService from "../../services/tripService";

function status(value) {
  const v = value === "IN_PROGRESS" ? "ONGOING" : value === "PAUSED" ? "PAUSED" : value === "SCHEDULED" ? "UPCOMING" : String(value || "").replaceAll("_", " ");
  const cls = value === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" : value === "PAUSED" ? "bg-amber-100 text-amber-700" : value === "COMPLETED" ? "bg-green-100 text-green-700" : value === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${cls}`}>{v}</span>;
}
function dt(v) { return v ? new Date(v).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—"; }

export default function DriverTrips() {
  const [trips, setTrips] = useState([]), [drivers, setDrivers] = useState([]), [assignments, setAssignments] = useState([]);
  const [filter, setFilter] = useState("ALL"), [loading, setLoading] = useState(true), [error, setError] = useState(""), [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [driving, setDriving] = useState(null);
  async function load() {
    setLoading(true); setError("");
    try {
      const [t, d] = await Promise.all([tripService.myTrips(), tripService.drivingStatus()]);
      setTrips(Array.isArray(t) ? t : []);
      setDriving(d || null);
      // Driver details/assignments are only needed when a takeover is requested.
      // Keeping the initial My Trips request driver-scoped prevents unrelated
      // management endpoints from blocking the driver portal.
      setDrivers([]);
      setAssignments([]);
    } catch (e) { setError(e?.response?.data?.message || "Unable to load your trips."); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    load();
    const timer = window.setInterval(async () => {
      try { setDriving(await tripService.drivingStatus()); } catch {}
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);
  const filtered = useMemo(() => filter === "ALL" ? trips : trips.filter(t => t.status === filter), [trips, filter]);
  async function act(fn, success) { setBusy(true); setError(""); try { await fn(); setNotice(success); await load(); } catch(e) { setError(e?.response?.data?.message || "Trip action failed."); } finally { setBusy(false); } }
  async function takeOver(trip) { const location = window.prompt("Takeover location:", "") || ""; if (!location) return; await act(() => tripService.changeDriver(trip.id, { location }), "You have taken over the trip. Your driving segment has started."); }

  async function changeDriver(trip) {
    setBusy(true); setError("");
    try {
      const available = await tripService.availableDrivers(trip.id);
      const options = (Array.isArray(available) ? available : []).filter(d => !d.isCurrentDriver);
      if (!options.length) { setError("No other active driver is allocated to this vehicle. Allocate a second driver before handing over the trip."); return; }
      const labels = options.map(d => `${d.driverId}: ${d.driver ? `${d.driver.firstName} ${d.driver.lastName}` : `Driver #${d.driverId}`}${d.isPlannedCoDriver ? " (planned co-driver)" : ""}`).join("\n");
      const selected = window.prompt(`Select the driver taking over by ID:\n${labels}\n\nTakeover location:`, String(options.find(d => d.isPlannedCoDriver)?.driverId ?? options[0].driverId));
      if (!selected) return;
      const target = options.find(d => Number(d.driverId) === Number(selected));
      if (!target) { setError("Select one of the listed active drivers."); return; }
      const location = window.prompt("Where is the driver taking over?", "");
      if (!location) return;
      await tripService.changeDriver(trip.id, { newDriverId: Number(target.driverId), location });
      setNotice("Handover requested. The selected driver must now use Take Over Trip to become the active driver.");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to change driver.");
    } finally { setBusy(false); }
  }
  async function pause(trip) { const stopName = window.prompt("Stop-over name (e.g. Stop Over at Nakuru):", ""); if (!stopName) return; const location = window.prompt("Stop-over location:", stopName); await act(() => tripService.pause(trip.id, { stopName, location }), "Trip paused and stop-over recorded."); }
  async function start(trip) { const location = window.prompt("Start location:", trip.origin) || trip.origin; await act(() => tripService.start(trip.id, { location }), "Trip started. Status is now ONGOING."); }
  async function resume(trip) { const location = window.prompt("Resume location:", "") || undefined; await act(() => tripService.resume(trip.id, { location }), "Trip resumed."); }
  async function end(trip) {
    const rawMileage = window.prompt(`Enter current vehicle mileage (km). Starting mileage: ${Number(trip.startOdometer ?? trip.vehicle?.currentMileage ?? 0).toLocaleString()} km`, String(trip.vehicle?.currentMileage ?? ""));
    if (rawMileage === null || rawMileage.trim() === "" || !Number.isFinite(Number(rawMileage))) return;
    const location = window.prompt("End location:", trip.destination) || trip.destination;
    if (!window.confirm(`End this trip at ${Number(rawMileage).toLocaleString()} km? This mileage will update the vehicle record.`)) return;
    await act(() => tripService.end(trip.id, { location, endOdometer:Number(rawMileage) }), "Trip completed. Mileage recorded and added to the vehicle mileage.");
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><Link to="/driver-dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600"><ArrowLeft size={16}/> Driver Dashboard</Link><h1 className="mt-2 text-3xl font-bold text-slate-900">My Trips</h1><p className="mt-1 text-slate-500">Manage your assigned trips, stop-overs, trip timing and driver handovers.</p></div><button onClick={load} disabled={loading||busy} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700"><RefreshCw size={17} className={loading?"animate-spin":""}/> Refresh</button></div>
    {notice&&<div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">{notice}</div>}{error&&<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>}
    {driving && <div className={`rounded-2xl border p-4 ${driving.maxDrivingReached ? "border-red-300 bg-red-50 text-red-900" : driving.breakDue ? "border-amber-300 bg-amber-50 text-amber-900" : "border-slate-200 bg-white text-slate-800"}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle size={21} className={driving.maxDrivingReached ? "text-red-600" : driving.breakDue ? "text-amber-600" : "text-slate-400"}/>
          <div>
            <p className="font-bold">{driving.maxDrivingReached ? "Driving limit reached" : driving.breakDue ? "4-hour driving break due" : "Driver safety status"}</p>
            <p className="mt-1 text-sm">Continuous driving: <strong>{driving.currentDrivingHours.toFixed(1)}h</strong> · Driving in last 24h: <strong>{driving.drivingLast24Hours.toFixed(1)}h</strong> · Maximum: <strong>{driving.maxDrivingHours}h</strong></p>
            {driving.cooldownRemainingHours > 0 && <p className="mt-1 text-sm font-semibold">Rest remaining before another trip: {driving.cooldownRemainingHours.toFixed(1)}h.</p>}
          </div>
        </div>
        {driving.breakDue && !driving.maxDrivingReached && <span className="rounded-lg bg-amber-200 px-3 py-2 text-sm font-bold">Take a break before continuing</span>}
        {driving.maxDrivingReached && <span className="rounded-lg bg-red-200 px-3 py-2 text-sm font-bold">Start/Resume is blocked</span>}
      </div>
    </div>}
    <div className="flex flex-wrap gap-2">{[["ALL","All"],["SCHEDULED","Upcoming"],["IN_PROGRESS","Ongoing"],["PAUSED","Paused"],["COMPLETED","Completed"]].map(([v,l])=><button key={v} onClick={()=>setFilter(v)} className={`rounded-xl px-4 py-2 font-semibold ${filter===v?"bg-blue-600 text-white":"bg-white text-slate-700 ring-1 ring-slate-200"}`}>{l}</button>)}</div>
    {loading?<div className="rounded-2xl bg-white p-10 text-center text-slate-500"><RefreshCw className="mx-auto mb-2 animate-spin"/>Loading your trips...</div>:filtered.length===0?<div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">No trips in this status.</div>:<div className="space-y-5">{filtered.map(trip=><div key={trip.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-3"><h2 className="text-xl font-bold">{trip.origin} → {trip.destination}</h2>{status(trip.status)}</div><p className="mt-1 text-sm text-slate-500">Vehicle {trip.vehicle?.registration || "—"} · Scheduled departure {dt(trip.departureTime)}</p></div><div className="flex flex-wrap gap-2">{trip.status==="SCHEDULED"&&trip.driverContext?.isPrimaryDriver&&<button disabled={busy} onClick={()=>start(trip)} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 font-semibold text-white"><PlayCircle size={17}/> Start Trip</button>}{["IN_PROGRESS","PAUSED"].includes(trip.status)&&trip.driverContext?.isPlannedCoDriver&&<button disabled={busy} onClick={()=>takeOver(trip)} className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 font-semibold text-white"><Users size={17}/> Take Over Trip</button>}{trip.status==="IN_PROGRESS"&&trip.driverContext?.isActiveDriver&&<button disabled={busy} onClick={()=>pause(trip)} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 font-semibold text-white"><PauseCircle size={17}/> Pause</button>}{trip.status==="IN_PROGRESS"&&trip.driverContext?.isPrimaryDriver&&<><button disabled={busy} onClick={()=>changeDriver(trip)} className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 font-semibold text-white"><Users size={17}/> Hand Over / Exchange Driver</button><button disabled={busy} onClick={()=>end(trip)} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-semibold text-white"><XCircle size={17}/> End Trip</button></>}{trip.status==="PAUSED"&&trip.driverContext?.isPrimaryDriver&&<><button disabled={busy} onClick={()=>resume(trip)} className="inline-flex items-center gap-2 rounded-xl border border-blue-300 bg-white px-4 py-2.5 font-semibold text-blue-700"><PlayCircle size={17}/> Unpause / Resume Trip</button><button disabled={busy} onClick={()=>changeDriver(trip)} className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 font-semibold text-white"><Users size={17}/> Hand Over / Exchange Driver</button><button disabled={busy} onClick={()=>end(trip)} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-semibold text-white"><XCircle size={17}/> End Trip</button></>}</div></div>
      <div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-500">Current driver</p><p className="mt-1 font-semibold">{trip.driver?`${trip.driver.firstName} ${trip.driver.lastName}`:"—"}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-500">Started</p><p className="mt-1 font-semibold">{trip.tripEvent?.find(e=>e.eventType==="START")?dt(trip.tripEvent.find(e=>e.eventType==="START").eventTime):"Not started"}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-500">Ended</p><p className="mt-1 font-semibold">{trip.tripEvent?.find(e=>e.eventType==="END")?dt(trip.tripEvent.find(e=>e.eventType==="END").eventTime):"Not ended"}</p></div></div>
      {(trip.tripDriver?.length||trip.tripEvent?.length)&&<div className="mt-5 grid gap-5 lg:grid-cols-2"><div><h3 className="mb-3 flex items-center gap-2 font-bold"><UserRound size={18}/> Driving segments</h3><div className="space-y-2">{(trip.tripDriver||[]).map(s=><div key={s.id} className="rounded-xl border border-slate-200 p-3"><p className="font-semibold">{s.driver?`${s.driver.firstName} ${s.driver.lastName}`:`Driver #${s.driverId}`}</p><p className="text-sm text-slate-500">{dt(s.startTime)} → {dt(s.endTime)} {s.startLocation&&` · ${s.startLocation}`}</p></div>)}</div></div><div><h3 className="mb-3 flex items-center gap-2 font-bold"><RouteIcon size={18}/> Trip timeline</h3><div className="space-y-2">{(trip.tripEvent||[]).map(e=><div key={e.id} className="rounded-xl border border-slate-200 p-3"><div className="flex items-center justify-between gap-2"><p className="font-semibold">{e.eventType.replaceAll("_"," ")}{e.stopName?` — ${e.stopName}`:""}</p><span className="text-xs text-slate-500">{dt(e.eventTime)}</span></div>{(e.location||e.notes)&&<p className="mt-1 text-sm text-slate-600">{e.location||""}{e.location&&e.notes?" · ":""}{e.notes||""}</p>}</div>)}</div></div></div>}
    </div>)}</div>}
  </div>;
}
