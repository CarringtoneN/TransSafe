import { useEffect, useMemo, useState } from "react";
import fuelService from "../../../services/fuelService";

export default function useFuel() {
  const [fuelRecords, setFuelRecords] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadFuelRecords() {
    try {
      setLoading(true);
      setError("");

      const data = await fuelService.getAllFuelRecords();

      console.log("Fuel records:", data);

      setFuelRecords(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load fuel records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFuelRecords();
  }, []);

  const filteredFuelRecords = useMemo(() => {
    if (!search) return fuelRecords;

    const term = search.toLowerCase();

    return fuelRecords.filter((record) => {
      return (
        record.vehicle?.registration
          ?.toLowerCase()
          .includes(term) ||
        record.station?.toLowerCase().includes(term) ||
        record.receiptNo?.toLowerCase().includes(term)
      );
    });
  }, [fuelRecords, search]);

  return {
    fuelRecords,
    filteredFuelRecords,

    search,
    setSearch,

    loading,
    error,

    loadFuelRecords,
  };
}