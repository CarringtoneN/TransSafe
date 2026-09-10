import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import meService from "../../services/meService";
import useAuth from "../../hooks/useAuth";

export default function DriverProfile() {
  const { user } = useAuth();
  const [driver, setDriver] = useState(user?.driver || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    meService.dashboard().then((response) => {
      if (mounted) setDriver(response.data.data?.driver || user?.driver || null);
    }).catch((e) => {
      if (mounted) setError(e.response?.data?.message || "Unable to load your driver profile.");
    }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const fullName = driver ? `${driver.firstName || ""} ${driver.lastName || ""}`.trim() : user?.name;
  const licenseExpired = driver?.licenseExpiry && new Date(driver.licenseExpiry) < new Date();

  return <div className="space-y-6">
    <Link to="/driver-dashboard" className="text-sm font-medium text-blue-600">← Driver Dashboard</Link>
    <div><h1 className="mt-2 text-3xl font-bold">My Driver Profile</h1><p className="mt-1 text-slate-500">Your identity, employment, contact and licensing information.</p></div>
    {error && <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>}
    {loading ? <div className="rounded-xl bg-white p-10 text-center text-slate-500">Loading profile...</div> : <>
      <div className="rounded-2xl bg-white p-6 shadow-sm"><div className="flex flex-col gap-5 md:flex-row md:items-center"><div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><UserRound size={38}/></div><div><h2 className="text-2xl font-bold">{fullName || "Driver"}</h2><p className="text-slate-500">Employee {driver?.employeeNumber || "-"}</p><div className="mt-2 flex flex-wrap gap-2"><span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"><BadgeCheck size={14}/> {driver?.status || "ACTIVE"}</span>{licenseExpired ? <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">License expired</span> : <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700"><ShieldCheck size={14}/> License current</span>}</div></div></div></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[["Email", driver?.email || user?.email, Mail], ["Phone", driver?.phone, Phone], ["Employee Number", driver?.employeeNumber, UserRound], ["License Number", driver?.licenseNumber, ShieldCheck], ["License Expiry", driver?.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString("en-GB", { dateStyle: "medium" }) : "-", BadgeCheck], ["Account Email", user?.email, Mail]].map(([label, value, Icon]) => <div key={label} className="rounded-xl bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-sm text-slate-500"><Icon size={17}/>{label}</div><p className="mt-2 font-semibold text-slate-900">{value || "-"}</p></div>)}</div>
    </>}
  </div>;
}
