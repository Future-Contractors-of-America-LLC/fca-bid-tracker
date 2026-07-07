import fs from "fs/promises";
import path from "path";

const configuredHosts = (process.env.AURICRUX_LIVE_VERIFY_HOSTS || process.env.AURICRUX_EXPECTED_HOSTS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const providerDefaultHost = (
  process.env.AURICRUX_DEPLOY_DEFAULT_HOST
  || process.env.AURICRUX_EXPECTED_DEFAULT_HOST
  || process.env.AURICRUX_SWA_DEFAULT_HOST
  || ""
).trim();

const hosts = [...new Set([
  ...configuredHosts,
  providerDefaultHost,
].filter(Boolean))];

if (hosts.length === 0) {
  throw new Error(
    "No live verification hosts configured. Set AURICRUX_LIVE_VERIFY_HOSTS or AURICRUX_EXPECTED_HOSTS.",
  );
}

const routes = [
  "/deployment-status.json",
  "/domain-continuity.json",
  "/runtime-fingerprint.txt",
  "/live-shell-verification.html",
  "/host-binding-audit.html",
  "/api-continuity-audit.html",
  "/warranty",
  "/referrals",
  "/leads/index.html",
  "/leads/new.html",
  "/config/auricrux-central.js",
  "/bids/detail.html",
  "/bids/status.html",
  "/bids/edit.html",
  "/bids/bid-checklist.js",
  "/legal",
  "/legal/contractor-resources",
  "/contact",
  "/portal/legal",
];

const apiRoutes = [
  "/api/academy-lms?view=summary",
];

const attempts = Number(process.env.AURICRUX_LIVE_VERIFY_ATTEMPTS || 20);
const delayMs = Number(process.env.AURICRUX_LIVE_VERIFY_DELAY_MS || 30000);
const workspaceDir = path.join(process.cwd(), "workspace");
const summaryPath = path.join(workspaceDir, "live_deployment_smoke_summary.json");
const failuresPath = path.join(workspaceDir, "live_deployment_smoke_failures.txt");
const targetDeploymentName =
  process.env.AURICRUX_DEPLOY_TARGET_NAME
  || process.env.AURICRUX_SWA_NAME
  || "fca-frontend";
let targetDefaultHost = (process.env.AURICRUX_DEPLOY_DEFAULT_HOST || process.env.AURICRUX_SWA_DEFAULT_HOST || process.env.AURICRUX_EXPECTED_DEFAULT_HOST || "").trim();
let targetGitSha = (process.env.GITHUB_SHA || process.env.AURICRUX_EXPECTED_GIT_SHA || "").trim();
let targetCommitWitnessRoute = targetGitSha ? `/commit-witness-${targetGitSha}.txt` : "";
const enforceTargetSha = String(process.env.AURICRUX_LIVE_VERIFY_ENFORCE_TARGET_SHA || "true").toLowerCase() !== "false";

function parseFingerprint(text) {
  return text.trim().split("\n").reduce((acc, line) => {
    const idx = line.indexOf("=");
    if (idx === -1) return acc;
    acc[line.slice(0, idx)] = line.slice(idx + 1);
    return acc;
  }, {});
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function withCacheBust(url, attemptNumber) {
  const marker = `${Date.now()}-${Math.random().toString(36).slice(2)}-${attemptNumber}`;
  return `${url}${url.includes("?") ? "&" : "?"}auricrux_verify=${marker}`;
}

async function fetchText(url, attemptNumber) {
  const response = await fetch(withCacheBust(url, attemptNumber), {
    headers: {
      "cache-control": "no-cache, no-store, max-age=0, must-revalidate",
      pragma: "no-cache",
      expires: "0",
    },
  });
  const text = await response.text();
  return { ok: response.ok, status: response.status, text };
}

async function resolveExpectationsFromLiveBaseline() {
  const needsGitSha = !targetGitSha;
  const needsDefaultHost = !targetDefaultHost;
  if (!needsGitSha && !needsDefaultHost) {
    if (!targetCommitWitnessRoute) {
      targetCommitWitnessRoute = `/commit-witness-${targetGitSha}.txt`;
    }
    return;
  }

  const baselineHost = (
    process.env.AURICRUX_LIVE_VERIFY_BASELINE_HOST
    || hosts.find((host) => host === "app.futurecontractorsofamerica.com")
    || hosts[0]
  );

  const deploymentResponse = await fetchText(`https://${baselineHost}/deployment-status.json`, 0);
  const fingerprintResponse = await fetchText(`https://${baselineHost}/runtime-fingerprint.txt`, 0);

  let deployment = null;
  let fingerprint = null;

  if (deploymentResponse.ok) {
    try {
      deployment = JSON.parse(deploymentResponse.text);
    } catch {
      deployment = null;
    }
  }

  if (fingerprintResponse.ok) {
    fingerprint = parseFingerprint(fingerprintResponse.text);
  }

  if (!targetGitSha) {
    targetGitSha = String(
      deployment?.gitSha
      || fingerprint?.gitSha
      || ""
    ).trim();
  }

  if (!targetDefaultHost) {
    targetDefaultHost = String(
      deployment?.defaultHost
      || fingerprint?.defaultHost
      || ""
    ).trim();
  }

  if (!targetCommitWitnessRoute) {
    targetCommitWitnessRoute = String(
      deployment?.commitWitnessRoute
      || (targetGitSha ? `/commit-witness-${targetGitSha}.txt` : "")
    ).trim();
  }

  if (!targetGitSha) {
    targetGitSha = "unconfigured";
  }
  if (!targetDefaultHost) {
    targetDefaultHost = "unconfigured";
  }
  if (!targetCommitWitnessRoute) {
    targetCommitWitnessRoute = `/commit-witness-${targetGitSha}.txt`;
  }

  console.log(
    `[live-deployment-verify] baseline ${baselineHost} -> gitSha=${targetGitSha}, defaultHost=${targetDefaultHost}, commitWitness=${targetCommitWitnessRoute}`,
  );
}

function evaluateHost(host, deploymentResponse, continuityResponse, fingerprintResponse, commitWitnessResponse, routeChecks, apiRouteChecks) {
  const failures = [];
  let deployment = null;
  let continuity = null;
  let fingerprint = null;

  if (!deploymentResponse.ok) {
    failures.push(`https://${host}/deployment-status.json returned ${deploymentResponse.status}`);
  }
  if (!continuityResponse.ok) {
    failures.push(`https://${host}/domain-continuity.json returned ${continuityResponse.status}`);
  }
  if (!fingerprintResponse.ok) {
    failures.push(`https://${host}/runtime-fingerprint.txt returned ${fingerprintResponse.status}`);
  }
  if (!commitWitnessResponse.ok) {
    failures.push(`https://${host}${targetCommitWitnessRoute} returned ${commitWitnessResponse.status}`);
  }

  if (deploymentResponse.ok) {
    try {
      deployment = JSON.parse(deploymentResponse.text);
    } catch (error) {
      failures.push(`https://${host}/deployment-status.json did not return valid JSON: ${error.message}`);
    }
  }

  if (continuityResponse.ok) {
    try {
      continuity = JSON.parse(continuityResponse.text);
    } catch (error) {
      failures.push(`https://${host}/domain-continuity.json did not return valid JSON: ${error.message}`);
    }
  }

  if (fingerprintResponse.ok) {
    fingerprint = parseFingerprint(fingerprintResponse.text);
  }

  if (deployment && fingerprint) {
    if (!deployment.gitSha || deployment.gitSha === "pending-build") {
      failures.push(`https://${host}/deployment-status.json still exposes pending-build on ${host}`);
    }
    if (!fingerprint.gitSha || fingerprint.gitSha === "pending-build") {
      failures.push(`https://${host}/runtime-fingerprint.txt still exposes pending-build on ${host}`);
    }
    if (deployment.gitSha !== fingerprint.gitSha) {
      failures.push(`${host} has mixed witness SHA drift: deployment-status=${deployment.gitSha} runtime-fingerprint=${fingerprint.gitSha}`);
    }
    if (enforceTargetSha) {
      if (deployment.gitSha !== targetGitSha) {
        failures.push(`${host} is serving stale deployment-status SHA ${deployment.gitSha}; expected ${targetGitSha}`);
      }
      if (fingerprint.gitSha !== targetGitSha) {
        failures.push(`${host} is serving stale runtime-fingerprint SHA ${fingerprint.gitSha}; expected ${targetGitSha}`);
      }
      if (deployment.commitWitnessRoute !== targetCommitWitnessRoute) {
        failures.push(`${host} deployment manifest reports commit witness ${deployment.commitWitnessRoute}; expected ${targetCommitWitnessRoute}`);
      }
    }
  }

  if (enforceTargetSha && commitWitnessResponse.ok && !commitWitnessResponse.text.includes(`gitSha=${targetGitSha}`)) {
    failures.push(`${host} commit witness payload does not include expected SHA ${targetGitSha}`);
  }

  if (continuity?.expectedHosts && !continuity.expectedHosts.includes(host)) {
    failures.push(`https://${host}/domain-continuity.json does not list ${host} as an expected host`);
  }

  if (continuity?.defaultHost && continuity.defaultHost !== targetDefaultHost) {
    failures.push(`${host} reports unexpected default host ${continuity.defaultHost}; expected ${targetDefaultHost}`);
  }

  if (deployment?.defaultHost && deployment.defaultHost !== targetDefaultHost) {
    failures.push(`${host} deployment manifest reports unexpected default host ${deployment.defaultHost}; expected ${targetDefaultHost}`);
  }

  if (fingerprint?.defaultHost && fingerprint.defaultHost !== targetDefaultHost) {
    failures.push(`${host} runtime fingerprint reports unexpected default host ${fingerprint.defaultHost}; expected ${targetDefaultHost}`);
  }

  for (const check of routeChecks) {
    if (!check.ok) {
      failures.push(`https://${host}${check.route} returned ${check.status}`);
    }
  }

  for (const check of apiRouteChecks) {
    if (check.status === 404) {
      failures.push(`https://${host}${check.route} returned 404; generated SWA Functions API is not serving`);
    }
  }

  return {
    host,
    deploymentGitSha: deployment?.gitSha || "unavailable",
    runtimeGitSha: fingerprint?.gitSha || "unavailable",
    commitWitnessRoute: deployment?.commitWitnessRoute || targetCommitWitnessRoute,
    expectedHosts: continuity?.expectedHosts || [],
    routeChecks,
    apiRouteChecks,
    failures,
  };
}

async function runAttempt(attemptNumber) {
  const summary = [];
  const failures = [];

  for (const host of hosts) {
    const deploymentUrl = `https://${host}/deployment-status.json`;
    const continuityUrl = `https://${host}/domain-continuity.json`;
    const fingerprintUrl = `https://${host}/runtime-fingerprint.txt`;
    const commitWitnessUrl = `https://${host}${targetCommitWitnessRoute}`;

    const deploymentResponse = await fetchText(deploymentUrl, attemptNumber);
    const continuityResponse = await fetchText(continuityUrl, attemptNumber);
    const fingerprintResponse = await fetchText(fingerprintUrl, attemptNumber);
    const commitWitnessResponse = await fetchText(commitWitnessUrl, attemptNumber);

    const routeChecks = [];
    for (const route of [...routes, targetCommitWitnessRoute]) {
      const url = `https://${host}${route}`;
      const response = await fetchText(url, attemptNumber);
      routeChecks.push({ route, status: response.status, ok: response.ok });
    }

    const apiRouteChecks = [];
    for (const route of apiRoutes) {
      const url = `https://${host}${route}`;
      const response = await fetchText(url, attemptNumber);
      apiRouteChecks.push({ route, status: response.status, ok: response.status !== 404 });
    }

    const indexShellResponse = await fetchText(`https://${host}/index.html`, attemptNumber);
    const spaBoot = {
      route: "/index.html",
      status: indexShellResponse.status,
      ok: indexShellResponse.ok
        && indexShellResponse.text.includes('rel="stylesheet"')
        && /\/assets\/main-[^"]+\.css/.test(indexShellResponse.text),
    };
    routeChecks.push(spaBoot);

    const hostResult = evaluateHost(host, deploymentResponse, continuityResponse, fingerprintResponse, commitWitnessResponse, routeChecks, apiRouteChecks);
    summary.push({
      attempt: attemptNumber,
      targetDeploymentName,
      targetDefaultHost,
      targetGitSha,
      ...hostResult,
    });
    failures.push(...hostResult.failures);
  }

  return { summary, failures };
}

await fs.mkdir(workspaceDir, { recursive: true });
await resolveExpectationsFromLiveBaseline();

let finalSummary = [];
let finalFailures = [];

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  const { summary, failures } = await runAttempt(attempt);
  finalSummary = summary;
  finalFailures = failures;

  await fs.writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  await fs.writeFile(failuresPath, `${failures.join("\n")}\n`, "utf8");

  console.log(JSON.stringify(summary, null, 2));

  if (failures.length === 0) {
    console.log(`Live deployment smoke verification passed on attempt ${attempt}.`);
    process.exit(0);
  }

  if (attempt < attempts) {
    console.warn(`Live deployment smoke verification attempt ${attempt} failed. Retrying in ${delayMs}ms...`);
    await sleep(delayMs);
  }
}

const staleHosts = finalSummary.filter((item) => item.deploymentGitSha !== targetGitSha && item.deploymentGitSha !== "unavailable");
if (enforceTargetSha && staleHosts.length === hosts.length) {
  finalFailures.push(
    `All hosts remained stale after ${attempts} attempts. This strongly indicates deployment target mismatch or release routing drift. Expected gitSha=${targetGitSha}.`
  );
  await fs.writeFile(failuresPath, `${finalFailures.join("\n")}\n`, "utf8");
}

console.error("Live deployment smoke verification failed after retry budget:");
for (const failure of finalFailures) {
  console.error(` - ${failure}`);
}
process.exit(1);
