import { app } from "@azure/functions";
import {
  buildAuthBoundary,
  buildServerSession,
  readSessionTokenFromCookieHeader,
  validateSessionToken,
} from "./auth-boundary.js";

app.http("customer-session", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer-session",
  handler: async (request) => {
    const cookieHeader = request.headers.get("cookie") || "";
    const token = readSessionTokenFromCookieHeader(cookieHeader);
    const payload = validateSessionToken(token);

    if (!payload) {
      return {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
        jsonBody: {
          ok: true,
          authenticated: false,
          session: buildServerSession(null),
          authBoundary: buildAuthBoundary(),
        },
      };
    }

    const account = {
      email: payload.email,
      company: payload.company,
      role: payload.role,
      customerId: payload.customerId,
      workspaceLabel: payload.workspaceLabel,
      selectedPlan: payload.selectedPlan,
      enabledProducts: payload.enabledProducts,
      enabledComms: payload.enabledComms,
      accountMode: payload.accountMode,
      cteProgramEnabled: payload.cteProgramEnabled === true,
      issuedAt: payload.issuedAt,
      accessTokenExpiresAt: payload.accessTokenExpiresAt,
      refreshTokenExpiresAt: payload.refreshTokenExpiresAt,
      authEpoch: payload.authEpoch,
      sessionVersion: payload.sessionVersion,
    };

    return {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
      jsonBody: {
        ok: true,
        authenticated: true,
        account,
        session: buildServerSession(account),
        authBoundary: buildAuthBoundary(),
      },
    };
  },
});
