import { app } from "@azure/functions";
import { resolveSeededCustomerAccount } from "../src/customerAccounts.js";
import { buildAuthBoundary, buildServerSession, createSessionCookie } from "./auth-boundary.js";

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

    const account = resolveSeededCustomerAccount(payload?.email, payload?.password);

    if (!account) {
      return {
        status: 401,
        jsonBody: {
          ok: false,
          error: "The customer email or password is invalid.",
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
      },
      jsonBody: {
        ok: true,
        account,
        session: buildServerSession(account),
        authBoundary: buildAuthBoundary(),
        authenticationMode: "server-session",
        timestamp: new Date().toISOString(),
      },
    };
  },
});
