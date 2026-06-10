import { app } from "@azure/functions";
import { buildAuthBoundary } from "./auth-boundary.js";

function resolveMessage(authBoundary) {
  if (authBoundary.productionAuthReady) {
    return "Managed customer authentication is configured and production-ready in repo logic. Runtime verification is the next step.";
  }

  if (authBoundary.activeMode === "managed-server-session-with-fallback-secret") {
    return "Managed customer accounts are configured, but the deployment is still using a fallback session secret. Set FCA_SESSION_SECRET to finish the auth promotion.";
  }

  return "Managed customer authentication is not configured yet. Seeded sandbox validation remains the active fallback mode.";
}

app.http("customer-auth-state", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer-auth-state",
  handler: async () => {
    const authBoundary = buildAuthBoundary();

    return {
      status: 200,
      jsonBody: {
        ok: true,
        authBoundary,
        message: resolveMessage(authBoundary),
      },
    };
  },
});
