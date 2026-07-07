#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const defaultPort = String(8400 + Math.floor(Math.random() * 500));
const port = process.env.FCA_DOTNET_BACKEND_PORT || defaultPort;
const baseUrl = `http://127.0.0.1:${port}`;
const repoRoot = process.cwd();
const programPath = path.join(repoRoot, "backend-dotnet", "Fca.BidTracker.Api", "Program.cs");
const lockPath = path.join(repoRoot, "docs", "qc", "slice-locks", "academy-commerce.lock.json");
const reportPath = path.join(repoRoot, "generated", "dotnet-slice-academy-commerce-report.json");

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
    checks.push(await hit("academy_commerce_options", "OPTIONS", "/api/academy-commerce", 204));
    checks.push(await hit("academy_commerce_get", "GET", "/api/academy-commerce", 200));
    checks.push(await hit("academy_commerce_head", "HEAD", "/api/academy-commerce", 200));
    checks.push(await hit("academy_commerce_post_standard", "POST", "/api/academy-commerce", 200, { uiMode: "standard" }));
    checks.push(await hit("academy_commerce_post_embedded_no_key", "POST", "/api/academy-commerce", 200, { uiMode: "embedded" }));
    checks.push(await hit("academy_commerce_post_explicit_option_no_key", "POST", "/api/academy-commerce", 503, { uiMode: "embedded", checkoutProvider: "stripe" }));

    const standard = checks.find((c) => c.name === "academy_commerce_post_standard");
    if (standard) {
      const hasExpectedContent =
        standard.json?.ok === true &&
        standard.json?.route === "/api/academy-commerce" &&
        standard.json?.checkoutProvider === "fca-local" &&
        standard.json?.primary === true &&
        standard.json?.selfContained === true;
      standard.hasExpectedContent = hasExpectedContent;
      standard.ok = standard.ok && hasExpectedContent;
    }

    const embeddedFallback = checks.find((c) => c.name === "academy_commerce_post_embedded_no_key");
    if (embeddedFallback) {
      const hasSelfContainedSignal = Boolean(
        embeddedFallback.json?.selfContained === true &&
          embeddedFallback.json?.checkoutProvider === "fca-local" &&
          embeddedFallback.json?.primary === true,
      );
      embeddedFallback.selfContainedSignal = hasSelfContainedSignal;
      embeddedFallback.ok = embeddedFallback.ok && hasSelfContainedSignal;
    }

    const stripeOption = checks.find((c) => c.name === "academy_commerce_post_explicit_option_no_key");
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
      slice: "academy-commerce",
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
        slice: "academy-commerce",
        lockedAt: summary.generatedAt,
        programPath: summary.programPath,
        programHash,
        expectedRoutes: checks.map((c) => ({ method: c.method, routePath: c.routePath, expectedStatus: c.expected })),
        requiredSignals: ["hasExpectedContent", "selfContainedSignal", "stripeOptionSignal"],
      };
      fs.mkdirSync(path.dirname(lockPath), { recursive: true });
      fs.writeFileSync(lockPath, `${JSON.stringify(lockPayload, null, 2)}\n`, "utf8");
      console.log(`[academy-commerce-slice] lock-updated=${path.relative(repoRoot, lockPath)}`);
    } else if (fs.existsSync(lockPath)) {
      const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
      if (lock.programHash !== programHash) {
        console.error("[academy-commerce-slice] FAIL: lock hash mismatch; run lock:dotnet-slice:academy-commerce after intentional changes.");
        process.exitCode = 1;
      }
    }

    console.log("[academy-commerce-slice]", JSON.stringify(summary, null, 2));
    console.log(`[academy-commerce-slice] report=${path.relative(repoRoot, reportPath)}`);

    if (failed.length > 0) {
      console.error("[academy-commerce-slice] FAIL: route/security checks failed.");
      process.exitCode = 1;
    }
  } finally {
    server.kill();
  }
}

main().catch((error) => {
  console.error("[academy-commerce-slice] ERROR", error?.stack || String(error));
  process.exit(1);
});
