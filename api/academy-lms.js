import { app } from "@azure/functions";
import { requireAuth, withSessionRefresh } from "./auth-boundary.js";
import { proxyCentralRequest } from "./central-proxy.js";

app.http("academy-lms", {
  methods: ["GET", "PATCH"],
  authLevel: "anonymous",
  route: "academy-lms",
  handler: async (request) => {
    const auth = requireAuth(request);
    if (!auth.ok) return auth.response;
    return withSessionRefresh(await proxyCentralRequest(request, "/academy-lms"), auth);
  },
});
