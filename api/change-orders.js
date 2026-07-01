import { app } from "@azure/functions";
import { proxyCentralRequest } from "./central-proxy.js";

app.http("change-orders", {
  methods: ["GET", "POST", "PATCH"],
  authLevel: "anonymous",
  route: "change-orders",
  handler: async (request) => proxyCentralRequest(request, "/change-orders"),
});
