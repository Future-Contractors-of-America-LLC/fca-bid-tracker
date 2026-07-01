import fs from "fs/promises";
import path from "path";

const configuredHosts = (process.env.AURICRUX_LIVE_VERIFY_HOSTS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const hosts = [...new Set([
  ...configuredHosts,
  "futurecontractorsofamerica.com",
  "www.futurecontractorsofamerica.com",
  "app.futurecontractorsofamerica.com",
  process.env.AURICRUX_SWA_DEFAULT_HOST || "",
].filter(Boolean))];

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

const attempts = Number(process.env.AURICRUX_LIVE_VERIFY_ATTEMPTS || 20);
const delayMs = Number(process.env.AURICRUX_LIVE_VERIFY_DELAY_MS || 30000);
const nonBlocking = process.env.AURICRUX_LIVE_VERIFY_NONBLOCKING === "1";
const workspaceDir = path.join(process.cwd(), "workspace");
const summaryPath = path.join(workspaceDir, "live_deployment_smoke_summary.json");
const failuresPath = path.join(workspaceDir, "live_deployment_smoke_failures.txt");
const targetSwaName = process.env.AURICRUX_SWA_NAME || "fca-frontend";
const targetDefaultHost = process.env.AURICRUX_SWA_DEFAULT_HOST || "unconfigured";
const targetGitSha = process.env.GITHUB_SHA || "unconfigured";
const targetCommitWitnessRoute = `/commit-witness-${targetGitSha}.txt`;

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
  try {
    const response = await fetch(withCacheBust(url, attemptNumber), {
      headers: {
        "cache-control": "no-cache, no-store, max-age=0, must-revalidate",
        pragma: "no-cache",
        expires: "0",
      },
    });
    const text = await response.text();
    return { ok: response.ok, status: response.status, text };
  } catch (error) {
    return { ok: false, status: 0, text: `network error: ${error.message}` };
  }
}

function evaluateHost(host, deploymentResponse, continuityResponse, fingerprintResponse, commitWitnessResponse, routeChecks) {
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

  if (commitWitnessResponse.ok && !commitWitnessResponse.text.includes(`gitSha=${targetGitSha}`)) {
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

  return {
    host,
    deploymentGitSha: deployment?.gitSha || "unavailable",
    runtimeGitSha: fingerprint?.gitSha || "unavailable",
    commitWitnessRoute: deployment?.commitWitnessRoute || targetCommitWitnessRoute,
    expectedHosts: continuity?.expectedHosts || [],
    routeChecks,
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

    const indexShellResponse = await fetchText(`https://${host}/index.html`, attemptNumber);
    const spaBoot = {
      route: "/index.html",
      status: indexShellResponse.status,
      ok: indexShellResponse.ok
        && indexShellResponse.text.includes('rel="stylesheet"')
        && /\/assets\/main-[^"]+\.css/.test(indexShellResponse.text),
    };
    routeChecks.push(spaBoot);

    const hostResult = evaluateHost(host, deploymentResponse, continuityResponse, fingerprintResponse, commitWitnessResponse, routeChecks);
    summary.push({
      attempt: attemptNumber,
      targetSwaName,
      targetDefaultHost,
      targetGitSha,
      ...hostResult,
    });
    failures.push(...hostResult.failures);
  }

  return { summary, failures };
}

await fs.mkdir(workspaceDir, { recursive: true });

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
if (staleHosts.length === hosts.length) {
  finalFailures.push(
    `All hosts remained stale after ${attempts} attempts. This strongly indicates SWA deployment token/resource mismatch or deployment targeting drift. Expected gitSha=${targetGitSha}.`
  );
  await fs.writeFile(failuresPath, `${finalFailures.join("\n")}\n`, "utf8");
}

console.error("Live deployment smoke verification failed after retry budget:");
for (const failure of finalFailures) {
  console.error(` - ${failure}`);
}
if (nonBlocking) {
  console.warn("AURICRUX_LIVE_VERIFY_NONBLOCKING=1: smoke failures recorded but not blocking deployment.");
  process.exit(0);
}
process.exit(1);
