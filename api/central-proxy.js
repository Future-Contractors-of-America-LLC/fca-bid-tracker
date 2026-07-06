/** Azure Functions v4 helper — forward requests to Auricrux Central. */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  enforceSecurityHardeningForFetchRequest,
  toFetchSecurityResponse,
} = require("./_lib/runtime/securityHardeningControls.js");
const {
  isCteShadowRequest,
  buildCteShadowResponse,
} = require("./_lib/runtime/cteShadowEnvironment.js");

export const CENTRAL_API =
  process.env.AURICRUX_CENTRAL_API ||
  "https://api.futurecontractorsofamerica.com/api";

async function readRequestBody(request) {
  if (request.method === "GET" || request.method === "HEAD") return {};
  const bodyText = await request.text();
  if (!bodyText) return {};
  try {
    return JSON.parse(bodyText);
  } catch {
    return { raw: bodyText };
  }
}

export async function proxyCentralRequest(request, resourcePath) {
  const security = await enforceSecurityHardeningForFetchRequest(request, {
    resourcePath,
    operation: "central-proxy-v4",
  });
  if (!security.allowed) {
    return toFetchSecurityResponse(security);
  }

  if (isCteShadowRequest(request)) {
    const requestBody = await readRequestBody(request);
    const shadowResponse = buildCteShadowResponse(request, resourcePath, requestBody);
    return {
      status: shadowResponse.status,
      headers: shadowResponse.headers,
      jsonBody: shadowResponse.body,
    };
  }

  const requestUrl = new URL(request.url);
  const [pathPart, resourceQuery = ""] = resourcePath.split("?");
  const targetUrl = new URL(`${CENTRAL_API}${pathPart}`);

  const merged = new URLSearchParams(resourceQuery);
  requestUrl.searchParams.forEach((value, key) => {
    merged.append(key, value);
  });
  targetUrl.search = merged.toString();
  const target = targetUrl.toString();

  const init = {
    method: request.method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    const body = await request.text();
    if (body) init.body = body;
  }

  const response = await fetch(target, init);
  const text = await response.text();
  let jsonBody = {};
  if (text) {
    try {
      jsonBody = JSON.parse(text);
    } catch {
      jsonBody = { ok: false, error: text };
    }
  }

  return { status: response.status, jsonBody };
}
