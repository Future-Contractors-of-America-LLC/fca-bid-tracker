#!/usr/bin/env node
/**
 * PR gate: block large/binary academy media from git — use blob CDN instead.
 * See auricrux-central/auricrux/system/laptop_pr_gate_policy.json
 */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BANNED = [".webm", ".mp3", ".mp4", ".mov", ".zip"];
const BANNED_PREFIX = "public/academy/media/";
const MAX_BYTES = Number(process.env.FCA_PR_MAX_FILE_BYTES || 1024 * 1024);
const MAX_BUFFER = 64 * 1024 * 1024;

function gitNameOnly(args) {
  // Prefer execFile (no shell) with a large maxBuffer. On ENOBUFS / maxBuffer
  // overflow, fall back to writing names to a temp file so huge PR diffs still work.
  try {
    const out = execFileSync("git", args, {
      encoding: "utf8",
      maxBuffer: MAX_BUFFER,
    });
    return out.split("\n").map((s) => s.trim()).filter(Boolean);
  } catch (err) {
    const msg = String(err?.message || err);
    const overflow =
      err?.code === "ENOBUFS" ||
      /ENOBUFS|maxBuffer|stdout maxBuffer/i.test(msg);
    if (!overflow) throw err;
  }

  const tmp = path.join(os.tmpdir(), `fca-pr-media-gate-${process.pid}.txt`);
  try {
    const fd = fs.openSync(tmp, "w");
    const result = spawnSync("git", args, {
      stdio: ["ignore", fd, "pipe"],
      encoding: "utf8",
      maxBuffer: MAX_BUFFER,
    });
    fs.closeSync(fd);
    if (result.status !== 0) {
      const detail = (result.stderr || result.error || `git exit ${result.status}`).toString();
      throw new Error(`git ${args.join(" ")} failed: ${detail}`);
    }
    return fs
      .readFileSync(tmp, "utf8")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  } finally {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
}

function changedFiles() {
  const base = process.env.GITHUB_BASE_REF;
  if (base) {
    return gitNameOnly(["diff", "--name-only", `origin/${base}...HEAD`]);
  }
  return gitNameOnly(["diff", "--name-only", "HEAD~1", "HEAD"]);
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
