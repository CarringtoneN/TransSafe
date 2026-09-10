import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import useShifts from "../../features/shifts/hooks/useShifts";

import ShiftTable from "../../features/shifts/components/ShiftTable";
import ShiftModal from "../../features/shifts/components/ShiftModal";
import ViewShiftModal from "../../features/shifts/components/ViewShiftModal";

import shiftService from "../../services/shiftService";
import driverService from "../../services/driverService";
import vehicleService from "../../services/vehicleService";

function Shifts() {
  const {
    filteredShifts,
    search,
    setSearch,
    loading,
    error,
    loadShifts,
  } = useShifts();

  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [editingShift, setEditingShift] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    loadDrivers();
    loadVehicles();
  }, []);

  async function loadDrivers() {
    try {
      const data = await driverService.getAllDrivers();
      setDrivers(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadVehicles() {
    try {
      const data = await vehicleService.getAllVehicles();
      setVehicles(data);
    } catch (err) {
      console.error(err);
    }
  }

  function openAddModal() {
    setEditingShift(null);
    setIsModalOpen(true);
  }

  function openEditModal(shift) {
    setEditingShift(shift);
    setIsModalOpen(true);
  }

  function closeModal() {
    setEditingShift(null);
    setIsModalOpen(false);
  }

  function openViewModal(shift) {
    setSelectedShift(shift);
    setIsViewModalOpen(true);
  }

  function closeViewModal() {
    setSelectedShift(null);
    setIsViewModalOpen(false);
  }

  async function saveShift(data) {
    try {
      if (editingShift) {
        await shiftService.updateShift(editingShift.id, data);
      } else {
        await shiftService.createShift(data);
      }

      await loadShifts();

      closeModal();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to save shift."
      );
    }
  }

  async function deleteShift(id) {
    if (!window.confirm("Delete this shift?")) return;

    try {
      await shiftService.deleteShift(id);

      await loadShifts();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          err.message
      );
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        Loading shifts...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold text-slate-800">
            Driver Shifts
          </h1>

          <p className="mt-2 text-gray-500">
            Manage driver working shifts.
          </p>

        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Shift
        </button>

      </div>

      <div className="flex justify-end">

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-72 rounded-lg border px-4 py-2"
        />

      </div>

      {error && (
        <div className="rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      <ShiftTable
        shifts={filteredShifts}
        onView={openViewModal}
        onEdit={openEditModal}
        onDelete={deleteShift}
      />

      <ShiftModal
        isOpen={isModalOpen}
        shift={editingShift}
        drivers={drivers}
        vehicles={vehicles}
        onSave={saveShift}
        onClose={closeModal}
      />

      <ViewShiftModal
        isOpen={isViewModalOpen}
        shift={selectedShift}
        onClose={closeViewModal}
      />

    </div>
  );
}

export default Shifts;