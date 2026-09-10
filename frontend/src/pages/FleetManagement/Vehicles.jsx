import VehicleHeader from "../../features/vehicles/components/VehicleHeader";
import VehicleSearch from "../../features/vehicles/components/VehicleSearch";
import VehicleTable from "../../features/vehicles/components/VehicleTable";
import VehicleModal from "../../features/vehicles/components/VehicleModal";
import VehicleForm from "../../features/vehicles/components/VehicleForm";
import VehicleDetails from "../../features/vehicles/components/VehicleDetails";
import useVehicles from "../../features/vehicles/hooks/useVehicles";

function Vehicles() {
  const {
    filteredVehicles,
    search,
    setSearch,
    loading,
    error,
    isModalOpen,
    editingVehicle,
    selectedVehicle,
    isViewModalOpen,
    openAddModal,
    openEditModal,
    openViewModal,
    closeModal,
    closeViewModal,
    saveVehicle,
    deleteVehicle,
  } = useVehicles();

  return (
    <div className="space-y-6">
      <VehicleHeader onAddVehicle={openAddModal} />

      <VehicleSearch
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <VehicleTable
        vehicles={filteredVehicles}
        loading={loading}
        onView={openViewModal}
        onEdit={openEditModal}
        onDelete={deleteVehicle}
      />

      <VehicleModal
        isOpen={isModalOpen}
        title={editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
        onClose={closeModal}
      >
        <VehicleForm
          vehicle={editingVehicle}
          onSave={saveVehicle}
          onCancel={closeModal}
        />
      </VehicleModal>

      <VehicleModal
        isOpen={isViewModalOpen}
        title="Vehicle Details"
        onClose={closeViewModal}
      >
        <VehicleDetails vehicle={selectedVehicle} />
      </VehicleModal>
    </div>
  );
}

export default Vehicles;
