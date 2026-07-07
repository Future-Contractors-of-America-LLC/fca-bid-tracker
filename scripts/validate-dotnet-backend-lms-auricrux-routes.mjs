#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const defaultPort = String(7000 + Math.floor(Math.random() * 700));
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

async function check({ name, method, routePath, expected, body }) {
  const res = await fetch(`${baseUrl}${routePath}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  return {
    name,
    method,
    path: routePath,
    expected,
    actual: res.status,
    ok: res.status === expected,
  };
}

async function main() {
  const child = await startBackend();
  try {
    const checks = [];

    checks.push(await check({ name: "lms_options", method: "OPTIONS", routePath: "/api/academy-lms", expected: 204 }));
    checks.push(await check({ name: "lms_get", method: "GET", routePath: "/api/academy-lms", expected: 200 }));
    checks.push(await check({ name: "lms_patch", method: "PATCH", routePath: "/api/academy-lms", expected: 200, body: { courseId: "C-1", status: "in-progress" } }));
    checks.push(await check({ name: "lms_post_guard", method: "POST", routePath: "/api/academy-lms", expected: 405 }));

    checks.push(await check({ name: "auricrux_options", method: "OPTIONS", routePath: "/api/auricrux", expected: 204 }));
    checks.push(await check({ name: "auricrux_get", method: "GET", routePath: "/api/auricrux", expected: 200 }));
    checks.push(await check({ name: "auricrux_training_get", method: "GET", routePath: "/api/auricrux?scope=training", expected: 200 }));
    checks.push(await check({ name: "auricrux_post", method: "POST", routePath: "/api/auricrux", expected: 200, body: { message: "hello", route: "/portal/platform" } }));
    checks.push(await check({ name: "auricrux_delete_guard", method: "DELETE", routePath: "/api/auricrux", expected: 405 }));

    const failed = checks.filter((item) => !item.ok);
    const summary = {
      generatedAt: new Date().toISOString(),
      baseUrl,
      total: checks.length,
      passed: checks.length - failed.length,
      failed: failed.length,
      checks,
    };

    const outPath = path.join(process.cwd(), "generated", "dotnet-backend-lms-auricrux-routes-report.json");
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

    console.log("[dotnet-lms-auricrux-routes]", JSON.stringify(summary, null, 2));
    console.log(`[dotnet-lms-auricrux-routes] report=${path.relative(process.cwd(), outPath)}`);

    if (failed.length > 0) {
      console.error("[dotnet-lms-auricrux-routes] FAIL");
      process.exitCode = 1;
      return;
    }

    console.log("[dotnet-lms-auricrux-routes] PASS");
  } finally {
    child.kill();
  }
}

main().catch((error) => {
  console.error("[dotnet-lms-auricrux-routes] ERROR", error?.stack || String(error));
  process.exit(1);
});
