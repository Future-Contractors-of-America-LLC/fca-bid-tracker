const hosts = [
  "futurecontractorsofamerica.com",
  "www.futurecontractorsofamerica.com",
];

const routes = [
  "/deployment-status.json",
  "/domain-continuity.json",
  "/runtime-fingerprint.txt",
  "/live-shell-verification.html",
  "/host-binding-audit.html",
  "/api-continuity-audit.html",
];

function parseFingerprint(text) {
  return text.trim().split("\n").reduce((acc, line) => {
    const idx = line.indexOf("=");
    if (idx === -1) return acc;
    acc[line.slice(0, idx)] = line.slice(idx + 1);
    return acc;
  }, {});
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { "cache-control": "no-cache" } });
  const text = await response.text();
  return { ok: response.ok, status: response.status, text };
}

const failures = [];
const summary = [];

for (const host of hosts) {
  const hostSummary = { host, checks: [] };

  const deploymentUrl = `https://${host}/deployment-status.json`;
  const continuityUrl = `https://${host}/domain-continuity.json`;
  const fingerprintUrl = `https://${host}/runtime-fingerprint.txt`;

  const deploymentResponse = await fetchText(deploymentUrl);
  const continuityResponse = await fetchText(continuityUrl);
  const fingerprintResponse = await fetchText(fingerprintUrl);

  if (!deploymentResponse.ok) {
    failures.push(`${deploymentUrl} returned ${deploymentResponse.status}`);
  }
  if (!continuityResponse.ok) {
    failures.push(`${continuityUrl} returned ${continuityResponse.status}`);
  }
  if (!fingerprintResponse.ok) {
    failures.push(`${fingerprintUrl} returned ${fingerprintResponse.status}`);
  }

  let deployment = null;
  let continuity = null;
  let fingerprint = null;

  if (deploymentResponse.ok) {
    try {
      deployment = JSON.parse(deploymentResponse.text);
    } catch (error) {
      failures.push(`${deploymentUrl} did not return valid JSON: ${error.message}`);
    }
  }

  if (continuityResponse.ok) {
    try {
      continuity = JSON.parse(continuityResponse.text);
    } catch (error) {
      failures.push(`${continuityUrl} did not return valid JSON: ${error.message}`);
    }
  }

  if (fingerprintResponse.ok) {
    fingerprint = parseFingerprint(fingerprintResponse.text);
  }

  if (deployment && fingerprint) {
    if (!deployment.gitSha || deployment.gitSha === "pending-build") {
      failures.push(`${deploymentUrl} still exposes pending-build on ${host}`);
    }
    if (!fingerprint.gitSha || fingerprint.gitSha === "pending-build") {
      failures.push(`${fingerprintUrl} still exposes pending-build on ${host}`);
    }
    if (deployment.gitSha !== fingerprint.gitSha) {
      failures.push(`${host} has mixed witness SHA drift: deployment-status=${deployment.gitSha} runtime-fingerprint=${fingerprint.gitSha}`);
    }
  }

  if (continuity?.expectedHosts && !continuity.expectedHosts.includes(host)) {
    failures.push(`${continuityUrl} does not list ${host} as an expected host`);
  }

  for (const route of routes) {
    const url = `https://${host}${route}`;
    const response = await fetchText(url);
    hostSummary.checks.push({ route, status: response.status, ok: response.ok });
    if (!response.ok) {
      failures.push(`${url} returned ${response.status}`);
    }
  }

  summary.push({
    host,
    deploymentGitSha: deployment?.gitSha || "unavailable",
    runtimeGitSha: fingerprint?.gitSha || "unavailable",
    expectedHosts: continuity?.expectedHosts || [],
    checks: hostSummary.checks,
  });
}

console.log(JSON.stringify(summary, null, 2));

if (failures.length > 0) {
  console.error("Live deployment smoke verification failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Live deployment smoke verification passed for apex/www witness pack, SHA alignment, and API continuity routes.");
