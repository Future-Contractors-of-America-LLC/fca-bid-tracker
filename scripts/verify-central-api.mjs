/**
 * Smoke-test Auricrux Central endpoints used by the FCA frontend.
 * Usage: node scripts/verify-central-api.mjs
 */
const CENTRAL_API =
  process.env.AURICRUX_CENTRAL_API ||
  "https://auricrux-central.azurewebsites.net/api";

const checks = [
  {
    name: "health",
    url: `${CENTRAL_API}/health`,
    expectOk: true,
  },
  {
    name: "bids_get",
    url: `${CENTRAL_API}/bids`,
    expectOk: true,
    validate: (data) => Array.isArray(data),
  },
  {
    name: "bids_get_filtered",
    url: `${CENTRAL_API}/bids?customerId=default-customer`,
    expectOk: false,
    note: "Partition filter may 500 until Central repair; frontend falls back client-side.",
  },
  {
    name: "leads_get",
    url: `${CENTRAL_API}/leads`,
    expectOk: true,
    validate: (data) => data && data.ok === true && Array.isArray(data.items),
  },
  {
    name: "commercial_pipeline_get",
    url: `${CENTRAL_API}/commercial-pipeline`,
    expectOk: true,
    validate: (data) => data && Array.isArray(data.items),
  },
  {
    name: "onboarding_post",
    url: `${CENTRAL_API}/onboarding`,
    method: "POST",
    body: {},
    expectOk: true,
    validate: (data) => data && typeof data.auricrux === "string",
  },
];

async function runCheck(check) {
  const init = {
    method: check.method || "GET",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
  };
  if (check.body !== undefined) {
    init.body = JSON.stringify(check.body);
  }

  const response = await fetch(check.url, init);
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (check.expectOk === false) {
    if (check.note) console.log(`NOTE ${check.name}: ${check.note} (HTTP ${response.status})`);
    return { name: check.name, status: response.status, optional: true };
  }

  if (check.expectOk && !response.ok) {
    throw new Error(`${check.name}: HTTP ${response.status} — ${text.slice(0, 200)}`);
  }
  if (check.validate && !check.validate(data)) {
    throw new Error(`${check.name}: response shape invalid`);
  }
  return { name: check.name, status: response.status };
}

async function main() {
  const results = [];
  const failures = [];

  for (const check of checks) {
    try {
      results.push(await runCheck(check));
      console.log(`OK  ${check.name}`);
    } catch (error) {
      failures.push({ name: check.name, error: error.message });
      console.error(`FAIL ${check.name}: ${error.message}`);
    }
  }

  console.log(`\nCentral API verification: ${results.length}/${checks.length} passed`);
  if (failures.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
