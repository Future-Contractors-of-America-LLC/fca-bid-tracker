import { app } from "@azure/functions";
import { requireAuth, withSessionRefresh } from "./auth-boundary.js";
import { proxyCentralRequest } from "./central-proxy.js";

app.http("audit-events-summary", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "audit-events/summary",
  handler: async (request) => {
    const auth = requireAuth(request);
    if (!auth.ok) return auth.response;
    return withSessionRefresh(await proxyCentralRequest(request, "/audit-events-summary"), auth);
  },
});
