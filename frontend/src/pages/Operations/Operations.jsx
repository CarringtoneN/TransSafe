import { Link } from "react-router-dom";
import { ArrowRight, ClipboardList, Map, Users, Truck } from "lucide-react";

const cards = [
  ["/trips", "Trips", "Create and manage scheduled trips.", ClipboardList],
  ["/vehicle-allocation", "Vehicle Allocation", "Assign vehicles and drivers using one shared allocation record.", Truck],
  ["/driver-allocation", "Driver Allocation", "Manage the driver side of the same allocation data.", Users],
  ["/manifest", "Manifest", "Generate printable manifests from trip data.", Map],
  ["/monitoring", "Monitoring", "Monitor scheduled and in-progress operations.", ClipboardList],
];

export default function Operations() {
  return <div className="space-y-6"><header><h1 className="text-3xl font-bold">Operations</h1><p className="mt-1 text-slate-500">Trips, allocations, manifests and monitoring work from the same operational data.</p></header><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{cards.map(([path,title,desc,Icon])=><Link key={path} to={path} className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center justify-between"><div className="rounded-xl bg-blue-50 p-3 text-blue-600"><Icon size={24}/></div><ArrowRight className="text-slate-400 transition group-hover:translate-x-1"/></div><h2 className="mt-5 text-xl font-bold">{title}</h2><p className="mt-2 text-sm text-slate-500">{desc}</p></Link>)}</div></div>
}
