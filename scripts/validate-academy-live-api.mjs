#!/usr/bin/env node
/**
 * Live Auricrux-Central academy API smoke — catalog integrity + compliance summary fields.
 */
import { ACADEMY_CATALOG_EXPECTED_TOTAL } from "../src/academyDesignSystem.js";

const API_BASE = process.env.FCA_API_BASE || "https://auricrux-central.azurewebsites.net";
const EXPECTED_LANES = {
  apprenticeship: 207,
  certification: 88,
  degree: 803,
  licensure: 82,
  professional: 23,
  "fca-how-to": 9,
};

const LANE_COMPLIANCE_FIELD = {
  apprenticeship: "apprenticeshipSponsor",
  certification: "issuingAgency",
  degree: "accreditationBody",
  licensure: "licensureBoard",
};

async function fetchJson(path) {
  const response = await fetch(`${API_BASE}${path}`, { headers: { Accept: "application/json" } });
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
}

const failures = [];

const { response, payload } = await fetchJson("/api/academy-lms?view=summary");
if (!response.ok || !payload?.ok) {
  console.error(`Live academy-lms failed: HTTP ${response.status}`);
  process.exit(1);
}

const total = payload.catalog?.totalPrograms ?? payload.catalog?.programs?.length ?? 0;
const integrity = payload.catalogIntegrity || {};
const laneCounts = integrity.laneProgramCounts || payload.summary?.laneProgramCounts || {};

if (total !== ACADEMY_CATALOG_EXPECTED_TOTAL) {
  failures.push(`totalPrograms ${total} != expected ${ACADEMY_CATALOG_EXPECTED_TOTAL}`);
}

if (integrity.aligned === false) {
  failures.push("catalogIntegrity.aligned is false");
}

for (const [lane, expected] of Object.entries(EXPECTED_LANES)) {
  const actual = laneCounts[lane];
  if (actual !== expected) {
    failures.push(`lane ${lane}: ${actual} != expected ${expected}`);
  }
}

for (const [lane, field] of Object.entries(LANE_COMPLIANCE_FIELD)) {
  const { payload: lanePayload } = await fetchJson(`/api/academy-lms?view=summary&lane=${lane}&limit=1`);
  const program = lanePayload?.catalog?.programs?.[0];
  if (!program) {
    failures.push(`no sample program for lane ${lane}`);
    continue;
  }
  if (!program[field]) {
    failures.push(`lane ${lane} sample missing ${field} on program ${program.key}`);
  }
}

const { payload: commercePayload, response: commerceResponse } = await fetchJson("/api/academy-commerce?view=catalog&limit=200");
if (commerceResponse.ok && commercePayload?.ok) {
  const storePrograms = commercePayload.catalog?.programs || commercePayload.programs || [];
  const howToInStore = storePrograms.filter((p) => p.lane === "fca-how-to" || p.pathwayKey === "fca-how-to");
  if (howToInStore.length > 0) {
    failures.push(`fca-how-to programs in paid store: ${howToInStore.map((p) => p.key).join(", ")}`);
  }
}

if (failures.length > 0) {
  console.error("Academy live API validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log(`Academy live API validation passed (${total} programs, all lanes + compliance samples OK).`);
