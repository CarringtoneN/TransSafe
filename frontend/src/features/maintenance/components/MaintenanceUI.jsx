
import { AlertCircle, CheckCircle2, Clock3, XCircle } from "lucide-react";

export const moneyKES = value =>
  `KSh ${Number(value || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = value =>
  value ? new Intl.DateTimeFormat("en-KE", { dateStyle: "medium" }).format(new Date(value)) : "—";

export function StatusBadge({ value }) {
  const text = String(value || "UNKNOWN").replaceAll("_", " ");
  const key = String(value || "").toUpperCase();
  const cls = key.includes("COMPLETED") || key === "CLOSED" || key === "APPROVED" || key === "COMPLIANT" || key === "ROADWORTHY"
    ? "bg-green-100 text-green-700"
    : key.includes("CANCEL") || key === "EXPIRED" || key === "NOT_ROADWORTHY"
      ? "bg-red-100 text-red-700"
      : key.includes("PROGRESS") || key.includes("ASSIGNED") || key.includes("EXPIRING") || key === "HIGH"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-100 text-slate-700";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>{text}</span>;
}

export function Notice({ type = "error", children }) {
  const Icon = type === "success" ? CheckCircle2 : type === "warning" ? Clock3 : type === "error" ? AlertCircle : XCircle;
  const cls = type === "success" ? "bg-green-50 text-green-700" : type === "warning" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700";
  return <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${cls}`}><Icon size={18}/>{children}</div>;
}

export function Modal({ open, title, subtitle, onClose, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div><h2 className="text-xl font-bold text-slate-900">{title}</h2>{subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}</div>
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-2xl text-slate-500 hover:bg-slate-100" aria-label="Close">×</button>
        </div>
        <div className="min-h-0 overflow-y-auto p-6">{children}</div>
        {footer && <div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ label, error, children, className = "" }) {
  return <label className={`block ${className}`}><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>{children}{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</label>;
}

export const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
