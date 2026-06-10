import { app } from "@azure/functions";
import { findCustomerUserByEmail, sanitizeCustomerUser } from "./lib/auth/customerUserStore.js";
import { verifyPassword } from "./lib/auth/passwords.js";
import { issueSessionToken } from "./lib/auth/sessionTokens.js";

app.http("customer-auth-login", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer-auth-login",
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

    if (!process.env.FCA_CUSTOMER_USERS_JSON || !process.env.FCA_AUTH_SESSION_SECRET) {
      return {
        status: 503,
        jsonBody: {
          ok: false,
          error: "True customer auth is not configured in this environment.",
        },
      };
    }

    const user = findCustomerUserByEmail(payload?.email);
    const isValid = user && user.status === "active" && verifyPassword(payload?.password, user.passwordHash);

    if (!isValid) {
      return {
        status: 401,
        jsonBody: {
          ok: false,
          error: "The customer email or password is invalid.",
        },
      };
    }

    const account = sanitizeCustomerUser(user);
    const token = issueSessionToken(account);

    return {
      status: 200,
      jsonBody: {
        ok: true,
        account,
        token,
        authenticationMode: "env-backed-customer-auth",
        timestamp: new Date().toISOString(),
      },
    };
  },
});
