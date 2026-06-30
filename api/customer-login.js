import { app } from "@azure/functions";
import { validateCustomerCredentials } from "./customer-account-store.js";
import { buildAuthBoundary, buildServerSession, createSessionCookie } from "./auth-boundary.js";
import { createLoginChallenge } from "./verification-challenges.js";
import { writeAuthAuditEvent } from "./auth-audit.js";

function login2faRequired(account) {
  if (["1", "true", "yes"].includes(String(process.env.FCA_DISABLE_LOGIN_2FA || "").toLowerCase())) {
    return false;
  }
  return account?.accountMode !== "seeded";
}

app.http("customer-login", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer-login",
  handler: async (request) => {
    let payload;

    try {
      payload = await request.json();
    } catch {
      return {
        status: 400,
        jsonBody: {
          ok: false,
          error: "A valid JSON payload is required.",
          authBoundary: buildAuthBoundary(),
        },
      };
    }

    const account = validateCustomerCredentials(payload?.email, payload?.password);

    if (!account) {
      writeAuthAuditEvent({ eventType: "login_failure", role: null, request, reason: "invalid-credentials" });
      return {
        status: 401,
        jsonBody: {
          ok: false,
          error: "The customer email or password is invalid.",
          authBoundary: buildAuthBoundary(),
        },
      };
    }

    if (login2faRequired(account)) {
      const challenge = createLoginChallenge(account);
      return {
        status: 200,
        jsonBody: {
          ok: true,
          requiresVerification: true,
          ...challenge,
          authBoundary: buildAuthBoundary(),
          timestamp: new Date().toISOString(),
        },
      };
    }

    const { token, cookie } = createSessionCookie(account);
    writeAuthAuditEvent({ eventType: "login_success", role: account.role, token, request });

    return {
      status: 200,
      headers: {
        "Set-Cookie": cookie,
        "Cache-Control": "no-store",
      },
      jsonBody: {
        ok: true,
        account,
        session: buildServerSession(account),
        authBoundary: buildAuthBoundary(),
        authenticationMode: account.authenticationMode || "server-session",
        timestamp: new Date().toISOString(),
      },
    };
  },
});
