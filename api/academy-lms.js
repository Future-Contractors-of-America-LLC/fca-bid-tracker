import { app } from "@azure/functions";
import {
  readSessionTokenFromCookieHeader,
  requireAuth,
  validateSessionToken,
  withSessionRefresh,
} from "./auth-boundary.js";
import { proxyCentralRequest } from "./central-proxy.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

app.http("academy-lms", {
  methods: ["GET", "HEAD", "PATCH", "OPTIONS"],
  authLevel: "anonymous",
  route: "academy-lms",
  handler: async (request) => {
    const method = String(request.method || "GET").toUpperCase();
    if (method === "OPTIONS") {
      return { status: 204, headers: corsHeaders };
    }

    const cookieHeader = request.headers.get("cookie") || "";
    const sessionPayload = validateSessionToken(readSessionTokenFromCookieHeader(cookieHeader));
    const customerId = sessionPayload?.customerId || null;
    const backingSource = customerId ? "managed-server-session" : "missing-session";

    if (method === "HEAD") {
      const response = await proxyCentralRequest(request, "/academy-lms");
      return {
        status: response.status,
        headers: {
          ...corsHeaders,
          "x-fca-backing-source": backingSource,
          ...(customerId ? { "x-fca-customer-id": customerId } : {}),
        },
      };
    }

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
