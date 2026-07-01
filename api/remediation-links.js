import { app } from "@azure/functions";
import { proxyCentralRequest } from "./central-proxy.js";

app.http("remediation-links", {
  methods: ["GET", "POST", "PATCH"],
  authLevel: "anonymous",
  route: "remediation-links",
  handler: async (request) => proxyCentralRequest(request, "/remediation-links"),
});
