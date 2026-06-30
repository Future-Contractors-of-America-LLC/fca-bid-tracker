import { app } from "@azure/functions";
import { requireAuth } from "./auth-boundary.js";
import { proxyCentralRequest } from "./central-proxy.js";

const METHODS = ["GET", "POST", "PATCH", "OPTIONS"];

app.http("bids", {
  methods: METHODS,
  authLevel: "anonymous",
  route: "bids",
  handler: async (request) => {
    if (request.method === "OPTIONS") return { status: 204 };
    const auth = requireAuth(request);
    if (!auth.ok) return auth.response;
    return proxyCentralRequest(request, "/bids");
  },
});
