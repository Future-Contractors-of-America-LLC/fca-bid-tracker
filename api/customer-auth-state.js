import { app } from "@azure/functions";
import { buildAuthBoundary } from "./auth-boundary.js";

app.http("customer-auth-state", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer-auth-state",
  handler: async () => {
    return {
      status: 200,
      jsonBody: {
        ok: true,
        authBoundary: buildAuthBoundary(),
        message: "Production customer authentication is not live yet. Sandbox validation remains the only active auth mode.",
      },
    };
  },
});
