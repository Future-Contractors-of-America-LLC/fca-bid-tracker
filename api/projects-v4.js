import { app } from "@azure/functions";
import { proxyCentralRequest } from "./central-proxy.js";

app.http("projects-v4", {
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  authLevel: "anonymous",
  route: "projects",
  handler: async (request) => {
    if (request.method === "OPTIONS") return { status: 204 };
    return proxyCentralRequest(request, "/projects");
  },
});
