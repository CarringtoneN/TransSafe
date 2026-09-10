import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import useAssets from "../../features/assets/hooks/useAssets";

import AssetTable from "../../features/assets/components/AssetTable";
import AssetModal from "../../features/assets/components/AssetModal";
import ViewAssetModal from "../../features/assets/components/ViewAssetModal";

import assetService from "../../services/assetService";
import vehicleService from "../../services/vehicleService";

function FleetAssets() {
  const {
    filteredAssets,
    search,
    setSearch,
    loading,
    error,
    loadAssets,
  } = useAssets();

  const [vehicles, setVehicles] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  async function loadVehicles() {
    try {
      const data = await vehicleService.getAllVehicles();
      setVehicles(data);
    } catch (err) {
      console.error("LOAD VEHICLES ERROR");
      console.error(err);
    }
  }

  function openAddModal() {
    setEditingAsset(null);
    setIsModalOpen(true);
  }

  function openEditModal(asset) {
    setEditingAsset(asset);
    setIsModalOpen(true);
  }

  function closeModal() {
    setEditingAsset(null);
    setIsModalOpen(false);
  }

  function openViewModal(asset) {
    setSelectedAsset(asset);
    setIsViewModalOpen(true);
  }

  function closeViewModal() {
    setSelectedAsset(null);
    setIsViewModalOpen(false);
  }

  async function saveAsset(asset) {
    try {
      console.log("================================");
      console.log("SAVING ASSET");
      console.log(asset);
      console.log("================================");

      if (editingAsset) {
        await assetService.updateAsset(editingAsset.id, asset);
      } else {
        await assetService.createAsset(asset);
      }

      await loadAssets();
      closeModal();

      alert("Asset saved successfully.");

    } catch (err) {
      console.error("SAVE ASSET ERROR");
      console.error(err);
      console.error(err.response);

      const message =
        err.response?.data?.message ||
        JSON.stringify(err.response?.data) ||
        err.message;

      alert(message);
    }
  }

  async function deleteAsset(id) {
    if (!window.confirm("Delete this asset?")) return;

    try {
      await assetService.deleteAsset(id);

      await loadAssets();

      alert("Asset deleted successfully.");

    } catch (err) {
      console.error("DELETE ASSET ERROR");
      console.error(err);
      console.error(err.response);

      const message =
        err.response?.data?.message ||
        JSON.stringify(err.response?.data) ||
        err.message;

      alert(message);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        Loading assets...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Fleet Assets
          </h1>

          <p className="mt-2 text-gray-500">
            Manage all fleet assets.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Asset
        </button>

      </div>

      <div className="flex justify-end">
        <input
          type="text"
          placeholder="Search assets..."
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

      <AssetTable
        assets={filteredAssets}
        onView={openViewModal}
        onEdit={openEditModal}
        onDelete={deleteAsset}
      />

      <AssetModal
        isOpen={isModalOpen}
        asset={editingAsset}
        vehicles={vehicles}
        onSave={saveAsset}
        onClose={closeModal}
      />

      <ViewAssetModal
        isOpen={isViewModalOpen}
        asset={selectedAsset}
        onClose={closeViewModal}
      />

    </div>
  );
}

export default FleetAssets;