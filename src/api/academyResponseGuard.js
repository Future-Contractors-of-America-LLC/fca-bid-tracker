/**
 * Shared response classifier for Academy / LMS clients.
 *
 * The Slice 07 (Academy / LMS) repair loop has reported a specific upstream
 * failure mode for ~94 consecutive runs: the SWA route shell renders OK but
 * the API probe sees "Unexpected end of JSON input" - i.e. the upstream
 * returned a 2xx (or 5xx) response with an empty / non-JSON body.
 *
 * This helper recognizes that pattern so consumers can render a
 * customer-comprehension-positive degraded surface ("Academy services are
 * updating, your account is safe") instead of a generic "Unable to load"
 * error or a blank page.
 *
 * Continuity context: docs/SLICE_07_ACADEMY_PROTECTION.md.
 */

export const ACADEMY_DEGRADED_MESSAGE =
  "Academy services are updating. Your account, orders, and progress are safe — please try again in a few minutes.";

/**
 * Best-effort JSON parse that never throws.
 * Returns { payload, isEmptyBody, contentType }.
 */
export async function readAcademyResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.toLowerCase().includes("application/json");

  let text = "";
  try {
    text = await response.text();
  } catch {
    text = "";
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return { payload: null, isEmptyBody: true, contentType };
  }

  if (!isJson) {
    return { payload: null, isEmptyBody: false, contentType };
  }

  try {
    return { payload: JSON.parse(trimmed), isEmptyBody: false, contentType };
  } catch {
    return { payload: null, isEmptyBody: false, contentType };
  }
}

/**
 * Classify a response/payload pair against the known Slice 07 degraded
 * pattern. Returns null when the response is healthy and the payload looks
 * structurally complete; returns an object describing the degraded state
 * otherwise.
 */
export function classifyAcademyResponse(response, payload, isEmptyBody) {
  if (!response) {
    return { kind: "unreachable", retriable: true, customerMessage: ACADEMY_DEGRADED_MESSAGE };
  }
  if (isEmptyBody) {
    return {
      kind: "empty-body",
      retriable: true,
      status: response.status,
      customerMessage: ACADEMY_DEGRADED_MESSAGE,
    };
  }
  if (!response.ok && response.status >= 500) {
    return {
      kind: "upstream-5xx",
      retriable: true,
      status: response.status,
      customerMessage: ACADEMY_DEGRADED_MESSAGE,
    };
  }
  if (!response.ok && !payload) {
    return {
      kind: "non-json",
      retriable: true,
      status: response.status,
      customerMessage: ACADEMY_DEGRADED_MESSAGE,
    };
  }
  return null;
}

/**
 * Build an Error that carries the degraded-state metadata so React surfaces
 * (AcademyServiceStatusBanner, AcademyStore catch blocks, etc.) can render a
 * customer-friendly message without re-classifying the cause.
 */
export function academyDegradedError(classification, fallbackMessage) {
  const message = classification?.customerMessage || fallbackMessage || ACADEMY_DEGRADED_MESSAGE;
  const error = new Error(message);
  error.code = "academy-degraded";
  error.degraded = true;
  error.kind = classification?.kind || "unknown";
  error.retriable = classification?.retriable !== false;
  if (classification?.status) error.status = classification.status;
  return error;
}

export function isAcademyDegradedError(error) {
  return Boolean(error && error.degraded === true && error.code === "academy-degraded");
}
