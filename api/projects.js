import { app } from "@azure/functions";
import { proxyCentralRequest } from "./central-proxy.js";

const METHODS = ["GET", "POST", "PATCH", "OPTIONS"];

app.http("projects", {
  methods: METHODS,
  authLevel: "anonymous",
  route: "projects",
  handler: async (request) => {
    if (request.method === "OPTIONS") return { status: 204 };
    return proxyCentralRequest(request, "/projects");
  },
});
