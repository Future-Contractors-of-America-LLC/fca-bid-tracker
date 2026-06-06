import { app } from "@azure/functions";

function buildHealthPayload(method) {
  return {
    ok: true,
    service: "auricrux",
    route: "/api/auricrux",
    timestamp: new Date().toISOString(),
    mode: "anonymous-http",
    method,
    message: "Auricrux API online",
  };
}

app.http("auricrux", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "auricrux",
  handler: async (request) => {
    return {
      status: 200,
      jsonBody: buildHealthPayload(request.method),
    };
  },
});
