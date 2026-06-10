import { app } from "@azure/functions";
import { verifySessionToken } from "./lib/auth/sessionTokens.js";

function readBearerToken(request) {
  const header = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

app.http("customer-auth-session", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer-auth-session",
  handler: async (request) => {
    if (!process.env.FCA_AUTH_SESSION_SECRET) {
      return {
        status: 503,
        jsonBody: {
          ok: false,
          error: "True customer auth session verification is not configured in this environment.",
        },
      };
    }

    const token = readBearerToken(request);
    if (!token) {
      return {
        status: 401,
        jsonBody: {
          ok: false,
          error: "Bearer token is required.",
        },
      };
    }

    let session;
    try {
      session = verifySessionToken(token);
    } catch {
      session = null;
    }

    if (!session) {
      return {
        status: 401,
        jsonBody: {
          ok: false,
          error: "Session token is invalid or expired.",
        },
      };
    }

    return {
      status: 200,
      jsonBody: {
        ok: true,
        session,
        authenticationMode: "env-backed-customer-auth",
        timestamp: new Date().toISOString(),
      },
    };
  },
});
