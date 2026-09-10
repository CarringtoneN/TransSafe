import { useEffect, useMemo, useState } from "react";
import vehicleService from "../../../services/vehicleService";

export default function useVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  async function loadVehicles() {
    try {
      setLoading(true);
      setError("");

      const data = await vehicleService.getAllVehicles();
      setVehicles(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load vehicles.");
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingVehicle(null);
    setIsModalOpen(true);
  }

  function openEditModal(vehicle) {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  }

  function closeModal() {
    setEditingVehicle(null);
    setIsModalOpen(false);
  }

  function openViewModal(vehicle) {
    setSelectedVehicle(vehicle);
    setIsViewModalOpen(true);
  }

  function closeViewModal() {
    setSelectedVehicle(null);
    setIsViewModalOpen(false);
  }

  async function saveVehicle(vehicle) {
    try {
      setLoading(true);

      if (editingVehicle) {
        await vehicleService.updateVehicle(editingVehicle.id, vehicle);
      } else {
        await vehicleService.createVehicle(vehicle);
      }

      await loadVehicles();
      closeModal();
    } catch (err) {
      console.error(err);
      setError("Failed to save vehicle.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteVehicle(id) {
    if (!window.confirm("Delete this vehicle?")) return;

    try {
      setLoading(true);

      await vehicleService.deleteVehicle(id);
      await loadVehicles();
    } catch (err) {
      console.error(err);
      setError("Failed to delete vehicle.");
    } finally {
      setLoading(false);
    }
  }

  const filteredVehicles = useMemo(() => {
    const term = search.toLowerCase();

    return vehicles.filter((vehicle) => {
      return (
        vehicle.registration.toLowerCase().includes(term) ||
        vehicle.make.toLowerCase().includes(term) ||
        vehicle.model.toLowerCase().includes(term)
      );
    });
  }, [vehicles, search]);

  return {
    vehicles,
    filteredVehicles,

    search,
    setSearch,

    loading,
    error,

    isModalOpen,
    editingVehicle,

    isViewModalOpen,
    selectedVehicle,

    openAddModal,
    openEditModal,
    openViewModal,

    closeModal,
    closeViewModal,

    saveVehicle,
    deleteVehicle,
    loadVehicles,
  };
}