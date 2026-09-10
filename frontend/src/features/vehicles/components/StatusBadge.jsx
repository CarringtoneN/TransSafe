function StatusBadge({ status }) {
  const normalized = String(status || "").trim().toUpperCase();

  const styles = {
    ACTIVE: "bg-green-100 text-green-700",
    MAINTENANCE: "bg-amber-100 text-amber-700",
    OUT_OF_SERVICE: "bg-red-100 text-red-700",
  };

  const labels = {
    ACTIVE: "ACTIVE",
    MAINTENANCE: "MAINTENANCE",
    OUT_OF_SERVICE: "OUT OF SERVICE",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        styles[normalized] || "bg-slate-100 text-slate-600"
      }`}
    >
      {labels[normalized] || status || "UNKNOWN"}
    </span>
  );
}

export default StatusBadge;
