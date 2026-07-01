import { app } from "@azure/functions";
import { proxyCentralRequest } from "./central-proxy.js";

app.http("warranty-cases", {
  methods: ["GET", "POST", "PATCH"],
  authLevel: "anonymous",
  route: "warranty-cases",
  handler: async (request) => proxyCentralRequest(request, "/warranty-cases"),
});
