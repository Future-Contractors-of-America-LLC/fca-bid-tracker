import { app } from "@azure/functions";
import {
  readSessionTokenFromCookieHeader,
  requireAuth,
  validateSessionToken,
  withSessionRefresh,
} from "./auth-boundary.js";
import { proxyCentralRequest } from "./central-proxy.js";

app.http("academy-lms", {
  methods: ["GET", "PATCH"],
  authLevel: "anonymous",
  route: "academy-lms",
  handler: async (request) => {
    const cookieHeader = request.headers.get("cookie") || "";
    const sessionPayload = validateSessionToken(readSessionTokenFromCookieHeader(cookieHeader));
    const customerId = sessionPayload?.customerId || null;
    const backingSource = customerId ? "managed-server-session" : "missing-session";
    const auth = requireAuth(request);
    if (!auth.ok) return auth.response;
    const response = await proxyCentralRequest(request, "/academy-lms");
    return withSessionRefresh(
      {
        ...response,
        headers: {
          ...(response.headers || {}),
          "x-fca-backing-source": backingSource,
          ...(customerId ? { "x-fca-customer-id": customerId } : {}),
        },
      },
      auth,
    );
  },
});
