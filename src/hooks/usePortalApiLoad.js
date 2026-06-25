import { useCallback, useEffect, useState } from "react";

/**
 * Load portal data from Auricrux Central with explicit loading / error / retry states.
 * No localStorage or sample-data fallback.
 */
export default function usePortalApiLoad(loadFn, deps = []) {
  const [data, setData] = useState(null);
  const [backingSource, setBackingSource] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const reload = useCallback(() => {
    setStatus("loading");
    setError("");
    return loadFn()
      .then((payload) => {
        setData(payload);
        setBackingSource(payload?.backingSource || "auricrux-central");
        setStatus("ready");
        return payload;
      })
      .catch((err) => {
        setStatus("error");
        setError(err?.message || "Unable to reach the FCA workspace API.");
        return null;
      });
  }, deps);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setError("");
    loadFn()
      .then((payload) => {
        if (!active) return;
        setData(payload);
        setBackingSource(payload?.backingSource || "auricrux-central");
        setStatus("ready");
      })
      .catch((err) => {
        if (!active) return;
        setStatus("error");
        setError(err?.message || "Unable to reach the FCA workspace API.");
      });
    return () => {
      active = false;
    };
  }, deps);

  return { data, backingSource, status, error, reload, isLive: status === "ready" };
}
