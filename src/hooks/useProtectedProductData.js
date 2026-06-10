import { useEffect, useState } from "react";

function resolveStatusFromResponse(response, payload) {
  if (response.ok && payload?.ok) return "ready";
  if (response.status === 401) return "unauthorized";
  if (response.status === 403) return "forbidden";
  if (response.status === 503) return "unavailable";
  return "error";
}

export default function useProtectedProductData({ endpoint, session, productLabel }) {
  const [state, setState] = useState({
    status: "idle",
    source: "pending",
    data: null,
    error: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!session?.authenticated) {
        setState({
          status: "signed-out",
          source: "no-session",
          data: null,
          error: "Customer session is required.",
        });
        return;
      }

      if (!session?.authToken) {
        setState({
          status: "seeded",
          source: "seeded-continuity-session",
          data: null,
          error: `${productLabel} is running in seeded continuity mode without protected backend auth.`,
        });
        return;
      }

      setState((prev) => ({
        ...prev,
        status: "loading",
        source: "protected-fetch",
        error: "",
      }));

      try {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.authToken}`,
          },
        });

        const payload = await response.json().catch(() => null);
        if (cancelled) return;

        const nextStatus = resolveStatusFromResponse(response, payload);
        setState({
          status: nextStatus,
          source: response.ok && payload?.ok
            ? (payload?.persistence?.repositoryMode || payload?.persistence?.persistenceMode || "entitlement-checked-backend")
            : "protected-fetch",
          data: response.ok && payload?.ok ? payload : null,
          error: response.ok && payload?.ok ? "" : payload?.error || `${productLabel} protected data could not be loaded.`,
        });
      } catch {
        if (cancelled) return;
        setState({
          status: "error",
          source: "protected-fetch",
          data: null,
          error: `${productLabel} protected data request failed before a valid response was returned.`,
        });
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [endpoint, productLabel, session]);

  return state;
}
