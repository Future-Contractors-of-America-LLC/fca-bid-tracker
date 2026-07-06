import { app } from "@azure/functions";

app.http("diag-canary-v4", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  route: "diag-canary",
  handler: async (request) => {
    if (request.method === "OPTIONS") return { status: 204 };
    return {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      jsonBody: {
        ok: true,
        route: "diag-canary",
        method: request.method || "GET",
        ts: new Date().toISOString(),
      },
    };
  },
});
