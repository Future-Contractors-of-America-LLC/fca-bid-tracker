export function unauthorizedResponse(message = "Valid x-fca-state-api-key header is required.") {
  return {
    status: 401,
    jsonBody: {
      ok: false,
      error: message,
    },
  };
}

export function requireServiceApiKey(request) {
  const configuredKey = process.env.FCA_DURABLE_STATE_SERVICE_API_KEY;
  if (!configuredKey) {
    return {
      ok: false,
      response: {
        status: 503,
        jsonBody: {
          ok: false,
          error: "Durable state service API key is not configured.",
        },
      },
    };
  }

  const providedKey = request.headers.get("x-fca-state-api-key");
  if (!providedKey || providedKey !== configuredKey) {
    return {
      ok: false,
      response: unauthorizedResponse(),
    };
  }

  return { ok: true };
}
