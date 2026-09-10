import { useEffect, useMemo, useState } from "react";
import inspectionService from "../../../services/inspectionService";

export default function useInspections() {
  const [inspections, setInspections] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  async function loadInspections() {
    try {
      setLoading(true);

      const data = await inspectionService.getAllInspections();

      setInspections(data);

      setError("");
    } catch (err) {
      console.error(err);

      setError("Failed to load inspections.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInspections();
  }, []);

  const filteredInspections = useMemo(() => {
    if (!search) return inspections;

    const q = search.toLowerCase();

    return inspections.filter((inspection) => {
      return (
        inspection.vehicle?.registration?.toLowerCase().includes(q) ||
        inspection.driver?.firstName?.toLowerCase().includes(q) ||
        inspection.driver?.lastName?.toLowerCase().includes(q) ||
        inspection.inspectorName?.toLowerCase().includes(q) ||
        inspection.overallStatus?.toLowerCase().includes(q)
      );
    });
  }, [inspections, search]);

  return {
    inspections,
    filteredInspections,

    loading,
    error,

    search,
    setSearch,

    loadInspections,
  };
}