import { app } from "@azure/functions";
import { resolveSeededCustomerAccount } from "../src/customerAccounts.js";

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
        },
      };
    }

    return {
      status: 200,
      jsonBody: {
        ok: true,
        account,
        authenticationMode: "seeded-live-test-account",
        timestamp: new Date().toISOString(),
      },
    };
  },
});
