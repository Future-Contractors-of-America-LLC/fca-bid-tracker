import { verifySessionToken } from "./sessionTokens.js";

export function readBearerToken(request) {
  const header = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!header) return null;

  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export function unauthorizedResponse(message = "Bearer token is required.") {
  return {
    status: 401,
    jsonBody: {
      ok: false,
      error: message,
    },
  };
}

export function resolveAuthenticatedSession(request) {
  if (!process.env.FCA_AUTH_SESSION_SECRET) {
    return {
      ok: false,
      response: {
        status: 503,
        jsonBody: {
          ok: false,
          error: "True customer auth session verification is not configured in this environment.",
        },
      },
    };
  }

  const token = readBearerToken(request);
  if (!token) {
    return {
      ok: false,
      response: unauthorizedResponse(),
    };
  }

  let session = null;
  try {
    session = verifySessionToken(token);
  } catch {
    session = null;
  }

  if (!session) {
    return {
      ok: false,
      response: unauthorizedResponse("Session token is invalid or expired."),
    };
  }

  return {
    ok: true,
    token,
    session,
  };
}
