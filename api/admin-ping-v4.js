import { app } from "@azure/functions";

app.http("admin-ping-v4", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  route: "admin/ping",
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
        route: "admin/ping",
        ts: new Date().toISOString(),
      },
    };
  },
});
