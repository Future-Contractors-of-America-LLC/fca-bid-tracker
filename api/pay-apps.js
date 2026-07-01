import { app } from "@azure/functions";
import { proxyCentralRequest } from "./central-proxy.js";

app.http("pay-apps", {
  methods: ["GET", "POST", "PATCH"],
  authLevel: "anonymous",
  route: "pay-apps",
  handler: async (request) => proxyCentralRequest(request, "/pay-apps"),
});
