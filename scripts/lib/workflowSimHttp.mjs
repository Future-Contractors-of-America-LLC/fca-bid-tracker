import { FCA_API_ORIGIN, FCA_AZURE_API_FALLBACK_ORIGIN } from "../domainHosts.constants.mjs";

export async function resolveApiBase(preferred = "") {
  if (preferred) {
    const ok = await isApiHealthy(preferred);
    if (ok) return preferred.replace(/\/$/, "");
  }
  for (const candidate of [FCA_API_ORIGIN, FCA_AZURE_API_FALLBACK_ORIGIN, process.env.FCA_API_BASE]) {
    if (!candidate) continue;
    const base = candidate.replace(/\/$/, "");
    if (await isApiHealthy(base)) return base;
  }
  return "";
}

async function isApiHealthy(origin) {
  try {
    const response = await fetch(`${origin}/api/health`, { headers: { Accept: "application/json" } });
    if (!response.ok) return false;
    const text = (await response.text()).trim();
    return Boolean(text);
  } catch {
    return false;
  }
}

function parseCookie(setCookieHeader) {
  if (!setCookieHeader) return "";
  const first = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader;
  return String(first).split(";")[0];
}

export async function requestJson(apiBase, route, { method = "GET", body, cookie = "" } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;

  const response = await fetch(`${apiBase}${route}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const setCookie = response.headers.getSetCookie?.() || response.headers.get("set-cookie");
  let payload = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text.slice(0, 400) };
    }
  }

  return { response, payload, cookie: parseCookie(setCookie) };
}
