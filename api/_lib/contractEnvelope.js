function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function normalizeContractEnvelope(response, { defaultStatus = 200 } = {}) {
  const status = Number(response?.status) || defaultStatus;
  const body = isObject(response?.jsonBody) ? response.jsonBody : {};
  const ok = typeof body.ok === "boolean" ? body.ok : status >= 200 && status < 400;
  const error = body.error ?? (ok ? null : `Request failed with status ${status}.`);

  return {
    ...(isObject(response) ? response : {}),
    status,
    jsonBody: {
      ...body,
      status,
      ok,
      error,
    },
  };
}