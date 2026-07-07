import { app } from "@azure/functions";
import { buildAuthBoundary, createSessionCookie } from "./auth-boundary.js";
import { validateCustomerCredentials } from "./customer-account-store.js";

function readString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function readQueryCredentials(request) {
  const url = new URL(request.url);
  return {
    email: readString(url.searchParams.get("email")).toLowerCase(),
    password: readString(url.searchParams.get("password")),
  };
}

function parseFormBody(rawBody) {
  const params = new URLSearchParams(rawBody);
  return {
    email: readString(params.get("email")).toLowerCase(),
    password: readString(params.get("password")),
  };
}

function parseJsonBody(rawBody) {
  const parsed = JSON.parse(rawBody);
  return {
    email: readString(parsed?.email).toLowerCase(),
    password: readString(parsed?.password),
  };
}

async function readCredentials(request) {
  const contentType = (request.headers.get("content-type") || "").toLowerCase();
  const queryCredentials = readQueryCredentials(request);
  const rawBody = await request.text();
  const trimmedBody = readString(rawBody);

  if (!trimmedBody) {
    return { ...queryCredentials, parseError: null };
  }

  const shouldParseAsJson = contentType.includes("application/json") || trimmedBody.startsWith("{");
  if (shouldParseAsJson) {
    try {
      const bodyCredentials = parseJsonBody(trimmedBody);
      return {
        email: bodyCredentials.email || queryCredentials.email,
        password: bodyCredentials.password || queryCredentials.password,
        parseError: null,
      };
    } catch {
      return {
        email: queryCredentials.email,
        password: queryCredentials.password,
        parseError: "Invalid JSON body. Send {\"email\":\"...\",\"password\":\"...\"} or form-encoded values.",
      };
    }
  }

  if (contentType.includes("application/x-www-form-urlencoded") || trimmedBody.includes("=")) {
    const bodyCredentials = parseFormBody(trimmedBody);
    return {
      email: bodyCredentials.email || queryCredentials.email,
      password: bodyCredentials.password || queryCredentials.password,
      parseError: null,
    };
  }

  return { ...queryCredentials, parseError: null };
}

function buildUnauthorizedResponse() {
  return {
    status: 401,
    headers: { "Cache-Control": "no-store" },
    jsonBody: {
      ok: false,
      error: "Invalid FCA customer credentials.",
      route: "customer-login",
      activeMode: "seeded-server-session",
    },
  };
}

app.http("customer-login", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "customer-login",
  handler: async (request) => {
    if (request.method.toUpperCase() !== "POST") {
      return {
        status: 200,
        headers: { "Cache-Control": "no-store" },
        jsonBody: {
          ok: true,
          route: "customer-login",
          activeMode: "seeded-server-session",
          message: "POST credentials to authenticate against managed or seeded FCA validation accounts.",
        },
      };
    }

    const { email, password, parseError } = await readCredentials(request);

    if (parseError) {
      return {
        status: 400,
        headers: { "Cache-Control": "no-store" },
        jsonBody: {
          ok: false,
          error: parseError,
          route: "customer-login",
          activeMode: "seeded-server-session",
        },
      };
    }

    if (!email || !password) {
      return {
        status: 400,
        headers: { "Cache-Control": "no-store" },
        jsonBody: {
          ok: false,
          error: "Email and password are required.",
          route: "customer-login",
          activeMode: "seeded-server-session",
        },
      };
    }

    const account = validateCustomerCredentials(email, password);
    if (!account) return buildUnauthorizedResponse();

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
        activeMode: account.authenticationMode || "seeded-server-session",
        authenticationMode: account.authenticationMode || "seeded-server-session",
        account,
        authBoundary: buildAuthBoundary(),
      },
    };
  },
});
