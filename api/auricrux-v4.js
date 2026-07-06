import { app } from "@azure/functions";
import { proxyCentralRequest } from "./central-proxy.js";

app.http("auricrux-v4", {
  methods: ["GET", "POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "auricrux",
  handler: async (request) => {
    if (request.method === "OPTIONS") return { status: 204 };
    return proxyCentralRequest(request, "/auricrux");
  },
});
