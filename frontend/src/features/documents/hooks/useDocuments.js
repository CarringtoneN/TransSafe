import { useEffect, useMemo, useState } from "react";
import documentService from "../../../services/documentService";

export default function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDocuments() {
    try {
      setLoading(true);
      setError("");

      const data = await documentService.getAllDocuments();

      console.log("Documents received:", data);

      setDocuments(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  const filteredDocuments = useMemo(() => {
    if (!search) return documents;

    const term = search.toLowerCase();

    return documents.filter((document) => {
      const vehicle =
        document.vehicle?.registration?.toLowerCase() || "";

      return (
        document.documentName.toLowerCase().includes(term) ||
        document.documentType.toLowerCase().includes(term) ||
        vehicle.includes(term)
      );
    });
  }, [documents, search]);

  return {
    documents,
    filteredDocuments,
    search,
    setSearch,
    loading,
    error,
    loadDocuments,
  };
}