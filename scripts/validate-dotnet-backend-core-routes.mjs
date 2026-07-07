#!/usr/bin/env node
import { spawn } from "node:child_process";

const defaultPort = String(5200 + Math.floor(Math.random() * 800));
const port = process.env.FCA_DOTNET_BACKEND_PORT || defaultPort;
const baseUrl = `http://127.0.0.1:${port}`;

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
        cwd: process.cwd(),
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

async function expectStatus(path, method, expected) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
  });
  return {
    path,
    method,
    expected,
    actual: res.status,
    ok: res.status === expected,
  };
}

async function main() {
  const child = await startBackend();
  try {
    const checks = [];
    checks.push(await expectStatus("/api/projects", "GET", 200));
    checks.push(await expectStatus("/api/projects/PRJ-001", "GET", 200));
    checks.push(await expectStatus("/api/projects/PRJ-001/takeoffs", "GET", 200));
    checks.push(await expectStatus("/api/projects/PRJ-001/rfis", "GET", 200));
    checks.push(await expectStatus("/api/auricrux/actions", "DELETE", 405));

    const failed = checks.filter((x) => !x.ok);
    console.log("[dotnet-core-routes]", JSON.stringify({ baseUrl, checks }, null, 2));

    if (failed.length > 0) {
      console.error("[dotnet-core-routes] FAIL");
      process.exitCode = 1;
      return;
    }

    console.log("[dotnet-core-routes] PASS");
  } finally {
    child.kill();
  }
}

main().catch((error) => {
  console.error("[dotnet-core-routes] ERROR", error?.stack || String(error));
  process.exit(1);
});
