import { useEffect, useState } from "react";
import { Eye, RefreshCw, Search } from "lucide-react";
import operationsService from "../../services/operationsService";
import ManifestView from "../../features/operations/components/ManifestView";
import { Badge, dateTime } from "../../features/operations/components/OperationsUI";

export default function Manifest() {
  const [rows,setRows]=useState([]),[query,setQuery]=useState(""),[status,setStatus]=useState("ALL"),[error,setError]=useState(""),[view,setView]=useState(null);

  async function load(){
    try{setError("");setRows(await operationsService.listManifest({search:query,status}))}
    catch(e){setError(e.response?.data?.message||e.message)}
  }
  useEffect(()=>{load()},[status]);

  async function openManifest(id){
    try{setError("");setView(await operationsService.getManifest(id))}
    catch(e){setError(e.response?.data?.message||e.message)}
  }

  return <div className="space-y-6">
    <header><h1 className="text-3xl font-bold">Manifest</h1><p className="mt-1 text-slate-500">Trip manifests are generated directly from the trip, vehicle, driver and allocation records.</p></header>
    <div className="flex flex-wrap gap-3"><div className="flex flex-1 items-center gap-2 rounded-xl border bg-white px-3"><Search size={18}/><input className="w-full py-3 outline-none" placeholder="Search route, vehicle or driver..." value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&load()}/></div><select className="rounded-xl border bg-white px-4" value={status} onChange={e=>setStatus(e.target.value)}><option>ALL</option><option>SCHEDULED</option><option>IN_PROGRESS</option><option>COMPLETED</option><option>CANCELLED</option></select><button onClick={load} className="rounded-xl border p-3"><RefreshCw size={18}/></button></div>
    {error&&<div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}
    <div className="overflow-hidden rounded-2xl border bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{["Manifest","Route","Vehicle","Driver","Departure","Status","Actions"].map(h=><th className="px-5 py-4 font-bold" key={h}>{h}</th>)}</tr></thead><tbody>{!rows.length?<tr><td colSpan="7" className="px-5 py-16 text-center text-slate-500">No manifests found. Create a trip first.</td></tr>:rows.map(t=><tr className="border-t" key={t.id}><td className="px-5 py-4 font-semibold">TRIP-{String(t.id).padStart(6,"0")}</td><td className="px-5 py-4">{t.origin} → {t.destination}</td><td className="px-5 py-4">{t.vehicle?.registration}</td><td className="px-5 py-4">{t.driver?.firstName} {t.driver?.lastName}</td><td className="px-5 py-4">{dateTime(t.departureTime)}</td><td className="px-5 py-4"><Badge value={t.status}/></td><td className="px-5 py-4"><button onClick={()=>openManifest(t.id)} className="rounded-lg p-2 hover:bg-slate-100" title="View manifest"><Eye size={18}/></button></td></tr>)}</tbody></table></div>
    <ManifestView open={!!view} onClose={()=>setView(null)} data={view}/>
  </div>
}
