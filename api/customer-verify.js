import { app } from "@azure/functions";
import { buildAuthBoundary, buildServerSession, createSessionCookie } from "./auth-boundary.js";
import { verifyLoginChallenge } from "./verification-challenges.js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Access-Control-Max-Age": "86400",
};

app.http("customer-verify", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "customer-verify",
  handler: async (request) => {
    if (request.method === "OPTIONS") {
      return { status: 204, headers: CORS_HEADERS };
    }

    let payload;
    // Use request.text() + manual parse instead of request.json() for mobile
    // cross-origin compatibility — request.json() can fail when Content-Type is
    // missing or the stream is not fully buffered before parsing.
    const rawBody = await request.text();
    try {
      payload = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      return {
        status: 400,
        headers: CORS_HEADERS,
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
        headers: CORS_HEADERS,
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
        headers: CORS_HEADERS,
        jsonBody: {
          ok: false,
          error: "Invalid or expired verification code.",
          authBoundary: buildAuthBoundary(),
        },
      };
    }

    const { cookie } = createSessionCookie(account);
    return {
      status: 200,
      headers: {
        "Set-Cookie": cookie,
        "Cache-Control": "no-store",
        ...CORS_HEADERS,
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
