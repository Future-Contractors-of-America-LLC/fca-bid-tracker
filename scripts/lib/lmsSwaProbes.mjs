/**
 * Live SWA route probes for Academy surfaces (Observe phase 3).
 */
import { FCA_MARKETING_ORIGIN } from "../domainHosts.constants.mjs";

const SWA_ROUTES = [
  { path: "/academy", markers: ["academy", "Academy"] },
  { path: "/academy/catalog", markers: ["academy", "catalog", "Catalog"] },
  { path: "/academy/store", markers: ["academy", "store", "Store"] },
  { path: "/portal/academy", markers: ["academy", "Academy"] },
];

/**
 * @param {{ origin?: string, log?: boolean }} [options]
 */
export async function runLmsSwaProbes(options = {}) {
  const origin = (options.origin || process.env.FCA_SWA_ORIGIN || FCA_MARKETING_ORIGIN).replace(/\/$/, "");
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
      const hasMarker = route.markers.some((marker) => body.includes(marker));
      if (!hasMarker) {
        say("fail", `SWA route ${route.path}`, `missing academy markers in HTML (${route.markers.join(", ")})`);
      } else {
        say("pass", `SWA route ${route.path}`, `${response.status} OK`);
      }
    } catch (error) {
      say("fail", `SWA route ${route.path}`, error.message);
    }
  }

  return { steps, origin };
}
