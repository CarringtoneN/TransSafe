import { useEffect, useMemo, useState } from "react";
import driverService from "../../../services/driverService";

export default function useDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDrivers() {
    try {
      setLoading(true);
      setError("");

      const data = await driverService.getAllDrivers();

      console.log("Drivers received:", data);

      setDrivers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load drivers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDrivers();
  }, []);

  const filteredDrivers = useMemo(() => {
    if (!search) return drivers;

    const term = search.toLowerCase();

    return drivers.filter((driver) => {
      return (
        driver.employeeNumber
          .toLowerCase()
          .includes(term) ||
        driver.firstName
          .toLowerCase()
          .includes(term) ||
        driver.lastName
          .toLowerCase()
          .includes(term) ||
        driver.licenseNumber
          .toLowerCase()
          .includes(term)
      );
    });
  }, [drivers, search]);

  return {
    drivers,
    filteredDrivers,
    search,
    setSearch,
    loading,
    error,
    loadDrivers,
  };
}