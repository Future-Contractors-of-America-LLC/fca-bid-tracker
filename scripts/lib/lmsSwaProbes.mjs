/**
 * Live SWA route probes for Academy surfaces (Observe phase 3).
 * SPA routes return the shell — validate HTTP 200 + app bootstrap, then API depth where needed.
 */
import { FCA_MARKETING_ORIGIN } from "../domainHosts.constants.mjs";

const SWA_ROUTES = [
  { path: "/academy", apiProbe: "/api/academy-commerce?view=catalog&limit=1" },
  { path: "/academy/catalog", apiProbe: "/api/academy-commerce?view=catalog&limit=1" },
  { path: "/academy/store", apiProbe: "/api/academy-commerce?view=catalog&limit=1" },
  { path: "/portal/academy", apiProbe: null },
];

const SPA_MARKERS = ['id="root"', "Future Contractors of America", "fca-backend-config", "/src/bootstrap"];

/**
 * @param {{ origin?: string, apiBase?: string, log?: boolean }} [options]
 */
export async function runLmsSwaProbes(options = {}) {
  const origin = (options.origin || process.env.FCA_SWA_ORIGIN || FCA_MARKETING_ORIGIN).replace(/\/$/, "");
  const apiBase = (options.apiBase || process.env.FCA_API_BASE || process.env.AURICRUX_CENTRAL_API || "https://api.futurecontractorsofamerica.com").replace(/\/$/, "").replace(/\/api$/, "");
  const log = options.log !== false;
  const steps = [];

  const say = (status, name, detail = "") => {
    steps.push({ name, status, detail, phase: "swa-probes" });
    if (!log) return;
    if (status === "pass") console.log(`PASS: ${name}${detail ? ` - ${detail}` : ""}`);
    else console.error(`FAIL: ${name}${detail ? ` - ${detail}` : ""}`);
  };

  for (const route of SWA_ROUTES) {
    const url = `${origin}${route.path}`;
    try {
      const response = await fetch(url, {
        headers: { Accept: "text/html,application/xhtml+xml" },
        redirect: "follow",
      });
      const body = await response.text();
      if (!response.ok) {
        say("fail", `SWA route ${route.path}`, `HTTP ${response.status}`);
        continue;
      }
      const hasSpaShell = SPA_MARKERS.some((marker) => body.includes(marker));
      if (!hasSpaShell) {
        say("fail", `SWA route ${route.path}`, "missing SPA bootstrap markers in HTML");
        continue;
      }

      if (route.apiProbe) {
        try {
          const apiResponse = await fetch(`${apiBase}${route.apiProbe}`, {
            headers: { Accept: "application/json" },
          });
          const apiText = await apiResponse.text();
          const apiPayload = apiText ? JSON.parse(apiText) : null;
          if ([400, 401].includes(apiResponse.status) && !apiText) {
            say("pass", `SWA route ${route.path}`, `${response.status} SPA shell OK; API auth boundary HTTP ${apiResponse.status}`);
            continue;
          }
          if (!apiResponse.ok || !apiPayload?.ok) {
            say("fail", `SWA route ${route.path}`, `shell OK but API probe failed (${apiResponse.status})`);
            continue;
          }
        } catch (apiError) {
          say("fail", `SWA route ${route.path}`, `shell OK but API probe error: ${apiError.message}`);
          continue;
        }
      }

      say("pass", `SWA route ${route.path}`, `${response.status} SPA shell OK`);
    } catch (error) {
      say("fail", `SWA route ${route.path}`, error.message);
    }
  }

  return { steps, origin };
}
