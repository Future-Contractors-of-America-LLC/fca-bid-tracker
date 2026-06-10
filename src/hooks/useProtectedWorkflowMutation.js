import { useCallback, useState } from "react";

export default function useProtectedWorkflowMutation(session) {
  const [lastMutation, setLastMutation] = useState(null);

  const execute = useCallback(async ({ endpoint, payload, fallbackLabel = "seeded-continuity-mode" }) => {
    if (!session?.authenticated) {
      const result = {
        ok: false,
        mode: "signed-out",
        error: "Customer session is required before workflow actions can run.",
      };
      setLastMutation(result);
      return result;
    }

    if (!session?.authToken) {
      const result = {
        ok: true,
        mode: fallbackLabel,
        accepted: false,
        detail: "Protected backend mutation unavailable; using seeded continuity mutation path.",
      };
      setLastMutation(result);
      return result;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.authToken}`,
        },
        body: JSON.stringify(payload || {}),
      });

      const data = await response.json().catch(() => null);
      const result = response.ok && data?.ok
        ? {
            ok: true,
            mode: data.executionMode || "protected-backend-starter",
            accepted: true,
            data,
          }
        : {
            ok: false,
            mode: "protected-backend-error",
            error: data?.error || "Protected workflow action failed.",
            status: response.status,
          };

      setLastMutation(result);
      return result;
    } catch {
      const result = {
        ok: false,
        mode: "protected-backend-error",
        error: "Protected workflow action request failed.",
      };
      setLastMutation(result);
      return result;
    }
  }, [session]);

  return {
    lastMutation,
    execute,
  };
}
