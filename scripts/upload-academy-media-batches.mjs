#!/usr/bin/env node
/**
 * Batched academy media upload to Azure Blob CDN.
 * SWA cannot host ~44k academy files; they must live on blob storage.
 *
 * Usage:
 *   node scripts/upload-academy-media-batches.mjs
 *   node scripts/upload-academy-media-batches.mjs --patterns html,json
 *   node scripts/upload-academy-media-batches.mjs --dry-run
 *
 * Env:
 *   FCA_BLOB_STORAGE_CONNECTION (required) — storage connection string
 *   FCA_ACADEMY_MEDIA_CONTAINER (default fca-academy-media)
 *   FCA_ACADEMY_MEDIA_SOURCE (default public/academy/media)
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const patternsArg = process.argv.find((a) => a.startsWith("--patterns="));
const DEFAULT_PATTERNS = ["json", "mp3", "webm", "html"];
const patterns = patternsArg
  ? patternsArg.replace("--patterns=", "").split(",").map((p) => p.trim()).filter(Boolean)
  : DEFAULT_PATTERNS;

const connection = process.env.FCA_BLOB_STORAGE_CONNECTION || "";
const container = process.env.FCA_ACADEMY_MEDIA_CONTAINER || "fca-academy-media";
const source = path.resolve(ROOT, process.env.FCA_ACADEMY_MEDIA_SOURCE || "public/academy/media");

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function countFiles(ext) {
  let count = 0;
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.toLowerCase().endsWith(`.${ext}`)) count += 1;
    }
  }
  if (fs.existsSync(source)) walk(source);
  return count;
}

function quoteForCmd(arg) {
  const s = String(arg);
  if (!/[ \t"]/u.test(s)) return s;
  return `"${s.replace(/"/g, '""')}"`;
}

function runAz(azArgs, { capture = false } = {}) {
  // Windows az is az.cmd; shell required. Quote every arg so OneDrive paths with spaces survive.
  // Do NOT pipe huge upload-batch stdout — that triggers spawnSync ENOBUFS on Windows.
  const isWin = process.platform === "win32";
  const command = isWin ? "az.cmd" : "az";
  const stdio = capture ? ["ignore", "pipe", "pipe"] : ["ignore", "inherit", "inherit"];
  const result = isWin
    ? spawnSync(`${command} ${azArgs.map(quoteForCmd).join(" ")}`, {
        encoding: capture ? "utf8" : undefined,
        shell: true,
        env: process.env,
        stdio,
        windowsHide: true,
        maxBuffer: capture ? 16 * 1024 * 1024 : undefined,
      })
    : spawnSync(command, azArgs, {
        encoding: capture ? "utf8" : undefined,
        shell: false,
        env: process.env,
        stdio,
      });
  if (result.error) {
    fail(result.error.message || `az spawn failed for: ${azArgs.join(" ")}`);
  }
  if (result.status !== 0) {
    fail(
      (capture ? result.stderr || result.stdout : "") ||
        `az ${azArgs.slice(0, 4).join(" ")} ... failed (exit ${result.status})`
    );
  }
  return capture ? (result.stdout || "").trim() : "";
}

function main() {
  if (!fs.existsSync(source)) fail(`Source missing: ${source}`);
  if (!connection && !dryRun) {
    fail("FCA_BLOB_STORAGE_CONNECTION is required (storage connection string).");
  }

  console.log(`Academy media source: ${source}`);
  console.log(`Container: ${container}`);
  console.log(`Patterns: ${patterns.join(", ")}`);
  console.log(`Mode: ${dryRun ? "dry-run" : "upload"}`);

  if (!dryRun) {
    runAz(
      [
        "storage",
        "container",
        "create",
        "--name",
        container,
        "--connection-string",
        connection,
        "--public-access",
        "blob",
        "--only-show-errors",
      ],
      { capture: true }
    );
  }

  const summary = [];
  for (const ext of patterns) {
    const localCount = countFiles(ext);
    console.log(`\n=== Batch *.${ext} (${localCount} local files) ===`);
    if (localCount === 0) {
      summary.push({ ext, localCount, status: "skip-empty" });
      continue;
    }
    if (dryRun) {
      summary.push({ ext, localCount, status: "dry-run" });
      continue;
    }

    const started = Date.now();
    runAz([
      "storage",
      "blob",
      "upload-batch",
      "--connection-string",
      connection,
      "--destination",
      container,
      "--source",
      source,
      "--pattern",
      `*.${ext}`,
      "--destination-path",
      "academy/media",
      "--overwrite",
      "true",
      "--only-show-errors",
    ]);
    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    console.log(`Uploaded *.${ext} in ${seconds}s`);
    summary.push({ ext, localCount, status: "uploaded", seconds: Number(seconds) });
  }

  console.log("\n=== Upload summary ===");
  for (const row of summary) {
    console.log(`- ${row.ext}: ${row.localCount} files → ${row.status}${row.seconds ? ` (${row.seconds}s)` : ""}`);
  }
}

main();
