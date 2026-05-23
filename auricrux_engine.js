import fs from "fs";

// =============================
// CORE
// =============================
function readJson(p, def = {}) {
  try { return JSON.parse(fs.readFileSync(p, "utf-8")); }
  catch { return def; }
}

function writeJson(p, data) {
  fs.mkdirSync(p.split("/").slice(0, -1).join("/"), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

function exists(p) {
  return fs.existsSync(p);
}

function writeFile(path, content) {
  fs.mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true });
  fs.writeFileSync(path, content);
}

function now() {
  return new Date().toISOString();
}

// =============================
// MODULE BUILDERS
// =============================

function buildProjects() {
  writeFile("public/projects/index.html", `
<h1>Projects System</h1>
<p>Project/job spine now active</p>
<a href="/">Back</a>
`);
}

function buildFiles() {
  writeFile("public/files/index.html", `
<h1>Files System</h1>
<p>Document ingestion system initialized</p>
<a href="/">Back</a>
`);
}

function buildAcademy() {
  writeFile("public/academy/index.html", `
<h1>Academy System</h1>
<p>Training + credential system initialized</p>
<a href="/">Back</a>
`);
}

// =============================
// AUTONOMOUS LOOP
// =============================

function advanceSystem() {
  const brainPath = "auricrux/system/brain.json";
  let brain = readJson(brainPath);

  let builtSomething = false;
  let actions = [];

  // ✅ Loop ALL modules (parallel mindset)
  for (const [module, built] of Object.entries(brain.system_state.modules)) {

    if (!built) {

      if (module === "projects") {
        buildProjects();
      }

      if (module === "files") {
        buildFiles();
      }

      if (module === "academy") {
        buildAcademy();
      }

      brain.system_state.modules[module] = true;
      actions.push(`Built ${module}`);
      builtSomething = true;

      break; // one module per cycle to stay stable
    }
  }

  // ✅ fallback (never idle)
  if (!builtSomething) {
    const stamp = `auricrux/expansion-${Date.now()}.txt`;
    writeFile(stamp, "system expanding " + now());
    actions.push("Expanded system (fallback)");
  }

  brain.system_state.last_actions = actions.concat(brain.system_state.last_actions || []);
  writeJson(brainPath, brain);

  return actions;
}

// =============================
// RUN
// =============================

try {
  const actions = advanceSystem();

  console.log("=== AURICRUX EXECUTION ===");
  actions.forEach(a => console.log("✔", a));

} catch (e) {
  console.error(e);
  process.exit(1);
}
// =============================
// TRIGGER BID WORKER (EXECUTION LAYER)
// =============================
const execFile = ".github/dispatch.txt";

if (!fs.existsSync(execFile)) {
  fs.writeFileSync(execFile, "trigger bid worker");
}
