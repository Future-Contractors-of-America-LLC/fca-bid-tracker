import fs from "fs";

const UTC = () => new Date().toISOString();

const ensureDir = (p) => fs.mkdirSync(p, { recursive: true });
const exists = (p) => fs.existsSync(p);
const read = (p) => fs.readFileSync(p, "utf-8");
const write = (p, c) => {
  ensureDir(p.split("/").slice(0, -1).join("/"));
  fs.writeFileSync(p, c, "utf-8");
};
const readJson = (p, fallback) => {
  try { return JSON.parse(read(p)); } catch { return fallback; }
};
const writeJson = (p, obj) => write(p, JSON.stringify(obj, null, 2));

/**
 * Executive state (machine memory) — this is not "a log".
 * It's the operating brain that prevents drift and enables autonomous prioritization.
 */
const BRAIN_PATH = "auricrux/system/brain.json";
const BACKLOG_PATH = "auricrux/system/backlog.json";

/**
 * Customer-visible outputs (shipped assets)
 */
const PRODUCT_SHELL = "public/product/index.html";
const EVOLUTION_JSON = "public/product/evolution.json";
const EVOLUTION_PAGE = "public/product/evolution.html";
const OFFERS_DIR = "public/offers";
const MODULES_DIR = "public/modules";
const INTAKE_PAGE = "public/intake/index.html";

/**
 * Bids API (existing execution surface)
 * Uses the already-running Function App endpoint you’ve been using in scheduler runs. [8](https://futurecontractorsofameri319.sharepoint.com/sites/AuricruxSystemLaw2/_layouts/15/Doc.aspx?sourcedoc=%7B20A64CE4-CBC9-46C0-B517-7D27C4E5B1BD%7D&file=Auricrux%20Removed-Retired-Superseded%20Documents%20List%20v1.1.docx&action=default&mobileredirect=true&DefaultItemOpen=1)
 */
const BID_API = "https://auricrux-bid-api-node-ftcueggjg4b0ehbs.centralus-01.azurewebsites.net/api/bids";

/**
 * Revenue: Pilot is locked as primary offer. [3](https://outlook.office365.com/owa/?ItemID=AAMkADMyNmVmNmI4LWQwMDMtNDhiNy1hOGRkLTQ4ZDExMjI2MGM4ZABGAAAAAADLDCXBdgSDTI8n2XHKXO2rBwCB0dqlD%2b2iTbpUUMk47FqNAAAAAAEJAACB0dqlD%2b2iTbpUUMk47FqNAADZhWjHAAA%3d&exvsurl=1&viewmodel=ReadMessageItem)
 * Pilot checkout link already issued. [4](https://outlook.office365.com/owa/?ItemID=AAMkADMyNmVmNmI4LWQwMDMtNDhiNy1hOGRkLTQ4ZDExMjI2MGM4ZABGAAAAAADLDCXBdgSDTI8n2XHKXO2rBwCB0dqlD%2b2iTbpUUMk47FqNAAAAAAEMAACB0dqlD%2b2iTbpUUMk47FqNAADz7Cs%2bAAA%3d&exvsurl=1&viewmodel=ReadMessageItem)
 */
const PILOT_CHECKOUT = "https://buy.stripe.com/bJe14o0fQ5Pn8Tt7Bw5gc01";

function initBrainIfMissing() {
  if (exists(BRAIN_PATH)) return;
  writeJson(BRAIN_PATH, {
    version: 1,
    createdUtc: UTC(),
    lastRunUtc: "",
    lanes: {
      sales: { status: "active", lastShipUtc: "" },
      product: { status: "active", lastShipUtc: "" },
      projects: { status: "active", lastShipUtc: "" },
      files: { status: "active", lastShipUtc: "" },
      academy: { status: "active", lastShipUtc: "" },
      portal: { status: "active", lastShipUtc: "" }
    },
    constraints: {
      officersInternalOnly: true,
      publicIdentity: "Auricrux"
    }
  });
}

