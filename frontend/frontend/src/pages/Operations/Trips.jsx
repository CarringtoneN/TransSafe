import { useEffect, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import operationsService from "../../services/operationsService";
import TripModal from "../../features/operations/components/TripModal";
import TripView from "../../features/operations/components/TripView";
import { Badge, Button, errorMessage, formatDateTime } from "../../features/operations/components/OperationsUI";

export default function Trips() {
  const [rows,setRows]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(""); const [search,setSearch]=useState(""); const [modal,setModal]=useState(null);
  const load=async()=>{setLoading(true);try{setError("");setRows(await operationsService.listTrips({search:search.trim()}));}catch(e){setError(errorMessage(e));}finally{setLoading(false);}};
  useEffect(()=>{load();},[]);
  return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-bold text-slate-900">Trips</h1><p className="text-slate-500">Plan and manage fleet trips.</p></div><Button onClick={()=>setModal({type:"edit",item:null})}><Plus size={18} className="mr-2 inline"/>New Trip</Button></div>
    <div className="flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-3 text-slate-400" size={18}/><input className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3" placeholder="Search trips…" value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()}/></div><Button variant="secondary" onClick={load}>Search</Button></div>
    {error&&<div className="rounded-xl bg-red-50 px-4 py-3 text-red-700">{error}</div>}
    <div className="overflow-hidden rounded-2xl border bg-white"><table className="min-w-full text-sm"><thead className="bg-slate-50"><tr>{["Route","Vehicle","Driver","Departure","Status","Actions"].map(x=><th key={x} className="px-4 py-3 text-left font-semibold">{x}</th>)}</tr></thead><tbody>{loading?<tr><td colSpan="6" className="p-10 text-center">Loading…</td></tr>:rows.length===0?<tr><td colSpan="6" className="p-10 text-center text-slate-500">No trips found.</td></tr>:rows.map(r=><tr key={r.id} className="border-t"><td className="px-4 py-4 font-medium">{r.origin} → {r.destination}</td><td className="px-4 py-4">{r.vehicle?.registration||"—"}</td><td className="px-4 py-4">{r.driver?`${r.driver.firstName} ${r.driver.lastName}`:"—"}</td><td className="px-4 py-4">{formatDateTime(r.departureTime)}</td><td className="px-4 py-4"><Badge tone={r.status==='COMPLETED'?'green':r.status==='CANCELLED'?'red':r.status==='IN_PROGRESS'?'amber':'blue'}>{r.status}</Badge></td><td className="px-4 py-4"><div className="flex gap-1"><button title="View" onClick={()=>setModal({type:"view",item:r})} className="rounded-lg p-2 hover:bg-slate-100"><Eye size={17}/></button><button title="Edit" onClick={()=>setModal({type:"edit",item:r})} className="rounded-lg p-2 hover:bg-slate-100"><Pencil size={17}/></button><button title="Delete" onClick={async()=>{if(confirm('Delete this trip?')){try{await operationsService.deleteTrip(r.id);load();}catch(e){alert(errorMessage(e));}}}} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17}/></button></div></td></tr>)}</tbody></table></div>
    <TripModal open={modal?.type==='edit'} initial={modal?.item} onClose={()=>setModal(null)} onSaved={load}/><TripView open={modal?.type==='view'} trip={modal?.item} onClose={()=>setModal(null)}/>
  </div>;
}
