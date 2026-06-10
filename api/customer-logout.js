import { app } from "@azure/functions";
import { buildAuthBoundary, clearSessionCookie } from "./auth-boundary.js";

app.http("customer-logout", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer-logout",
  handler: async () => {
    return {
      status: 200,
      headers: {
        "Set-Cookie": clearSessionCookie(),
        "Cache-Control": "no-store",
      },
      jsonBody: {
        ok: true,
        authBoundary: buildAuthBoundary(),
      },
    };
  },
});
