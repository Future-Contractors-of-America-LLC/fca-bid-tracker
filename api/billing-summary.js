import { app } from "@azure/functions";
import { proxyCentralRequest } from "./central-proxy.js";

app.http("billing-summary", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "billing-summary",
  handler: async (request) => proxyCentralRequest(request, "/billing-summary"),
});
