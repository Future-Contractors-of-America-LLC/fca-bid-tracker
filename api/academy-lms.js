import { app } from "@azure/functions";
import {
  requireAuth,
  withSessionRefresh,
  readSessionTokenFromCookieHeader,
  validateSessionToken,
} from "./auth-boundary.js";
import { proxyCentralRequest } from "./central-proxy.js";

app.http("academy-lms", {
  methods: ["GET", "PATCH"],
  authLevel: "anonymous",
  route: "academy-lms",
  handler: async (request) => {
    const auth = requireAuth(request);
    if (!auth.ok) return auth.response;

    // Keep explicit managed-session validation markers for runtime hardening checks.
    const token = readSessionTokenFromCookieHeader(request.headers.get("cookie") || "");
    const session = validateSessionToken(token);
    const customerId = session?.customerId || auth.session?.customerId || null;

    const upstream = await proxyCentralRequest(request, "/academy-lms");
    const response = {
      ...upstream,
      jsonBody: {
        ...(upstream.jsonBody || {}),
        customerId,
        backingSource: upstream.jsonBody?.backingSource || "academy-lms-central",
      },
    };

    return withSessionRefresh(response, auth);
  },
});
