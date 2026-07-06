import { app } from "@azure/functions";

app.http("internal-admin-ping-v4", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  route: "internal-admin/ping",
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
        route: "internal-admin/ping",
        ts: new Date().toISOString(),
      },
    };
  },
});
