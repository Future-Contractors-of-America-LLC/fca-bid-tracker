#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const defaultPort = String(9500 + Math.floor(Math.random() * 400));
const port = process.env.FCA_DOTNET_BACKEND_PORT || defaultPort;
const baseUrl = `http://127.0.0.1:${port}`;
const repoRoot = process.cwd();
const programPath = path.join(repoRoot, "backend-dotnet", "Fca.BidTracker.Api", "Program.cs");
const lockPath = path.join(repoRoot, "docs", "qc", "slice-locks", "central-proxy.lock.json");
const reportPath = path.join(repoRoot, "generated", "dotnet-slice-central-proxy-report.json");

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
    checks.push(await hit("central_proxy_options", "OPTIONS", "/api/central-proxy/projects", 204));
    checks.push(await hit("central_proxy_get", "GET", "/api/central-proxy/projects", 200));
    checks.push(await hit("central_proxy_post", "POST", "/api/central-proxy/auricrux/actions", 200, { mode: "execute" }));
    checks.push(await hit("central_proxy_patch", "PATCH", "/api/central-proxy/projects/PRJ-001", 200, { stage: "qualified" }));
    checks.push(await hit("central_proxy_delete", "DELETE", "/api/central-proxy/projects/PRJ-001", 200));

    const contentChecks = checks.filter((c) => c.name !== "central_proxy_options");
    for (const check of contentChecks) {
      const expectedPath = check.routePath.replace("/api/central-proxy", "") || "/";
      const hasExpectedContent =
        check.json?.ok === true &&
        check.json?.route === "/api/central-proxy/{**resourcePath}" &&
        check.json?.requestPath === expectedPath &&
        String(check.json?.method || "").toUpperCase() === check.method;
      check.hasExpectedContent = hasExpectedContent;
      check.ok = check.ok && hasExpectedContent;
    }

    const programHash = readProgramHash();
    const failed = checks.filter((c) => !c.ok);

    const summary = {
      generatedAt: new Date().toISOString(),
      slice: "central-proxy",
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
        slice: "central-proxy",
        lockedAt: summary.generatedAt,
        programPath: summary.programPath,
        programHash,
        expectedRoutes: checks.map((c) => ({ method: c.method, routePath: c.routePath, expectedStatus: c.expected })),
        requiredSignals: ["hasExpectedContent"],
      };
      fs.mkdirSync(path.dirname(lockPath), { recursive: true });
      fs.writeFileSync(lockPath, `${JSON.stringify(lockPayload, null, 2)}\n`, "utf8");
      console.log(`[central-proxy-slice] lock-updated=${path.relative(repoRoot, lockPath)}`);
    } else if (fs.existsSync(lockPath)) {
      const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
      if (lock.programHash !== programHash) {
        console.error("[central-proxy-slice] FAIL: lock hash mismatch; run lock:dotnet-slice:central-proxy after intentional changes.");
        process.exitCode = 1;
      }
    }

    console.log("[central-proxy-slice]", JSON.stringify(summary, null, 2));
    console.log(`[central-proxy-slice] report=${path.relative(repoRoot, reportPath)}`);

    if (failed.length > 0) {
      console.error("[central-proxy-slice] FAIL: route/security/content/accessibility checks failed.");
      process.exitCode = 1;
    }
  } finally {
    server.kill();
  }
}

main().catch((error) => {
  console.error("[central-proxy-slice] ERROR", error?.stack || String(error));
  process.exit(1);
});
