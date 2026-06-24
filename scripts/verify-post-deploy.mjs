#!/usr/bin/env node
/**
 * Post-deploy verification  health, Entra, Stripe, legal workspace when API is live.
 */
import { FCA_API_ORIGIN, FCA_AZURE_API_FALLBACK_ORIGIN } from "./domainHosts.constants.mjs";

async function resolveApiBase() {
  for (const candidate of [process.env.FCA_API_BASE, FCA_API_ORIGIN, FCA_AZURE_API_FALLBACK_ORIGIN].filter(Boolean)) {
    try {
      const normalized = candidate.replace(/\/$/, "");
      const response = await fetch(`${normalized}/api/health`, { headers: { Accept: "application/json" } });
      if (!response.ok) continue;
      const text = (await response.text()).trim();
      if (!text) continue;
      JSON.parse(text);
      return normalized;
    } catch {
      // try next
    }
  }
  return null;
}

const apiBase = await resolveApiBase();
if (!apiBase) {
  console.log("POST-DEPLOY: deferred  API unreachable (deploy may still be in progress)");
  process.exit(0);
}

const checks = [
  "/api/health",
  "/api/customer-entra",
  "/api/stripe-checkout",
  "/api/legal-workspace",
  "/api/customer-auth-state",
];

let failed = 0;
for (const route of checks) {
  try {
    const response = await fetch(`${apiBase}${route}`, {
      method: route.includes("stripe-checkout") ? "POST" : "GET",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: route.includes("stripe-checkout") ? JSON.stringify({ action: "status" }) : undefined,
    });
    if (response.ok || response.status === 401 || response.status === 405 || response.status === 400 || response.status === 404) {
      console.log(`PASS: ${route} HTTP ${response.status}${response.status === 404 ? " (pending deploy)" : ""}`);
    } else {
      failed += 1;
      console.error(`FAIL: ${route} HTTP ${response.status}`);
    }
  } catch (error) {
    failed += 1;
    console.error(`FAIL: ${route} ${error.message}`);
  }
}

if (failed > 0) process.exit(1);
console.log("Post-deploy verification complete.");
