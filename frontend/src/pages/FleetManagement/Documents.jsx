import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import useDocuments from "../../features/documents/hooks/useDocuments";

import DocumentTable from "../../features/documents/components/DocumentTable";
import DocumentModal from "../../features/documents/components/DocumentModal";
import ViewDocumentModal from "../../features/documents/components/ViewDocumentModal";

import documentService from "../../services/documentService";
import vehicleService from "../../services/vehicleService";

function Documents() {
  const {
    filteredDocuments,
    search,
    setSearch,
    loading,
    error,
    loadDocuments,
  } = useDocuments();

  const [vehicles, setVehicles] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

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
    setEditingDocument(null);
    setIsModalOpen(true);
  }

  function openEditModal(document) {
    setEditingDocument(document);
    setIsModalOpen(true);
  }

  function closeModal() {
    setEditingDocument(null);
    setIsModalOpen(false);
  }

  function openViewModal(document) {
    setSelectedDocument(document);
    setIsViewModalOpen(true);
  }

  function closeViewModal() {
    setSelectedDocument(null);
    setIsViewModalOpen(false);
  }

  async function saveDocument(document) {
    try {
      if (editingDocument) {
        await documentService.updateDocument(
          editingDocument.id,
          document
        );
      } else {
        await documentService.createDocument(document);
      }

      await loadDocuments();
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to save document.");
    }
  }

  async function deleteDocument(id) {
    if (!window.confirm("Delete this document?")) return;

    try {
      await documentService.deleteDocument(id);
      await loadDocuments();
    } catch (err) {
      console.error(err);
      alert("Failed to delete document.");
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        Loading documents...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Vehicle Documents
          </h1>

          <p className="mt-2 text-gray-500">
            Manage insurance, road licenses, inspections and other vehicle documents.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Document
        </button>

      </div>

      <div className="flex justify-end">

        <input
          type="text"
          placeholder="Search documents..."
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

      <DocumentTable
        documents={filteredDocuments}
        onView={openViewModal}
        onEdit={openEditModal}
        onDelete={deleteDocument}
      />

      <DocumentModal
        isOpen={isModalOpen}
        document={editingDocument}
        vehicles={vehicles}
        onSave={saveDocument}
        onClose={closeModal}
      />

      <ViewDocumentModal
        isOpen={isViewModalOpen}
        document={selectedDocument}
        onClose={closeViewModal}
      />

    </div>
  );
}

export default Documents;