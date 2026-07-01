import { app } from "@azure/functions";
import { proxyCentralRequest } from "./central-proxy.js";

app.http("closeout-packages", {
  methods: ["GET", "POST", "PATCH"],
  authLevel: "anonymous",
  route: "closeout-packages",
  handler: async (request) => proxyCentralRequest(request, "/closeout-packages"),
});