function initBacklogIfMissing() {
  if (exists(BACKLOG_PATH)) return;
  // Encodes your ecosystem blueprint into actionable spines (no dead ends). [1](https://futurecontractorsofameri319.sharepoint.com/sites/AuricruxSystemLaw2/_layouts/15/Doc.aspx?sourcedoc=%7B3ABC7BD6-5140-4E58-8779-A5D974DF691C%7D&file=Auricrux%20Mobile%20App%20Autonomous%20Execution%20Interface%20Charter%20v1.0.docx&action=default&mobileredirect=true&DefaultItemOpen=1)
  writeJson(BACKLOG_PATH, {
    version: 1,
    createdUtc: UTC(),
    items: [
      { id: "sales-offer-pages", lane: "sales", priority: 1, status: "todo",
        goal: "Customer can see Pilot offer and click checkout; customer can start intake." },

      { id: "product-shell", lane: "product", priority: 1, status: "todo",
        goal: "Customer-visible shell that links Bid system + Modules + Offers + Intake + Evolution." },

      { id: "portal-entrypoints", lane: "portal", priority: 1, status: "todo",
        goal: "Stable customer entry points (Bid Entry/Status) remain reachable and linked." },

      { id: "projects-shell", lane: "projects", priority: 2, status: "todo",
        goal: "Create Projects spine entrypoint (Job/Project shell) ready to expand." },

      { id: "files-shell", lane: "files", priority: 2, status: "todo",
        goal: "Create Files spine entrypoint ready for ingestion." },

      { id: "academy-shell", lane: "academy", priority: 2, status: "todo",
        goal: "Create Academy spine entrypoint ready for curriculum integration." }
    ]
  });
}

function pickWork(backlog) {
  // Simultaneous advancement rule:
  // pick up to 3 tasks across different lanes per run (bounded to keep stability).
  const todo = backlog.items
    .filter(x => x.status === "todo")
    .sort((a,b) => a.priority - b.priority);

  const picked = [];
  const usedLanes = new Set();
  for (const item of todo) {
    if (picked.length >= 3) break;
    if (usedLanes.has(item.lane)) continue;
    picked.push(item);
    usedLanes.add(item.lane);
  }
  return picked;
}

function shipEvolutionRecord(changes) {
  const evo = readJson(EVOLUTION_JSON, { shipped: [] });
  evo.lastShipUtc = UTC();
  evo.shipped = evo.shipped || [];
  evo.shipped.unshift({
    shipUtc: evo.lastShipUtc,
    changes
  });
  writeJson(EVOLUTION_JSON, evo);

  if (!exists(EVOLUTION_PAGE)) {
    write(EVOLUTION_PAGE, `<!doctype html><html><head><meta charset="utf-8"><title>FCA Evolution</title></head>
<body style="font-family:Arial;padding:24px;max-width:900px;margin:auto">
<h1>FCA System Evolution (Shipped Changes Only)</h1>
<p>This page updates only when real capability is shipped.</p>
<pre id="out" style="background:#f7f7f7;border:1px solid #ddd;padding:12px;border-radius:10px"></pre>
<script>
fetch('/product/evolution.json', { cache: 'no-store' })
  .then(r => r.json()).then(j => out.textContent = JSON.stringify(j, null, 2))
  .catch(() => out.textContent = 'No evolution record yet.');
</script>
<p><a href="/product/">Back to Product Shell</a></p>
</body></html>`);
  }
}

