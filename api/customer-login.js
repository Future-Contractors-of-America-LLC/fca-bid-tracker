import { app } from "@azure/functions";
import {
  buildAuthBoundary,
  buildServerSession,
  createSessionCookie,
} from "./auth-boundary.js";
import { validateCustomerCredentials } from "./customer-account-store.js";

function sanitizeAccount(account) {
  if (!account) return null;

  return {
    email: account.email,
    company: account.company,
    role: account.role,
    customerId: account.customerId,
    workspaceLabel: account.workspaceLabel,
    selectedPlan: account.selectedPlan,
    enabledProducts: account.enabledProducts,
    enabledComms: account.enabledComms,
    accountMode: account.accountMode || "seeded",
  };
}

app.http("customer-login", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "customer-login",
  handler: async (request) => {
    if (request.method === "GET") {
      return {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
        jsonBody: {
          ok: true,
          route: "customer-login",
          authBoundary: buildAuthBoundary(),
          message: "POST authorized customer credentials to establish an FCA server session.",
        },
      };
    }

    const body = await request.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "").trim();

    if (!email || !password) {
      return {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
        },
        jsonBody: {
          ok: false,
          error: "Email and password are required.",
          route: "customer-login",
          authBoundary: buildAuthBoundary(),
        },
      };
    }

    const account = validateCustomerCredentials(email, password);

    if (!account) {
      return {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
        },
        jsonBody: {
          ok: false,
          error: "Invalid FCA customer credentials.",
          route: "customer-login",
          authBoundary: buildAuthBoundary(),
        },
      };
    }

    const safeAccount = sanitizeAccount(account);
    const { cookie } = createSessionCookie(account);

    return {
      status: 200,
      headers: {
        "Set-Cookie": cookie,
        "Cache-Control": "no-store",
      },
      jsonBody: {
        ok: true,
        route: "customer-login",
        account: safeAccount,
        session: buildServerSession(account),
        authenticationMode: account.authenticationMode || "server-session",
        authBoundary: buildAuthBoundary({
          activeMode: account.authenticationMode || buildAuthBoundary().activeMode,
        }),
      },
    };
  },
});
