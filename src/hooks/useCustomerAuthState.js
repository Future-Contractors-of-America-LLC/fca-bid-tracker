import { useEffect, useMemo, useState } from "react";
import { fetchCustomerAuthState } from "../api/authClient";

const fallbackState = {
  authBoundary: {
    productionAuthReady: false,
    activeMode: "server-session",
    identityProvider: "fca-native-auth",
    tenantIsolation: "single-repo-account-store",
    sessionValidation: "signed-http-only-cookie",
    nextBuildStep: "Move customer accounts and session secret into managed identity-backed storage.",
  },
  message: "Production customer authentication is not live yet. Sandbox validation remains the only active auth mode.",
};

const fallbackMeta = {
  backingSource: "fallback",
  lastSyncedAt: null,
  available: false,
};

function buildFallbackMeta() {
  return {
    ...fallbackMeta,
    lastSyncedAt: new Date().toISOString(),
  };
}

export default function useCustomerAuthState() {
  const [state, setState] = useState(fallbackState);
  const [meta, setMeta] = useState(fallbackMeta);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const payload = await fetchCustomerAuthState();
        if (!active) return;

        setState({
          authBoundary: payload.authBoundary || fallbackState.authBoundary,
          message: payload.message || fallbackState.message,
        });

        setMeta({
          backingSource: "api-customer-auth-state",
          lastSyncedAt: new Date().toISOString(),
          available: true,
        });
      } catch {
        if (!active) return;
        setState(fallbackState);
        setMeta(buildFallbackMeta());
      }
    }

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  return useMemo(() => ({ state, meta }), [state, meta]);
}
