import { app } from "@azure/functions";
import { proxyCentralRequest } from "./central-proxy.js";

app.http("stripe-checkout-v4", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "stripe-checkout",
  handler: async (request) => {
    if (request.method === "OPTIONS") return { status: 204 };
    return proxyCentralRequest(request, "/stripe-checkout");
  },
});
