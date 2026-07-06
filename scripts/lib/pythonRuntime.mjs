import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

function candidatePythonPaths() {
  const candidates = [];
  const add = (value) => {
    if (value && !candidates.includes(value)) candidates.push(value);
  };

  add(process.env.FCA_PYTHON);
  add(process.env.PYTHON);

  const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local");
  const programFiles = process.env.ProgramFiles || "C:\\Program Files";
  const programFilesX86 = process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)";
  const roots = [
    path.join(localAppData, "Python"),
    path.join(localAppData, "Programs", "Python"),
    programFiles,
    programFilesX86,
  ];

  for (const root of roots) {
    if (!root || !fs.existsSync(root)) continue;
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (!/^python(?:core)?[-\d.]*/i.test(entry.name)) continue;
      add(path.join(root, entry.name, "python.exe"));
    }
  }

  return candidates;
}

function usablePython(command) {
  if (!command) return false;
  const result = spawnSync(command, ["--version"], {
    encoding: "utf8",
    stdio: "pipe",
    timeout: 10000,
    shell: false,
  });
  return result.status === 0 && /python\s+3\./i.test(`${result.stdout}\n${result.stderr}`);
}

export function resolvePythonExecutable() {
  for (const candidate of candidatePythonPaths()) {
    if (fs.existsSync(candidate) && usablePython(candidate)) return candidate;
  }
  return "python";
}

export function quoteCommand(value) {
  return `"${String(value).replace(/"/g, '\\"')}"`;
}

export function pythonShellCommand(scriptAndArgs) {
  return `${quoteCommand(resolvePythonExecutable())} ${scriptAndArgs}`;
}