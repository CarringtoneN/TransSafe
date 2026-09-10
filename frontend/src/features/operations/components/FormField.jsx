export function FormField({ label, required, error, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

export const inputClass = (error = false) =>
  `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${
    error ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
  }`;
