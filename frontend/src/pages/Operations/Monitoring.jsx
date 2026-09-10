import { useEffect, useState } from "react";
import { Eye, RefreshCw, Search } from "lucide-react";
import operationsService from "../../services/operationsService";
import MonitoringView from "../../features/operations/components/MonitoringView";
import { Badge, dateTime } from "../../features/operations/components/OperationsUI";

export default function Monitoring() {
  const [data,setData]=useState({trips:[],activeAssignments:[],counts:{}});
  const [query,setQuery]=useState(""),[status,setStatus]=useState("ALL"),[error,setError]=useState(""),[view,setView]=useState(null),[loading,setLoading]=useState(false);

  async function load(){
    try{setLoading(true);setError("");setData(await operationsService.monitoring({search:query,status}))}
    catch(e){setError(e.response?.data?.message||e.message)}
    finally{setLoading(false)}
  }
  useEffect(()=>{load()},[status]);

  return <div className="space-y-6">
    <header className="flex flex-wrap justify-between gap-4"><div><h1 className="text-3xl font-bold">Monitoring</h1><p className="mt-1 text-slate-500">Operational view built from live trip and allocation data.</p></div><button onClick={load} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3"><RefreshCw size={18} className={loading?"animate-spin":""}/> Refresh</button></header>
    <div className="grid gap-4 md:grid-cols-3"><div className="rounded-2xl border bg-white p-5"><div className="text-sm text-slate-500">In Progress</div><div className="mt-1 text-3xl font-bold">{data.counts.activeTrips||0}</div></div><div className="rounded-2xl border bg-white p-5"><div className="text-sm text-slate-500">Scheduled</div><div className="mt-1 text-3xl font-bold">{data.counts.scheduledTrips||0}</div></div><div className="rounded-2xl border bg-white p-5"><div className="text-sm text-slate-500">Active Allocations</div><div className="mt-1 text-3xl font-bold">{data.counts.activeAssignments||0}</div></div></div>
    <div className="flex flex-wrap gap-3"><div className="flex flex-1 items-center gap-2 rounded-xl border bg-white px-3"><Search size={18}/><input className="w-full py-3 outline-none" placeholder="Search monitoring..." value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&load()}/></div><select className="rounded-xl border bg-white px-4" value={status} onChange={e=>setStatus(e.target.value)}><option>ALL</option><option>SCHEDULED</option><option>IN_PROGRESS</option></select></div>
    {error&&<div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}
    <div className="overflow-hidden rounded-2xl border bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{["Trip","Vehicle","Driver","Departure","Status","Actions"].map(h=><th className="px-5 py-4 font-bold" key={h}>{h}</th>)}</tr></thead><tbody>{!data.trips.length?<tr><td colSpan="6" className="px-5 py-16 text-center text-slate-500">No active or scheduled trips.</td></tr>:data.trips.map(t=><tr className="border-t" key={t.id}><td className="px-5 py-4"><div className="font-semibold">{t.origin} → {t.destination}</div><div className="text-xs text-slate-500"># {t.id}</div></td><td className="px-5 py-4">{t.vehicle?.registration}</td><td className="px-5 py-4">{t.driver?.firstName} {t.driver?.lastName}</td><td className="px-5 py-4">{dateTime(t.departureTime)}</td><td className="px-5 py-4"><Badge value={t.status}/></td><td className="px-5 py-4"><button onClick={()=>setView(t)} className="rounded-lg p-2"><Eye size={18}/></button></td></tr>)}</tbody></table></div>
    <MonitoringView open={!!view} onClose={()=>setView(null)} trip={view}/>
  </div>
}
