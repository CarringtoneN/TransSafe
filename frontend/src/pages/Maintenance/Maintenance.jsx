
import { useEffect, useState } from "react";
import { CalendarClock, ClipboardCheck, ShieldCheck, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import maintenanceService from "../../services/maintenanceService";
import { formatDate, StatusBadge, Notice } from "../../features/maintenance/components/MaintenanceUI";

export default function Maintenance() {
  const [data,setData]=useState(null); const [reminders,setReminders]=useState(null); const [error,setError]=useState("");
  useEffect(()=>{Promise.all([maintenanceService.getDashboard(),maintenanceService.getReminders()]).then(([a,b])=>{setData(a);setReminders(b);}).catch(e=>setError(e?.response?.data?.message||"Unable to load maintenance dashboard."));},[]);
  if(error)return <div className="p-6"><Notice>{error}</Notice></div>;
  if(!data)return <div className="p-6 text-slate-500">Loading maintenance dashboard...</div>;
  const cards=[["Schedules",data.scheduled,CalendarClock,"/maintenance-schedule"],["Open Work Orders",data.openOrders,ClipboardCheck,"/work-orders"],["Active Repairs",data.activeRepairs,Wrench,"/repairs"],["Compliance Alerts",data.complianceAlerts,ShieldCheck,"/compliance"]];
  return <div className="space-y-6">
    <div><h1 className="text-3xl font-bold text-slate-900">Maintenance & Compliance</h1><p className="mt-2 text-slate-500">Plan servicing, manage work orders, track repairs and keep the fleet compliant.</p></div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label,value,Icon,path])=><Link key={label} to={path} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 hover:-translate-y-0.5"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div><Icon className="text-blue-600" size={30}/></div></Link>)}</div>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="text-lg font-bold">Upcoming Maintenance</h2><div className="mt-4 space-y-3">{data.recent.length?data.recent.map(x=><div key={x.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><div><p className="font-semibold">{x.vehicle?.registration} — {x.serviceType}</p><p className="text-sm text-slate-500">{formatDate(x.scheduledDate)} · {x.maintenanceCategory}</p></div><StatusBadge value={x.status}/></div>):<p className="text-slate-500">No maintenance schedules yet.</p>}</div></section>
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="text-lg font-bold">Service Reminders</h2><div className="mt-4 space-y-3">{reminders?.maintenance?.slice(0,6).map(x=><div key={x.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><div><p className="font-semibold">{x.vehicle?.registration} — {x.serviceType}</p><p className="text-sm text-slate-500">{formatDate(x.scheduledDate)}</p></div><StatusBadge value={x.urgency}/></div>)}{reminders?.compliance?.slice(0,6).map(x=><div key={`c-${x.id}`} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><div><p className="font-semibold">{x.vehicle?.registration || x.driver?.firstName || "Fleet"} — {x.itemName}</p><p className="text-sm text-slate-500">{formatDate(x.expiryDate)}</p></div><StatusBadge value={x.urgency}/></div>)}{!reminders?.maintenance?.length&&!reminders?.compliance?.length&&<p className="text-slate-500">No reminders.</p>}</div></section>
    </div>
  </div>;
}
