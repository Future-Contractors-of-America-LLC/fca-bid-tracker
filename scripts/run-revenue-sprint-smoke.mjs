#!/usr/bin/env node
/**
 * Revenue sprint live verification — routes, checkout links, API health.
 */
const BASE = process.env.FCA_LIVE_BASE || "https://futurecontractorsofamerica.com";
const API = process.env.FCA_API_BASE || "https://auricrux-central.azurewebsites.net";

const PILOT_CHECKOUT = "https://buy.stripe.com/bJe14o0fQ5Pn8Tt7Bw5gc01";

const checks = [
  { name: "home", url: `${BASE}/`, expect: 200 },
  { name: "pricing", url: `${BASE}/pricing`, expect: 200 },
  { name: "products", url: `${BASE}/products`, expect: 200 },
  { name: "products-catalog", url: `${BASE}/products/catalog.json`, expect: 200 },
  { name: "terms", url: `${BASE}/terms`, expect: 200 },
  { name: "privacy", url: `${BASE}/privacy`, expect: 200 },
  { name: "refunds", url: `${BASE}/refunds`, expect: 200 },
  { name: "ip", url: `${BASE}/ip`, expect: 200 },
  { name: "brand-specimen", url: `${BASE}/brand/fca/fca-hex-mark.svg`, expect: 200 },
  { name: "central-health", url: `${API}/api/health`, expect: 200 },
  { name: "central-foundry-status", url: `${API}/api/foundry/status`, expect: 200 },
  { name: "pilot-checkout", url: PILOT_CHECKOUT, expect: 200 },
];

async function probe(check) {
  try {
    const res = await fetch(check.url, { redirect: "follow" });
    const ok = res.status === check.expect;
    return { ...check, status: res.status, ok };
  } catch (error) {
    return { ...check, status: 0, ok: false, error: error.message };
  }
}

async function main() {
  const results = await Promise.all(checks.map(probe));
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);

  console.log(`\n=== Revenue Sprint Smoke: ${passed}/${results.length} passed ===\n`);
  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"} ${r.name} (${r.status}) ${r.url}`);
    if (r.error) console.log(`  error: ${r.error}`);
  }

  if (failed.length) {
    console.log("\nFailed checks:", failed.map((f) => f.name).join(", "));
    process.exit(1);
  }
}

main();
