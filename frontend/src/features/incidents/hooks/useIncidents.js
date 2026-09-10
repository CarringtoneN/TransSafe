import { useCallback, useEffect, useMemo, useState } from "react";
import incidentService from "../../../services/incidentService";

export default function useIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await incidentService.getAllIncidents();
      setIncidents(Array.isArray(data) ? data : []);
      setError("");
      return data;
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to load incidents.";
      setError(message);
      setIncidents([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIncidents().catch(() => undefined);
  }, [loadIncidents]);

  const stats = useMemo(() => {
    const total = incidents.length;
    const open = incidents.filter((item) => item.status === "OPEN").length;
    const investigating = incidents.filter((item) => item.status === "UNDER_INVESTIGATION").length;
    const resolved = incidents.filter((item) => item.status === "RESOLVED").length;
    const critical = incidents.filter((item) => item.severity === "CRITICAL").length;
    const injuries = incidents.reduce((sum, item) => sum + Number(item.injuries || 0), 0);
    const estimatedCost = incidents.reduce((sum, item) => sum + Number(item.estimatedCost || 0), 0);

    return { total, open, investigating, resolved, critical, injuries, estimatedCost };
  }, [incidents]);

  return {
    incidents,
    setIncidents,
    loading,
    error,
    stats,
    loadIncidents,
  };
}
