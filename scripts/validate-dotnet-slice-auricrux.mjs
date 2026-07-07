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
const lockPath = path.join(repoRoot, "docs", "qc", "slice-locks", "auricrux.lock.json");
const reportPath = path.join(repoRoot, "generated", "dotnet-slice-auricrux-report.json");

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
    checks.push(await hit("auricrux_options", "OPTIONS", "/api/auricrux", 204));
    checks.push(await hit("auricrux_get", "GET", "/api/auricrux", 200));
    checks.push(await hit("auricrux_post", "POST", "/api/auricrux", 200, {
      message: "slice check",
      route: "/portal/platform",
      context: { source: "slice-validator" },
    }));
    checks.push(await hit("auricrux_patch_denied", "PATCH", "/api/auricrux", 405, { message: "blocked" }));

    checks.push(await hit("auricrux_actions_get", "GET", "/api/auricrux/actions", 200));
    checks.push(await hit("auricrux_actions_post", "POST", "/api/auricrux/actions", 202, {
      mode: "execute",
      targetObjectType: "project",
      targetObjectId: "PRJ-001",
      rationale: "slice lock verification",
    }));
    checks.push(await hit("auricrux_actions_delete_denied", "DELETE", "/api/auricrux/actions", 405));

    for (const check of checks) {
      if (check.name === "auricrux_options") {
        continue;
      }

      let hasExpectedContent = false;
      if (check.name === "auricrux_get") {
        hasExpectedContent =
          check.json?.ok === true &&
          check.json?.route === "/api/auricrux" &&
          check.json?.backingSource === "auricrux-dotnet";
      } else if (check.name === "auricrux_post") {
        hasExpectedContent =
          check.json?.ok === true &&
          check.json?.route === "/api/auricrux" &&
          check.json?.message === "slice check" &&
          check.json?.routeHint === "/portal/platform" &&
          check.json?.backingSource === "auricrux-dotnet";
      } else if (check.name === "auricrux_patch_denied") {
        hasExpectedContent =
          check.json?.success === false &&
          check.json?.error?.code === "METHOD_NOT_ALLOWED";
      } else if (check.name === "auricrux_actions_get") {
        hasExpectedContent =
          check.json?.success === true &&
          check.json?.data?.route === "/api/auricrux/actions" &&
          Array.isArray(check.json?.data?.items);
      } else if (check.name === "auricrux_actions_post") {
        hasExpectedContent =
          check.json?.success === true &&
          check.json?.data?.route === "/api/auricrux/actions" &&
          check.json?.data?.acceptedPayload?.mode === "execute" &&
          check.json?.data?.notYetImplemented === false;
      } else if (check.name === "auricrux_actions_delete_denied") {
        hasExpectedContent =
          check.json?.success === false &&
          check.json?.error?.code === "METHOD_NOT_ALLOWED";
      }

      check.hasExpectedContent = hasExpectedContent;
      check.ok = check.ok && hasExpectedContent;
    }

    const programHash = readProgramHash();
    const failed = checks.filter((c) => !c.ok);

    const summary = {
      generatedAt: new Date().toISOString(),
      slice: "auricrux",
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
        slice: "auricrux",
        lockedAt: summary.generatedAt,
        programPath: summary.programPath,
        programHash,
        expectedRoutes: checks.map((c) => ({ method: c.method, routePath: c.routePath, expectedStatus: c.expected })),
        requiredSignals: ["hasExpectedContent"],
      };
      fs.mkdirSync(path.dirname(lockPath), { recursive: true });
      fs.writeFileSync(lockPath, `${JSON.stringify(lockPayload, null, 2)}\n`, "utf8");
      console.log(`[auricrux-slice] lock-updated=${path.relative(repoRoot, lockPath)}`);
    } else if (fs.existsSync(lockPath)) {
      const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
      if (lock.programHash !== programHash) {
        console.error("[auricrux-slice] FAIL: lock hash mismatch; run lock:dotnet-slice:auricrux after intentional changes.");
        process.exitCode = 1;
      }
    }

    console.log("[auricrux-slice]", JSON.stringify(summary, null, 2));
    console.log(`[auricrux-slice] report=${path.relative(repoRoot, reportPath)}`);

    if (failed.length > 0) {
      console.error("[auricrux-slice] FAIL: route/security/content/accessibility checks failed.");
      process.exitCode = 1;
    }
  } finally {
    server.kill();
  }
}

main().catch((error) => {
  console.error("[auricrux-slice] ERROR", error?.stack || String(error));
  process.exit(1);
});
