import { Plus } from "lucide-react";
import { useState } from "react";

import useDrivers from "../../features/drivers/hooks/useDrivers";

import DriverTable from "../../features/drivers/components/DriverTable";
import DriverModal from "../../features/drivers/components/DriverModal";
import ViewDriverModal from "../../features/drivers/components/ViewDriverModal";

import driverService from "../../services/driverService";

function Drivers() {
  const {
    filteredDrivers,
    search,
    setSearch,
    loading,
    error,
    loadDrivers,
  } = useDrivers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  function openAddModal() {
    setEditingDriver(null);
    setIsModalOpen(true);
  }

  function openEditModal(driver) {
    setEditingDriver(driver);
    setIsModalOpen(true);
  }

  function closeModal() {
    setEditingDriver(null);
    setIsModalOpen(false);
  }

  function openViewModal(driver) {
    setSelectedDriver(driver);
    setIsViewModalOpen(true);
  }

  function closeViewModal() {
    setSelectedDriver(null);
    setIsViewModalOpen(false);
  }

  async function saveDriver(driver) {
    try {
      if (editingDriver) {
        await driverService.updateDriver(
          editingDriver.id,
          driver
        );
      } else {
        await driverService.createDriver(driver);
      }

      await loadDrivers();
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to save driver.");
    }
  }

  async function deleteDriver(id) {
    if (!window.confirm("Delete this driver?")) return;

    try {
      await driverService.deleteDriver(id);
      await loadDrivers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete driver.");
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        Loading drivers...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Drivers
          </h1>

          <p className="mt-2 text-gray-500">
            Manage all company drivers.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Driver
        </button>

      </div>

      <div className="flex justify-end">

        <input
          type="text"
          placeholder="Search drivers..."
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

      <DriverTable
        drivers={filteredDrivers}
        onView={openViewModal}
        onEdit={openEditModal}
        onDelete={deleteDriver}
      />

      <DriverModal
        isOpen={isModalOpen}
        driver={editingDriver}
        onSave={saveDriver}
        onClose={closeModal}
      />

      <ViewDriverModal
        isOpen={isViewModalOpen}
        driver={selectedDriver}
        onClose={closeViewModal}
      />

    </div>
  );
}

export default Drivers;