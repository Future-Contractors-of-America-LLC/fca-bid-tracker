import { app } from "@azure/functions";
import { validateCustomerCredentials } from "./customer-account-store.js";
import { buildAuthBoundary, buildServerSession, createSessionCookie } from "./auth-boundary.js";
import { createLoginChallenge } from "./verification-challenges.js";
import { writeAuthAuditEvent } from "./auth-audit.js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Access-Control-Max-Age": "86400",
};

function readString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseJsonPayload(rawBody) {
  const parsed = JSON.parse(rawBody);
  return {
    email: readString(parsed?.email).toLowerCase(),
    password: readString(parsed?.password),
  };
}

function parseFormPayload(rawBody) {
  const params = new URLSearchParams(rawBody);
  return {
    email: readString(params.get("email")).toLowerCase(),
    password: readString(params.get("password")),
  };
}

async function readCredentials(request) {
  const url = new URL(request.url);
  const queryEmail = readString(url.searchParams.get("email")).toLowerCase();
  const queryPassword = readString(url.searchParams.get("password"));
  const contentType = (request.headers.get("content-type") || "").toLowerCase();
  const rawBody = await request.text();
  const trimmedBody = readString(rawBody);

  if (!trimmedBody) {
    return { email: queryEmail, password: queryPassword, parseError: null };
  }

  const shouldParseAsJson = contentType.includes("application/json") || trimmedBody.startsWith("{");
  if (shouldParseAsJson) {
    try {
      const parsed = parseJsonPayload(trimmedBody);
      return {
        email: parsed.email || queryEmail,
        password: parsed.password || queryPassword,
        parseError: null,
      };
    } catch {
      if (trimmedBody.includes("=")) {
        const parsed = parseFormPayload(trimmedBody);
        return {
          email: parsed.email || queryEmail,
          password: parsed.password || queryPassword,
          parseError: null,
        };
      }
      return {
        email: queryEmail,
        password: queryPassword,
        parseError: "Invalid JSON body. Send {\"email\":\"...\",\"password\":\"...\"} or form-encoded values.",
      };
    }
  }

  if (contentType.includes("application/x-www-form-urlencoded") || trimmedBody.includes("=")) {
    const parsed = parseFormPayload(trimmedBody);
    return {
      email: parsed.email || queryEmail,
      password: parsed.password || queryPassword,
      parseError: null,
    };
  }

  return { email: queryEmail, password: queryPassword, parseError: null };
}

function login2faRequired(account) {
  if (["1", "true", "yes"].includes(String(process.env.FCA_DISABLE_LOGIN_2FA || "").toLowerCase())) {
    return false;
  }
  return account?.accountMode !== "seeded";
}

app.http("customer-login", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "customer-login",
  handler: async (request) => {
    if (request.method === "OPTIONS") {
      return { status: 204, headers: CORS_HEADERS };
    }

    const { email, password, parseError } = await readCredentials(request);

    if (parseError) {
      return {
        status: 400,
        headers: CORS_HEADERS,
        jsonBody: {
          ok: false,
          error: parseError,
          authBoundary: buildAuthBoundary(),
        },
      };
    }

    if (!email || !password) {
      return {
        status: 400,
        headers: CORS_HEADERS,
        jsonBody: {
          ok: false,
          error: "Email and password are required.",
          authBoundary: buildAuthBoundary(),
        },
      };
    }

    const account = validateCustomerCredentials(email, password);

    if (!account) {
      writeAuthAuditEvent({ eventType: "login_failure", role: null, request, reason: "invalid-credentials" });
      return {
        status: 401,
        headers: CORS_HEADERS,
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
        headers: CORS_HEADERS,
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
