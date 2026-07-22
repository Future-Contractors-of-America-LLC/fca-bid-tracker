#!/usr/bin/env node
/**
 * Fail-closed Academy CDN gate used by SWA deploy jobs.
 * Full media sync belongs in academy-media-blob-upload.yml (long timeout).
 * Deploy only proceeds when known CDN objects return HTTP 200.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CDN_BASE = (process.env.FCA_ACADEMY_MEDIA_CDN_BASE || "").replace(/\/$/, "");
const REQUIRED = [
  "academy/media/manifest.json",
  "academy/media/aas-construction-operations-sem1/module-01-auricrux-lecture.html",
  "academy/media/carpentry-core-level-1/module-01-auricrux-lecture.webm",
];

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function headStatus(url) {
  const result = spawnSync(
    "curl",
    ["-sS", "-o", "/dev/null", "-w", "%{http_code}", "-I", "--max-time", "30", url],
    { encoding: "utf8" },
  );
  if (result.error) fail(`curl failed: ${result.error.message}`);
  return String(result.stdout || "").trim();
}

function main() {
  if (!CDN_BASE) {
    fail("FCA_ACADEMY_MEDIA_CDN_BASE is required before SWA slim deploy.");
  }

  // Prefer repo samples when present; always enforce REQUIRED CDN objects.
  const extras = [];
  const mediaRoot = path.join(ROOT, "public", "academy", "media");
  if (fs.existsSync(mediaRoot)) {
    for (const ext of ["json", "html", "webm"]) {
      const stack = [mediaRoot];
      while (stack.length) {
        const dir = stack.pop();
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            stack.push(full);
            continue;
          }
          if (entry.name.toLowerCase().endsWith(`.${ext}`)) {
            extras.push(path.relative(path.join(ROOT, "public"), full).replace(/\\/g, "/"));
            stack.length = 0;
            break;
          }
        }
      }
    }
  }

  const targets = [...new Set([...REQUIRED, ...extras])];
  if (targets.length === 0) {
    fail("No Academy CDN sample paths to verify.");
  }

  console.log(`Verifying ${targets.length} Academy CDN object(s) against ${CDN_BASE}`);
  let failed = 0;
  for (const rel of targets) {
    const url = `${CDN_BASE}/${rel}`;
    const code = headStatus(url);
    console.log(`HEAD ${url} => HTTP ${code}`);
    if (code !== "200") {
      console.error(`CDN verify failed for ${rel} (HTTP ${code})`);
      failed += 1;
    }
  }
  if (failed) fail(`${failed} Academy CDN sample(s) failed verification.`);
  console.log("Academy CDN verification passed.");
}

main();
