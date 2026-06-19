import { useCallback, useEffect, useState } from "react";
import { fetchJobCosts } from "../api/constructionClient";

export default function useJobCost(projectId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!projectId) {
      setData(null);
      setLoading(false);
      return null;
    }
    setLoading(true);
    setError("");
    try {
      const payload = await fetchJobCosts(projectId);
      setData(payload);
      return payload;
    } catch (refreshError) {
      setError(refreshError.message || "Unable to load job cost.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh, rollup: data?.items?.[0] || null };
}
