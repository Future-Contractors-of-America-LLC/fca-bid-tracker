#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const distRoot = path.join(root, "dist");
const cleanupRoot = path.join(root, "node_modules", ".cache", "fca-dist-cleanup");

function wait(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function makeWritable(targetPath) {
  if (!fs.existsSync(targetPath)) return;
  const stat = fs.lstatSync(targetPath);
  fs.chmodSync(targetPath, stat.isDirectory() ? 0o777 : 0o666);
  if (!stat.isDirectory()) return;
  for (const entry of fs.readdirSync(targetPath)) {
    makeWritable(path.join(targetPath, entry));
  }
}

function removeWithRetries(targetPath, attempts = 8) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      fs.rmSync(targetPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
      return true;
    } catch (error) {
      if (!["EBUSY", "ENOTEMPTY", "EPERM"].includes(error.code) || attempt === attempts) {
        throw error;
      }
      try {
        makeWritable(targetPath);
      } catch {
        // Best-effort recovery for Windows file locks and inherited read-only bits.
      }
      wait(250 * attempt);
    }
  }
  return false;
}

if (!fs.existsSync(distRoot)) {
  process.exit(0);
}

try {
  removeWithRetries(distRoot);
  console.log("Cleaned dist directory.");
} catch (error) {
  fs.mkdirSync(cleanupRoot, { recursive: true });
  const quarantinePath = path.join(cleanupRoot, `dist-${Date.now()}-${process.pid}`);
  fs.renameSync(distRoot, quarantinePath);
  console.warn(`Moved locked dist directory to ${path.relative(root, quarantinePath).replace(/\\/g, "/")}.`);
  try {
    removeWithRetries(quarantinePath, 4);
  } catch (cleanupError) {
    console.warn(`Deferred locked dist cleanup: ${cleanupError.message}`);
  }
}
