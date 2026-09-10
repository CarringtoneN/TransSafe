import {useEffect,useState} from "react";
import vehicleService from "../../../services/vehicleService";

function Row({label,value}){return <div className="grid grid-cols-2 gap-4 border-b py-3"><b>{label}</b><span>{value||"-"}</span></div>}
function formatMileage(value){return value==null||value===""?"No mileage recorded":`${Number(value).toLocaleString()} km`;}

function VehicleDetails({vehicle}){
  const [history,setHistory]=useState(null);
  const [tab,setTab]=useState("details");

  useEffect(()=>{
    if(vehicle?.id) vehicleService.getHistory(vehicle.id).then(setHistory).catch(()=>setHistory({trips:[],drivers:[],maintenance:[],documents:[],summary:{totalTrips:0,completedTrips:0,recordedMileage:null}}));
  },[vehicle?.id]);

  if(!vehicle)return <p>No vehicle selected.</p>;
  const current=(vehicle.assignment||[]).filter(a=>a.status==="ACTIVE"&&!a.unassignedAt).map(a=>`${a.driver?.firstName||""} ${a.driver?.lastName||""}`).join(", ")||"No current driver";
  const summary=history?.summary||{totalTrips:history?.trips?.length||0,completedTrips:0,recordedMileage:null};

  return <div>
    <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm"><p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Vehicle Details</p><h2 className="mt-1 text-3xl font-extrabold text-slate-900">Vehicle Details for {vehicle.registration}</h2><p className="mt-1 text-slate-500">{vehicle.make} {vehicle.model} · {vehicle.bodyType || "Vehicle"}</p></div>
    <div className="mb-5 grid gap-4 md:grid-cols-3">
      <div className="flex min-h-28 items-center justify-between rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white px-6 py-5 shadow-sm">
        <div><p className="text-sm font-medium uppercase tracking-wide text-slate-500">Trips Done</p><p className="mt-1 text-3xl font-bold text-slate-900">{summary.completedTrips}</p><p className="mt-1 text-xs text-slate-500">{summary.totalTrips} total trip record{summary.totalTrips===1?"":"s"}</p></div>
        <div className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">Completed Trips</div>
      </div>
      <div className="flex min-h-28 items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 shadow-sm"><div><p className="text-sm font-medium uppercase tracking-wide text-slate-500">Trip Distance Recorded</p><p className="mt-1 text-3xl font-bold text-slate-900">{Number(summary.totalTripDistanceKm||0).toLocaleString()} km</p><p className="mt-1 text-xs text-slate-500">Completed trip distance tied to trip records</p></div><div className="rounded-xl bg-slate-700 px-4 py-3 text-sm font-semibold text-white">Trip km</div></div>
      <div className="flex min-h-28 items-center justify-between rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white px-6 py-5 shadow-sm">
        <div><p className="text-sm font-medium uppercase tracking-wide text-slate-500">Recorded Mileage</p><p className="mt-1 text-3xl font-bold text-slate-900">{formatMileage(summary.recordedMileage)}</p><p className="mt-1 text-xs text-slate-500">Latest recorded odometer reading</p></div>
        <div className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white">Mileage</div>
      </div>
    </div>

    <div className="mb-4 flex flex-wrap gap-2">{[["details","Vehicle Details"],["trips","Trips"],["drivers","Driver History"],["maintenance","Maintenance & Service"],["documents","Documents & Renewals"]].map(([id,label])=><button key={id} onClick={()=>setTab(id)} className={`rounded-lg px-3 py-2 text-sm ${tab===id?"bg-blue-600 text-white":"bg-slate-100"}`}>{label}</button>)}</div>

    {tab==="details"&&<div className="space-y-1"><Row label="Registration" value={vehicle.registration}/><Row label="Make / Model" value={`${vehicle.make} ${vehicle.model}`}/><Row label="Body Type" value={vehicle.bodyType}/><Row label="Year" value={vehicle.year}/><Row label="Status" value={vehicle.status}/><Row label="Current Driver(s)" value={current}/><Row label="VIN" value={vehicle.vin}/><Row label="Fuel Type" value={vehicle.fuelType}/><Row label="Carrying Capacity" value={vehicle.carryingCapacity != null ? `${vehicle.carryingCapacity} passengers` : null}/><Row label="Current Mileage" value={formatMileage(vehicle.currentMileage)}/><Row label="Estimated Fuel Efficiency" value={history?.fuelSummary?.kmPerLitre ? `${history.fuelSummary.kmPerLitre.toFixed(1)} km/L` : null}/></div>}
    {tab==="trips"&&<List items={history?.trips} empty="No trips recorded." render={x=><><b>{x.origin} → {x.destination}</b><div>{x.status} · {new Date(x.departureTime).toLocaleString()}</div></>}/>} 
    {tab==="drivers"&&<List items={history?.drivers} empty="No driver allocation history." render={x=><><b>{x.driver?.firstName} {x.driver?.lastName}</b><div>{x.status} · {new Date(x.assignedAt).toLocaleDateString()} {x.unassignedAt?`to ${new Date(x.unassignedAt).toLocaleDateString()}`:"(current)"}</div></>}/>} 
    {tab==="maintenance"&&<List items={history?.maintenance} empty="No maintenance or service history." render={x=><><b>{x.kind} · {x.serviceType||x.maintenanceType||x.repairReference||"Maintenance"}</b><div>{x.serviceDate||x.scheduledDate||x.dateReported ? new Date(x.serviceDate||x.scheduledDate||x.dateReported).toLocaleDateString():""}</div></>}/>} 
    {tab==="documents"&&<List items={history?.documents} empty="No documentation history." render={x=><><b>{x.documentName}</b><div>{x.documentType} · {x.status} · Renewal/expiry: {x.expiryDate?new Date(x.expiryDate).toLocaleDateString():"Not specified"}</div></>}/>} 
  </div>
}

function List({items=[],empty,render}){return <div className="space-y-3">{!items.length?<p className="rounded-lg bg-slate-50 p-5 text-slate-500">{empty}</p>:items.map((x,i)=><div key={x.id||i} className="rounded-xl border p-4">{render(x)}</div>)}</div>}
export default VehicleDetails;
