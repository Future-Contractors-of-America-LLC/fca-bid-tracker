import { app } from "@azure/functions";
import { proxyCentralRequest } from "./central-proxy.js";

const METHODS = ["GET", "POST", "PATCH", "OPTIONS"];

app.http("job-cost", {
  methods: METHODS,
  authLevel: "anonymous",
  route: "job-cost",
  handler: async (request) => {
    if (request.method === "OPTIONS") return { status: 204 };
    return proxyCentralRequest(request, "/job-cost");
  },
});