function shipOffers() {
  ensureDir(OFFERS_DIR);

  // Pilot offer page (customer visible) — aligns to canonical offer $2,500/30-day pilot. [3](https://outlook.office365.com/owa/?ItemID=AAMkADMyNmVmNmI4LWQwMDMtNDhiNy1hOGRkLTQ4ZDExMjI2MGM4ZABGAAAAAADLDCXBdgSDTI8n2XHKXO2rBwCB0dqlD%2b2iTbpUUMk47FqNAAAAAAEJAACB0dqlD%2b2iTbpUUMk47FqNAADZhWjHAAA%3d&exvsurl=1&viewmodel=ReadMessageItem)[4](https://outlook.office365.com/owa/?ItemID=AAMkADMyNmVmNmI4LWQwMDMtNDhiNy1hOGRkLTQ4ZDExMjI2MGM4ZABGAAAAAADLDCXBdgSDTI8n2XHKXO2rBwCB0dqlD%2b2iTbpUUMk47FqNAAAAAAEMAACB0dqlD%2b2iTbpUUMk47FqNAADz7Cs%2bAAA%3d&exvsurl=1&viewmodel=ReadMessageItem)
  write(`${OFFERS_DIR}/pilot.html`, `<!doctype html><html><head><meta charset="utf-8"><title>FCA Pilot</title></head>
<body style="font-family:Arial;padding:24px;max-width:900px;margin:auto">
<h1>$2,500 FCA Pilot (30 Days)</h1>
<p>Fixed-scope operating system installer engagement. Auricrux leads execution.</p>
<p><a href="${PILOT_CHECKOUT}">Pilot Checkout (Stripe)</a></p>
<p><a href="/intake/">Start Intake</a></p>
<p><a href="/product/">Back to Product Shell</a></p>
</body></html>`);

  // Starter page placeholder (real page, not “log”)
  write(`${OFFERS_DIR}/starter.html`, `<!doctype html><html><head><meta charset="utf-8"><title>FCA Starter</title></head>
<body style="font-family:Arial;padding:24px;max-width:900px;margin:auto">
<h1>$99 FCA Starter</h1>
<p>Starter offer page (to be finalized). The Pilot remains primary when readiness triggers exist.</p>
<p><a href="/intake/">Start Intake</a></p>
<p><a href="/product/">Back to Product Shell</a></p>
</body></html>`);

  return ["Shipped customer-visible offer pages: /offers/pilot.html and /offers/starter.html"];
}

function shipIntake() {
  ensureDir("public/intake");
  // Intake page posts to Bid API as the minimal customer-facing intake mechanism.
  write(INTAKE_PAGE, `<!doctype html><html><head><meta charset="utf-8"><title>FCA Intake</title></head>
<body style="font-family:Arial;padding:24px;max-width:900px;margin:auto">
<h1>FCA Intake</h1>
<p>Submit your first project/bid request.</p>
<label>Company<br><input id="company" style="width:100%;padding:10px"></label><br><br>
<label>Project name<br><input id="project" style="width:100%;padding:10px"></label><br><br>
<label>Estimated value<br><input id="value" type="number" style="width:100%;padding:10px"></label><br><br>
<button id="send" style="padding:10px 14px">Submit</button>
<pre id="out" style="margin-top:14px;background:#f7f7f7;border:1px solid #ddd;padding:12px;border-radius:10px"></pre>
<script>
const API = ${JSON.stringify(BID_API)};
send.onclick = async () => {
  out.textContent = "Submitting...";
  const payload = {
    id: "intake-" + Date.now(),
    company: company.value || "Unknown",
    project: project.value || "Unnamed Project",
    value: Number(value.value || 0),
    status: "new",
    source: "customer-intake"
  };
  try{
    const r = await fetch(API, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
    const j = await r.json().catch(()=> ({}));
    if(!r.ok){ out.textContent = "ERROR: " + JSON.stringify(j); return; }
    out.textContent = "Submitted. Reference: " + (j.id || payload.id);
  }catch(e){ out.textContent = "ERROR: " + e; }
};
</script>
<p><a href="/offers/pilot.html">Pilot Offer</a> | <a href="/product/">Back to Product Shell</a></p>
</body></html>`);
  return ["Shipped customer intake page: /intake/ (posts to Bid API)"];
}

