import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import useFuel from "../../features/fuel/hooks/useFuel";

import FuelTable from "../../features/fuel/components/FuelTable";
import FuelModal from "../../features/fuel/components/FuelModal";
import ViewFuelModal from "../../features/fuel/components/ViewFuelModal";

import fuelService from "../../services/fuelService";
import vehicleService from "../../services/vehicleService";

function FuelRecords() {
  const {
    filteredFuelRecords,
    search,
    setSearch,
    loading,
    error,
    loadFuelRecords,
  } = useFuel();

  const [vehicles, setVehicles] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  async function loadVehicles() {
    try {
      const data = await vehicleService.getAllVehicles();
      setVehicles(data);
    } catch (err) {
      console.error(err);
    }
  }

  function openAddModal() {
    setEditingRecord(null);
    setIsModalOpen(true);
  }

  function openEditModal(record) {
    setEditingRecord(record);
    setIsModalOpen(true);
  }

  function closeModal() {
    setEditingRecord(null);
    setIsModalOpen(false);
  }

  function openViewModal(record) {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  }

  function closeViewModal() {
    setSelectedRecord(null);
    setIsViewModalOpen(false);
  }

  async function saveFuelRecord(record) {
    try {
      if (editingRecord) {
        await fuelService.updateFuelRecord(editingRecord.id, record);
      } else {
        await fuelService.createFuelRecord(record);
      }

      await loadFuelRecords();
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to save fuel record.");
    }
  }

  async function deleteFuelRecord(id) {
    if (!window.confirm("Delete this fuel record?")) return;

    try {
      await fuelService.deleteFuelRecord(id);
      await loadFuelRecords();
    } catch (err) {
      console.error(err);
      alert("Failed to delete fuel record.");
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        Loading fuel records...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Fuel Records
          </h1>

          <p className="mt-2 text-gray-500">
            Manage all vehicle fuel transactions.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Fuel Record
        </button>

      </div>

      <div className="flex justify-end">

        <input
          type="text"
          placeholder="Search fuel records..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-72 rounded-lg border px-4 py-2"
        />

      </div>

      {error && (
        <div className="rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      <FuelTable
        records={filteredFuelRecords}
        onView={openViewModal}
        onEdit={openEditModal}
        onDelete={deleteFuelRecord}
      />

      <FuelModal
        isOpen={isModalOpen}
        record={editingRecord}
        vehicles={vehicles}
        onSave={saveFuelRecord}
        onClose={closeModal}
      />

      <ViewFuelModal
        isOpen={isViewModalOpen}
        record={selectedRecord}
        onClose={closeViewModal}
      />

    </div>
  );
}

export default FuelRecords;