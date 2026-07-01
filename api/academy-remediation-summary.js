import { app } from "@azure/functions";
import { proxyCentralRequest } from "./central-proxy.js";

app.http("academy-remediation-summary", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "academy/remediation-summary",
  handler: async (request) => proxyCentralRequest(request, "/academy/remediation-summary"),
});
