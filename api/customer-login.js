import { app } from "@azure/functions";
import { resolveSeededCustomerAccount } from "../src/customerAccounts.js";
import { buildAuthBoundary, buildSandboxSession } from "./auth-boundary.js";

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

    return {
      status: 200,
      jsonBody: {
        ok: true,
        account,
        session: buildSandboxSession(account),
        authBoundary: buildAuthBoundary({
          sessionValidation: "seeded-sandbox",
        }),
        authenticationMode: "seeded-live-test-account",
        timestamp: new Date().toISOString(),
      },
    };
  },
});
