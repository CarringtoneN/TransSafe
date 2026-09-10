import { useCallback, useEffect, useState } from "react";

import shiftService from "../../../services/shiftService";

function useShifts() {
  const [shifts, setShifts] = useState([]);
  const [filteredShifts, setFilteredShifts] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    loadShifts();
  }, []);

  const filterShifts = useCallback(() => {
    if (!search.trim()) {
      setFilteredShifts(shifts);
      return;
    }

    const keyword = search.toLowerCase();

    const results = shifts.filter((shift) => {
      const driver =
        `${shift.driver?.firstName || ""} ${shift.driver?.lastName || ""}`.toLowerCase();

      const vehicle =
        shift.vehicle?.registration?.toLowerCase() || "";

      return (
        driver.includes(keyword) ||
        vehicle.includes(keyword) ||
        shift.status?.toLowerCase().includes(keyword)
      );
    });

    setFilteredShifts(results);
  }, [search, shifts]);

  useEffect(() => {
    filterShifts();
  }, [filterShifts]);

  async function loadShifts() {
    try {
      setLoading(true);

      const data = await shiftService.getAllShifts();

      setShifts(data);

      setFilteredShifts(data);

      setError("");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load shifts."
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    shifts,
    filteredShifts,

    search,
    setSearch,

    loading,
    error,

    loadShifts,
  };
}

export default useShifts;