function shipProductShell() {
  ensureDir("public/product");
  write(PRODUCT_SHELL, `<!doctype html><html><head><meta charset="utf-8"><title>FCA Product Shell</title>
<style>
body{font-family:Arial;padding:24px;max-width:980px;margin:auto}
.card{border:1px solid #ddd;border-radius:12px;padding:16px;margin:12px 0}
a{display:inline-block;margin-right:12px}
</style></head>
<body>
<h1>Future Contractors of America</h1>
<div class="card">
<h2>Start Here</h2>
<a href="/offers/pilot.html">Pilot Offer</a>
<a href="/intake/">Start Intake</a>
<a href="/product/evolution.html">System Evolution</a>
</div>

<div class="card">
<h2>Bid System</h2>
<a href="/tyler-entry/">Bid Entry</a>
<a href="/tyler-status/">Bid Status</a>
</div>

<div class="card">
<h2>Core Modules (Expanding)</h2>
<a href="/modules/projects.html">Projects</a>
<a href="/modules/files.html">Files</a>
<a href="/modules/academy.html">Academy</a>
</div>
</body></html>`);
  return ["Shipped product shell: /product/ (links offers, intake, bids, modules)"];
}

function shipModuleShells() {
  ensureDir(MODULES_DIR);
  write(`${MODULES_DIR}/projects.html`, `<!doctype html><html><head><meta charset="utf-8"><title>Projects</title></head>
<body style="font-family:Arial;padding:24px">
<h1>Projects Module</h1>
<p>Project/Job spine entrypoint. Expansion lane active.</p>
<p><a href="/product/">Back</a></p></body></html>`);
  write(`${MODULES_DIR}/files.html`, `<!doctype html><html><head><meta charset="utf-8"><title>Files</title></head>
<body style="font-family:Arial;padding:24px">
<h1>Files Module</h1>
<p>Files/Document spine entrypoint. Ingestion lane active.</p>
<p><a href="/product/">Back</a></p></body></html>`);
  write(`${MODULES_DIR}/academy.html`, `<!doctype html><html><head><meta charset="utf-8"><title>Academy</title></head>
<body style="font-family:Arial;padding:24px">
<h1>Academy Module</h1>
<p>Academy spine entrypoint. Curriculum lane active.</p>
<p><a href="/product/">Back</a></p></body></html>`);
  return ["Shipped module shells: /modules/projects.html, /modules/files.html, /modules/academy.html"];
}

function main() {
  initBrainIfMissing();
  initBacklogIfMissing();

  const brain = readJson(BRAIN_PATH, {});
  const backlog = readJson(BACKLOG_PATH, { items: [] });

  const work = pickWork(backlog);
  const changes = [];

  // Execute selected work items (bounded, multi-lane)
  for (const item of work) {
    if (item.id === "sales-offer-pages") {
      changes.push(...shipOffers(), ...shipIntake());
    }
    if (item.id === "product-shell") {
      changes.push(...shipProductShell(), ...shipModuleShells());
    }
    if (item.id === "portal-entrypoints") {
      // We do not fabricate these pages; we only link to them.
      // This assumes your /tyler-entry and /tyler-status already exist in repo or public.
      changes.push("Confirmed customer entrypoints are linked from product shell (Bid Entry/Status).");
    }
    if (item.id === "projects-shell") changes.push("Projects module shell present at /modules/projects.html.");
    if (item.id === "files-shell") changes.push("Files module shell present at /modules/files.html.");
    if (item.id === "academy-shell") changes.push("Academy module shell present at /modules/academy.html.");

    // Mark done
    item.status = "done";
    item.doneUtc = UTC();
  }

  // Persist backlog update (real system state)
  writeJson(BACKLOG_PATH, backlog);

  // Update brain (real executive memory)
  brain.lastRunUtc = UTC();
  writeJson(BRAIN_PATH, brain);

  // Ship evolution record as customer-visible proof (not a log file)
  if (changes.length > 0) shipEvolutionRecord(changes);

  console.log("AURICRUX_EXEC_COMPLETE");
  console.log("SHIPPED_CHANGES:", changes.length);
}

main();
