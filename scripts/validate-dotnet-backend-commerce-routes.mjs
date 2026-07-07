#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const defaultPort = String(6100 + Math.floor(Math.random() * 700));
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

async function check({ name, method, path: routePath, expected, body }) {
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

    checks.push(await check({ name: "academy_options", method: "OPTIONS", path: "/api/academy-commerce", expected: 204 }));
    checks.push(await check({ name: "academy_get", method: "GET", path: "/api/academy-commerce", expected: 200 }));
    checks.push(await check({ name: "academy_head", method: "HEAD", path: "/api/academy-commerce", expected: 200 }));
    checks.push(await check({ name: "academy_post_standard", method: "POST", path: "/api/academy-commerce", expected: 200, body: { uiMode: "standard" } }));
    checks.push(await check({ name: "academy_post_embedded_no_key", method: "POST", path: "/api/academy-commerce", expected: 200, body: { uiMode: "embedded" } }));
    checks.push(
      await check({
        name: "academy_post_explicit_stripe_no_key",
        method: "POST",
        path: "/api/academy-commerce",
        expected: 503,
        body: { uiMode: "embedded", checkoutProvider: "stripe" },
      }),
    );

    checks.push(await check({ name: "stripe_options", method: "OPTIONS", path: "/api/stripe-checkout", expected: 204 }));
    checks.push(await check({ name: "stripe_post_standard", method: "POST", path: "/api/stripe-checkout", expected: 200, body: { action: "plan" } }));
    checks.push(await check({ name: "stripe_post_embedded_no_key", method: "POST", path: "/api/stripe-checkout", expected: 200, body: { uiMode: "embedded", action: "plan" } }));
    checks.push(
      await check({
        name: "stripe_post_explicit_stripe_no_key",
        method: "POST",
        path: "/api/stripe-checkout",
        expected: 503,
        body: { uiMode: "embedded", action: "plan", checkoutProvider: "stripe" },
      }),
    );
    checks.push(await check({ name: "stripe_get_guard", method: "GET", path: "/api/stripe-checkout", expected: 405 }));

    checks.push(await check({ name: "central_proxy_options", method: "OPTIONS", path: "/api/central-proxy/projects", expected: 204 }));
    checks.push(await check({ name: "central_proxy_get", method: "GET", path: "/api/central-proxy/projects", expected: 200 }));
    checks.push(await check({ name: "central_proxy_post", method: "POST", path: "/api/central-proxy/auricrux/actions", expected: 200, body: { mode: "execute" } }));

    const failed = checks.filter((item) => !item.ok);
    const summary = {
      generatedAt: new Date().toISOString(),
      baseUrl,
      total: checks.length,
      passed: checks.length - failed.length,
      failed: failed.length,
      checks,
    };

    const outPath = path.join(process.cwd(), "generated", "dotnet-backend-commerce-routes-report.json");
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

    console.log("[dotnet-commerce-routes]", JSON.stringify(summary, null, 2));
    console.log(`[dotnet-commerce-routes] report=${path.relative(process.cwd(), outPath)}`);

    if (failed.length > 0) {
      console.error("[dotnet-commerce-routes] FAIL");
      process.exitCode = 1;
      return;
    }

    console.log("[dotnet-commerce-routes] PASS");
  } finally {
    child.kill();
  }
}

main().catch((error) => {
  console.error("[dotnet-commerce-routes] ERROR", error?.stack || String(error));
  process.exit(1);
});
