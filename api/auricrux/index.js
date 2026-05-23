import { app } from "@azure/functions";

app.http("auricrux", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "auricrux",
  handler: async (request, context) => {
    return {
      status: 200,
      jsonBody: {
        ok: true,
        message: "Auricrux API ONLINE"
      }
    };
  }
});
