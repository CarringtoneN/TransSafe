import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import useInspections from "../../features/inspections/hooks/useInspections";

import InspectionStats from "../../features/inspections/components/InspectionStats";
import InspectionTable from "../../features/inspections/components/InspectionTable";
import InspectionModal from "../../features/inspections/components/InspectionModal";
import ViewInspectionModal from "../../features/inspections/components/ViewInspectionModal";

import inspectionService from "../../services/inspectionService";
import driverService from "../../services/driverService";
import vehicleService from "../../services/vehicleService";

import Toast from "../../components/ui/Toast";

function VehicleInspections() {
  const {
    filteredInspections,
    search,
    setSearch,
    loading,
    error,
    loadInspections,
  } = useInspections();

  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [editingInspection, setEditingInspection] = useState(null);
  const [selectedInspection, setSelectedInspection] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [activeFilter, setActiveFilter] = useState("ALL");

  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  function showToast(message, type = "success") {
    setToast({
      isVisible: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        isVisible: false,
      }));
    }, 3000);
  }

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
    setEditingInspection(null);
    setIsModalOpen(true);
  }

  function openEditModal(inspection) {
    setEditingInspection(inspection);
    setIsModalOpen(true);
  }

  function closeModal() {
    setEditingInspection(null);
    setIsModalOpen(false);
  }

  function openViewModal(inspection) {
    setSelectedInspection(inspection);
    setIsViewModalOpen(true);
  }

  function closeViewModal() {
    setSelectedInspection(null);
    setIsViewModalOpen(false);
  }

  async function saveInspection(data) {
    try {
      if (editingInspection) {
        await inspectionService.updateInspection(
          editingInspection.id,
          data
        );

        showToast("Inspection updated successfully.");
      } else {
        await inspectionService.createInspection(data);

        showToast("Inspection created successfully.");
      }

      await loadInspections();

      closeModal();
    } catch (err) {
      console.error(err);

      showToast(
        err.response?.data?.message ||
          err.message ||
          "Failed to save inspection.",
        "error"
      );
    }
  }

  async function deleteInspection(id) {
    if (!window.confirm("Delete this inspection?")) return;

    try {
      await inspectionService.deleteInspection(id);

      await loadInspections();

      showToast("Inspection deleted successfully.");
    } catch (err) {
      console.error(err);

      showToast(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete inspection.",
        "error"
      );
    }
  }

  const displayedInspections = useMemo(() => {
    if (activeFilter === "PASS") {
      return filteredInspections.filter(
        (inspection) =>
          inspection.overallStatus === "PASS"
      );
    }

    if (activeFilter === "FAIL") {
      return filteredInspections.filter(
        (inspection) =>
          inspection.overallStatus === "FAIL"
      );
    }

    return filteredInspections;
  }, [filteredInspections, activeFilter]);

  if (loading) {
    return (
      <div className="p-6">
        Loading vehicle inspections...
      </div>
    );
  }

  return (
    <>
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
      />

      <div className="space-y-6">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-3xl font-bold text-slate-800">
              Vehicle Inspections
            </h1>

            <p className="mt-2 text-gray-500">
              Manage daily vehicle inspections.
            </p>

          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            New Inspection
          </button>

        </div>

        <InspectionStats
          inspections={filteredInspections}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        <div className="flex justify-end">

          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-80 rounded-lg border px-4 py-2"
          />

        </div>

        {error && (
          <div className="rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        <InspectionTable
          inspections={displayedInspections}
          onView={openViewModal}
          onEdit={openEditModal}
          onDelete={deleteInspection}
        />

        <InspectionModal
          isOpen={isModalOpen}
          inspection={editingInspection}
          vehicles={vehicles}
          drivers={drivers}
          onSave={saveInspection}
          onClose={closeModal}
        />

        <ViewInspectionModal
          isOpen={isViewModalOpen}
          inspection={selectedInspection}
          onClose={closeViewModal}
        />

      </div>
    </>
  );
}

export default VehicleInspections;