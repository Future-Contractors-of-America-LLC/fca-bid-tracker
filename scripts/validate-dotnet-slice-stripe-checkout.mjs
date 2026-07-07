#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const defaultPort = String(9000 + Math.floor(Math.random() * 500));
const port = process.env.FCA_DOTNET_BACKEND_PORT || defaultPort;
const baseUrl = `http://127.0.0.1:${port}`;
const repoRoot = process.cwd();
const programPath = path.join(repoRoot, "backend-dotnet", "Fca.BidTracker.Api", "Program.cs");
const lockPath = path.join(repoRoot, "docs", "qc", "slice-locks", "stripe-checkout.lock.json");
const reportPath = path.join(repoRoot, "generated", "dotnet-slice-stripe-checkout-report.json");

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function readProgramHash() {
  return sha256(fs.readFileSync(programPath, "utf8"));
}

function startBackend() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "dotnet",
      [
        "run",
        "--project",
        "backend-dotnet/Fca.BidTracker.Api/Fca.BidTracker.Api.csproj",
        "--urls",
        baseUrl,
      ],
      {
        cwd: repoRoot,
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    let settled = false;
    let stderrText = "";

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill();
      reject(new Error("Timed out waiting for .NET backend to start"));
    }, 30000);

    const onChunk = (chunk) => {
      const text = String(chunk || "");
      if (text.includes("Now listening on:")) {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        resolve(child);
      }
    };

    child.stdout.on("data", onChunk);
    child.stderr.on("data", (chunk) => {
      stderrText += String(chunk || "");
      onChunk(chunk);
    });

    child.on("exit", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(new Error(`.NET backend exited before ready (code ${code ?? "unknown"})${stderrText ? `: ${stderrText.trim()}` : ""}`));
    });
  });
}

async function hit(name, method, routePath, expected, body) {
  const res = await fetch(`${baseUrl}${routePath}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  const hasStackTraceLeak = /System\.|Exception|at\s+Microsoft\./i.test(text);
  return {
    name,
    method,
    routePath,
    expected,
    actual: res.status,
    statusOk: res.status === expected,
    noStackTraceLeak: !hasStackTraceLeak,
    json,
    ok: res.status === expected && !hasStackTraceLeak,
  };
}

async function main() {
  const writeLock = process.argv.includes("--write-lock");
  const server = await startBackend();
  try {
    const checks = [];
    checks.push(await hit("stripe_options", "OPTIONS", "/api/stripe-checkout", 204));
    checks.push(await hit("stripe_post_standard", "POST", "/api/stripe-checkout", 200, { action: "plan" }));
    checks.push(await hit("stripe_post_embedded_no_key", "POST", "/api/stripe-checkout", 200, { uiMode: "embedded", action: "plan" }));
    checks.push(await hit("stripe_post_explicit_option_no_key", "POST", "/api/stripe-checkout", 503, { uiMode: "embedded", action: "plan", checkoutProvider: "stripe" }));
    checks.push(await hit("stripe_get_guard", "GET", "/api/stripe-checkout", 405));
    checks.push(await hit("stripe_delete_guard", "DELETE", "/api/stripe-checkout", 405));

    const standard = checks.find((c) => c.name === "stripe_post_standard");
    if (standard) {
      const hasExpectedContent =
        standard.json?.ok === true &&
        standard.json?.route === "/api/stripe-checkout" &&
        standard.json?.checkoutProvider === "fca-local" &&
        standard.json?.primary === true &&
        standard.json?.selfContained === true;
      standard.hasExpectedContent = hasExpectedContent;
      standard.ok = standard.ok && hasExpectedContent;
    }

    const embedded = checks.find((c) => c.name === "stripe_post_embedded_no_key");
    if (embedded) {
      const hasSelfContainedSignal = Boolean(
        embedded.json?.selfContained === true &&
          embedded.json?.checkoutProvider === "fca-local" &&
          embedded.json?.sessionId &&
          embedded.json?.publishableKey,
      );
      embedded.selfContainedSignal = hasSelfContainedSignal;
      embedded.ok = embedded.ok && hasSelfContainedSignal;
    }

    const stripeOption = checks.find((c) => c.name === "stripe_post_explicit_option_no_key");
    if (stripeOption) {
      const hasStripeOptionSignal = Boolean(
        stripeOption.json?.optionUnavailable === true &&
          stripeOption.json?.checkoutProvider === "stripe" &&
          stripeOption.json?.fallbackProvider === "fca-local" &&
          stripeOption.json?.fallbackAvailable === true,
      );
      stripeOption.stripeOptionSignal = hasStripeOptionSignal;
      stripeOption.ok = stripeOption.ok && hasStripeOptionSignal;
    }

    const programHash = readProgramHash();
    const failed = checks.filter((c) => !c.ok);

    const summary = {
      generatedAt: new Date().toISOString(),
      slice: "stripe-checkout",
      baseUrl,
      programPath: "backend-dotnet/Fca.BidTracker.Api/Program.cs",
      programHash,
      totalChecks: checks.length,
      passedChecks: checks.length - failed.length,
      failedChecks: failed.length,
      checks,
    };

    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

    if (writeLock) {
      const lockPayload = {
        slice: "stripe-checkout",
        lockedAt: summary.generatedAt,
        programPath: summary.programPath,
        programHash,
        expectedRoutes: checks.map((c) => ({ method: c.method, routePath: c.routePath, expectedStatus: c.expected })),
        requiredSignals: ["hasExpectedContent", "selfContainedSignal", "stripeOptionSignal"],
      };
      fs.mkdirSync(path.dirname(lockPath), { recursive: true });
      fs.writeFileSync(lockPath, `${JSON.stringify(lockPayload, null, 2)}\n`, "utf8");
      console.log(`[stripe-checkout-slice] lock-updated=${path.relative(repoRoot, lockPath)}`);
    } else if (fs.existsSync(lockPath)) {
      const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
      if (lock.programHash !== programHash) {
        console.error("[stripe-checkout-slice] FAIL: lock hash mismatch; run lock:dotnet-slice:stripe-checkout after intentional changes.");
        process.exitCode = 1;
      }
    }

    console.log("[stripe-checkout-slice]", JSON.stringify(summary, null, 2));
    console.log(`[stripe-checkout-slice] report=${path.relative(repoRoot, reportPath)}`);

    if (failed.length > 0) {
      console.error("[stripe-checkout-slice] FAIL: route/security/content/accessibility checks failed.");
      process.exitCode = 1;
    }
  } finally {
    server.kill();
  }
}

main().catch((error) => {
  console.error("[stripe-checkout-slice] ERROR", error?.stack || String(error));
  process.exit(1);
});
