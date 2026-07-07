#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const defaultPort = String(7800 + Math.floor(Math.random() * 600));
const port = process.env.FCA_DOTNET_BACKEND_PORT || defaultPort;
const baseUrl = `http://127.0.0.1:${port}`;
const repoRoot = process.cwd();
const programPath = path.join(repoRoot, "backend-dotnet", "Fca.BidTracker.Api", "Program.cs");
const lockPath = path.join(repoRoot, "docs", "qc", "slice-locks", "academy-lms.lock.json");
const reportPath = path.join(repoRoot, "generated", "dotnet-slice-academy-lms-report.json");

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function readProgramHash() {
  const src = fs.readFileSync(programPath, "utf8");
  return sha256(src);
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

    const handleLine = (chunk) => {
      const text = String(chunk || "");
      if (text.includes("Now listening on:")) {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        resolve(child);
      }
    };

    child.stdout.on("data", handleLine);
    child.stderr.on("data", (chunk) => {
      stderrText += String(chunk || "");
      handleLine(chunk);
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
  const isJson = (res.headers.get("content-type") || "").toLowerCase().includes("application/json");
  const hasStackTraceLeak = /System\.|Exception|at\s+Microsoft\./i.test(text);

  return {
    name,
    method,
    routePath,
    expected,
    actual: res.status,
    statusOk: res.status === expected,
    isJson,
    noStackTraceLeak: !hasStackTraceLeak,
    ok: res.status === expected && !hasStackTraceLeak,
  };
}

async function main() {
  const writeLock = process.argv.includes("--write-lock");
  const server = await startBackend();
  try {
    const checks = [];
    checks.push(await hit("academy_lms_options", "OPTIONS", "/api/academy-lms", 204));
    checks.push(await hit("academy_lms_get", "GET", "/api/academy-lms", 200));
    checks.push(await hit("academy_lms_patch", "PATCH", "/api/academy-lms", 200, { courseId: "C-01", status: "in-progress" }));
    checks.push(await hit("academy_lms_post_guard", "POST", "/api/academy-lms", 405));
    checks.push(await hit("academy_lms_delete_guard", "DELETE", "/api/academy-lms", 405));

    const programHash = readProgramHash();
    const failed = checks.filter((c) => !c.ok);

    const summary = {
      generatedAt: new Date().toISOString(),
      slice: "academy-lms",
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
        slice: "academy-lms",
        lockedAt: summary.generatedAt,
        programPath: summary.programPath,
        programHash,
        expectedRoutes: checks.map((c) => ({
          method: c.method,
          routePath: c.routePath,
          expectedStatus: c.expected,
        })),
      };
      fs.mkdirSync(path.dirname(lockPath), { recursive: true });
      fs.writeFileSync(lockPath, `${JSON.stringify(lockPayload, null, 2)}\n`, "utf8");
      console.log(`[academy-lms-slice] lock-updated=${path.relative(repoRoot, lockPath)}`);
    } else if (fs.existsSync(lockPath)) {
      const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
      if (lock.programHash !== programHash) {
        console.error("[academy-lms-slice] FAIL: lock hash mismatch; run lock:dotnet-slice:academy-lms after intentional changes.");
        process.exitCode = 1;
      }
    }

    console.log("[academy-lms-slice]", JSON.stringify(summary, null, 2));
    console.log(`[academy-lms-slice] report=${path.relative(repoRoot, reportPath)}`);

    if (failed.length > 0) {
      console.error("[academy-lms-slice] FAIL: route/security checks failed.");
      process.exitCode = 1;
    }
  } finally {
    server.kill();
  }
}

main().catch((error) => {
  console.error("[academy-lms-slice] ERROR", error?.stack || String(error));
  process.exit(1);
});
