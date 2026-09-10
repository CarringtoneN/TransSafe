
import { useCallback, useEffect, useMemo, useState } from "react";
import service from "../../services/maintenanceService";

export const moneyKES = value =>
  `KSh ${Number(value || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = value =>
  value ? new Intl.DateTimeFormat("en-KE", { dateStyle: "medium" }).format(new Date(value)) : "—";

export function useMaintenanceCollection(type) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = type === "schedules" ? await service.getSchedules()
        : type === "workOrders" ? await service.getWorkOrders()
        : type === "repairs" ? await service.getRepairs()
        : await service.getCompliance();
      setItems(data);
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to load maintenance records.");
    } finally { setLoading(false); }
  }, [type]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(item => JSON.stringify(item).toLowerCase().includes(q));
  }, [items, search]);

  return { items, filtered, search, setSearch, loading, error, load };
}
