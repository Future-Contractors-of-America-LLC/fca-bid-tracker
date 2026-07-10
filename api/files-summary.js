import { app } from "@azure/functions";
import { requireAuth, withSessionRefresh } from "./auth-boundary.js";
import { proxyCentralRequest } from "./central-proxy.js";

app.http("files-summary", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "files/summary",
  handler: async (request) => {
    const auth = requireAuth(request);
    if (!auth.ok) return auth.response;
    return withSessionRefresh(await proxyCentralRequest(request, "/files/summary"), auth);
  },
});
