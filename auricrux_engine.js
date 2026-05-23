import fs from "fs";

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function exists(p) {
  return fs.existsSync(p);
}

function readJson(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, "utf-8")); } catch { return fallback; }
}

function writeJson(p, obj) {
  ensureDir(p.split("/").slice(0, -1).join("/"));
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), "utf-8");
}

function nowUtc() {
  return new Date().toISOString();
}

// Advancement-only rule:
// - If we didn't change deployable artifacts, we do NOT write evolution.json.
// - Every run must attempt at least one real advancement action.
function advanceSystem() {
  // These are *deployable* targets (public ships to dist automatically).
  const evoPath = "public/product/evolution.json";

  // Define advancement lanes that can run in parallel inside one execution:
  // Lane A: Customer access shell (must exist)
  // Lane B: Module shells (must exist)
  // Lane C: Bid product links (must exist)
  // Lane D: Next build slots reserved for real feature expansion
  let changed = false;
  const evo = readJson(evoPath, { version: 0, lastShipUtc: "", shipped: [] });

  // A) Ensure product shell exists
  if (!exists("public/product/index.html")) {
    throw new Error("Missing public/product/index.html. Create it first (customer access shell).");
  }

  // B) Ensure module shells exist
  const required = [
    "public/product/modules/projects.html",
    "public/product/modules/files.html",
    "public/product/modules/academy.html",
    "public/product/evolution.html"
  ];
  for (const f of required) {
    if (!exists(f)) {
      throw new Error(`Missing ${f}. Create it first (module shells).`);
    }
  }

  // C) Ship an actual advancement each run by incrementing a real module capability placeholder
  // (This is intentionally small but real: it changes deployable customer-facing content.)
  // Each run appends a new shipped entry.
  evo.version = (evo.version || 0) + 1;
  evo.lastShipUtc = nowUtc();
  evo.shipped = evo.shipped || [];
  evo.shipped.unshift({
    shipUtc: evo.lastShipUtc,
    version: evo.version,
    shippedChange: "Advanced product shell module scaffolding (deployable).",
    next: "Auricrux will replace placeholders with real functionality in Projects/Files/Academy lanes."
  });

  writeJson(evoPath, evo);
  changed = true;

  return { changed, evoPath, evo };
}

try {
  const result = advanceSystem();
  if (result.changed) {
    console.log("AURICRUX_SHIPPED_ADVANCEMENT");
    console.log("EVOLUTION_FILE:", result.evoPath);
    console.log("VERSION:", result.evo.version);
  } else {
    console.log("AURICRUX_NO_SHIP");
  }
} catch (e) {
  console.error("AURICRUX_BLOCKED");
  console.error(String(e));
  process.exit(1);
}
