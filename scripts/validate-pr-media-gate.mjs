#!/usr/bin/env node
/**
 * PR gate: block large/binary academy media from git — use blob CDN instead.
 * See auricrux-central/auricrux/system/laptop_pr_gate_policy.json
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const BANNED = [".webm", ".mp3", ".mp4", ".mov", ".zip"];
const BANNED_PREFIX = "public/academy/media/";
const MAX_BYTES = Number(process.env.FCA_PR_MAX_FILE_BYTES || 1024 * 1024);

function changedFiles() {
  const base = process.env.GITHUB_BASE_REF;
  if (base) {
    const out = execSync(`git diff --name-only origin/${base}...HEAD`, { encoding: "utf8" });
    return out.split("\n").map((s) => s.trim()).filter(Boolean);
  }
  const out = execSync("git diff --name-only HEAD~1 HEAD", { encoding: "utf8" });
  return out.split("\n").map((s) => s.trim()).filter(Boolean);
}

function fail(msg) {
  console.error(`::error::${msg}`);
  process.exit(1);
}

const files = changedFiles();
for (const file of files) {
  const norm = file.replace(/\\/g, "/");
  const ext = path.extname(norm).toLowerCase();
  if (norm.includes(BANNED_PREFIX) && BANNED.includes(ext)) {
    fail(
      `${file}: academy ${ext} must not be committed — upload via blob CDN ` +
        `(scripts/academy/upload_academy_blob_media.ps1 / SWA workflow blob batch).`,
    );
  }
  if (norm === "auricrux/system/academy_uhd_render_queue.json") {
    fail(`${file}: render queue is Primary-only runtime state — do not PR from laptop.`);
  }
  if (!fs.existsSync(file)) continue;
  const size = fs.statSync(file).size;
  if (size > MAX_BYTES && !norm.endsWith("package-lock.json")) {
    fail(`${file}: ${size} bytes exceeds PR limit ${MAX_BYTES} — use blob storage.`);
  }
}

console.log(`PR media gate OK (${files.length} files checked).`);
