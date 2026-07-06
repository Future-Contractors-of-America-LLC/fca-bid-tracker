import { app } from "@azure/functions";
import { buildAuthBoundary, buildServerSession, createSessionCookie } from "./auth-boundary.js";
import { verifyLoginChallenge } from "./verification-challenges.js";

app.http("customer-verify", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer-verify",
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

    const challengeId = String(payload?.challengeId || "").trim();
    const code = String(payload?.code || "").trim();
    if (!challengeId || !code) {
      return {
        status: 400,
        jsonBody: {
          ok: false,
          error: "challengeId and code are required.",
          authBoundary: buildAuthBoundary(),
        },
      };
    }

    const account = verifyLoginChallenge(challengeId, code);
    if (!account) {
      return {
        status: 401,
        jsonBody: {
          ok: false,
          error: "Invalid or expired verification code.",
          authBoundary: buildAuthBoundary(),
        },
      };
    }

    const { token, cookie } = createSessionCookie(account);
    return {
      status: 200,
      headers: {
        "Set-Cookie": cookie,
        "Cache-Control": "no-store",
      },
      jsonBody: {
        ok: true,
        sessionToken: token,
        accessToken: token,
        account,
        session: buildServerSession(account),
        authBoundary: buildAuthBoundary(),
        authenticationMode: account.authenticationMode || "server-session",
        timestamp: new Date().toISOString(),
      },
    };
  },
});
