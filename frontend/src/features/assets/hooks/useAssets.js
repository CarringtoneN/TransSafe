import { useEffect, useMemo, useState } from "react";
import assetService from "../../../services/assetService";

export default function useAssets() {
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAssets() {
    try {
      setLoading(true);
      setError("");

      const data = await assetService.getAllAssets();

      console.log("Assets received:", data);

      setAssets(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load assets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssets();
  }, []);

  const filteredAssets = useMemo(() => {
    if (!search) return assets;

    const term = search.toLowerCase();

    return assets.filter((asset) => {
      return (
        asset.assetTag.toLowerCase().includes(term) ||
        asset.name.toLowerCase().includes(term) ||
        asset.category.toLowerCase().includes(term)
      );
    });
  }, [assets, search]);

  return {
    assets,
    filteredAssets,
    search,
    setSearch,
    loading,
    error,
    loadAssets,
  };
}