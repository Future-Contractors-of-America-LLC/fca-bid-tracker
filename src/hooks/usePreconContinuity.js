import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchPreconContinuity, priceEstimateFromTakeoffs, syncTakeoffsToEstimate, tetherTakeoffToEstimate } from "../api/preconClient";

export default function usePreconContinuity(projectId) {
  const [continuity, setContinuity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!projectId) return null;
    setLoading(true);
    setError("");
    try {
      const payload = await fetchPreconContinuity(projectId);
      setContinuity(payload);
      return payload;
    } catch (refreshError) {
      setError(refreshError.message || "Unable to load precon continuity.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return useMemo(
    () => ({
      continuity,
      loading,
      error,
      refresh,
      async syncAll(estimateId) {
        const result = await syncTakeoffsToEstimate(projectId, estimateId ? { estimateId } : {});
        await refresh();
        return result;
      },
      async tetherOne(takeoffId, estimateId) {
        const result = await tetherTakeoffToEstimate(projectId, takeoffId, estimateId ? { estimateId } : {});
        await refresh();
        return result;
      },
      async priceEstimate(estimateId) {
        const result = await priceEstimateFromTakeoffs(projectId, estimateId ? { estimateId } : {});
        await refresh();
        return result;
      },
    }),
    [continuity, loading, error, projectId, refresh],
  );
}
