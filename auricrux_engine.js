import fs from "node:fs";
import path from "node:path";

// =====================
// CONSTANTS (EXECUTIVE)
// =====================

// Allow overrides via workflow/env without changing code
const BID_API =
  process.env.BID_API ||
  "https://auricrux-bid-api-node-ftcueggjg4b0ehbs.centralus-01.azurewebsites.net/api/bids";

const PILOT_CHECKOUT_BASE =
  process.env.PILOT_CHECKOUT_BASE ||
  "https://buy.stripe.com/bJe14o0fQ5Pn8Tt7Bw5gc01";

// Customer-visible/state artifacts (these are the system)
const PIPELINE_PATH = "public/auricrux/pipeline/pipeline.json";
const PAY_DIR = "public/auricrux/payments";
const ONBOARD_DIR = "public/onboarding";
const OFFERS_DIR = "public/offers";
const PRODUCT_SHELL = "public/product/index.html";
const MODULES_DIR = "public/modules";

// Persistent executive memory as governed evidence artifact
const BRAIN_PATH = "auricrux/system/brain.json";
const OFFERS_REGISTRY = "auricrux/system/offers.json";

// =====================
// UTILITIES
// =====================
const nowUtc = () => new Date().toISOString();

const exists = (p) => fs.existsSync(p);

const ensureDir = (dirPath) => {
  if (!dirPath) return;
  fs.mkdirSync(dirPath, { recursive: true });
};

const ensureDirForFile = (filePath) => {
  const dir = path.dirname(filePath);
  if (dir && dir !== ".") ensureDir(dir);
};

const readText = (p) => fs.readFileSync(p, "utf-8");

const writeText = (p, c) => {
  ensureDirForFile(p);
  fs.writeFileSync(p, c, "utf-8");
};

const readJson = (p, def) => {
  try {
    return JSON.parse(readText(p));
  } catch {
    return def;
  }
};

const writeJson = (p, obj) => writeText(p, JSON.stringify(obj, null, 2));

function upsert(arr, key, obj) {
  const i = arr.findIndex((x) => x && x[key] === obj[key]);
  if (i >= 0) arr[i] = { ...arr[i], ...obj };
  else arr.unshift(obj);
}

// =====================
// OFFERS (NOT LOCKED)
// =====================
function ensureOffersRegistry() {
  if (exists(OFFERS_REGISTRY)) return;

  writeJson(OFFERS_REGISTRY, {
    version: 1,
    updatedUtc: nowUtc(),
    offers: [
      {
        id: "pilot",
        name: "FCA Pilot (30 Days)",
        priceUsd: 2500,
        priority: 1,
        checkoutBase: PILOT_CHECKOUT_BASE,
        status: "active",
        notes: "Primary offer when readiness triggers exist.",
      },
      {
        id: "starter",
        name: "FCA Starter",
        priceUsd: 99,
        priority: 2,
        checkoutBase: "",
        status: "draft",
        notes: "Downsell only when forced by price resistance or exploratory intent.",
      },
    ],
  });
}

function checkoutUrl(offer, intakeId) {
  if (!offer || !offer.checkoutBase) return "";
  return (
    offer.checkoutBase +
    "?client_reference_id=" +
    encodeURIComponent(intakeId)
  );
}

// =====================
// CUSTOMER SURFACES (SHELL + MODULES)
// =====================
function ensureProductShellAndModules() {
  ensureDir("public/product");
  ensureDir("public/intake");
  ensureDir("public/pipeline");
  ensureDir("public/auricrux/pipeline");
  ensureDir(PAY_DIR);
  ensureDir(ONBOARD_DIR);
  ensureDir(OFFERS_DIR);
  ensureDir(MODULES_DIR);

  // Product shell
  if (!exists(PRODUCT_SHELL)) {
    writeText(
      PRODUCT_SHELL,
      `<!doctype html><html><head><meta charset="utf-8"><title>FCA Product Shell</title>
<style>
body{font-family:Arial;padding:24px;max-width:980px;margin:auto}
.card{border:1px solid #ddd;border-radius:12px;padding:16px;margin:12px 0}
a{display:inline-block;margin-right:12px;margin-top:6px}
</style></head>
<body>
<h1>Future Contractors of America</h1>

<div class="card">
  <h2>Offers</h2>
  /offers/pilot.htmlPilot</a>
  /offers/starter.htmlStarter</a>
</div>

<div class="card">
  <h2>Start</h2>
  /intake/Start Intake</a>
  /onboarding/Onboarding Lookup</a>
  /pipeline/Pipeline</a>
</div>

<div class="card">
  <h2>Bid System</h2>
  /tyler-entry/Bid Entry</a>
  /tyler-status/Bid Status</a>
</div>

<div class="card">
  <h2>Core Modules (Expanding)</h2>
  /modules/projects.htmlProjects</a>
  /modules/files.htmlFiles</a>
  /modules/academy.htmlAcademy</a>
</div>
</body></html>`
    );
  }

  // Module shells
  const modulePages = [
    ["projects", "Projects Module", "Project/Job spine entrypoint. Expansion lane active."],
    ["files", "Files Module", "Files/Document spine entrypoint. Ingestion lane active."],
    ["academy", "Academy Module", "Academy spine entrypoint. Curriculum lane active."],
  ];

  for (const [id, title, desc] of modulePages) {
    const p = `${MODULES_DIR}/${id}.html`;
    if (!exists(p)) {
      writeText(
        p,
        `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family:Arial;padding:24px;max-width:900px;margin:auto">
<h1>${title}</h1>
<p>${desc}</p>
<p>/product/Back to Product Shell</a></p>
</body></html>`
      );
    }
  }

  // Onboarding lookup index
  const onboardIndex = "public/onboarding/index.html";
  if (!exists(onboardIndex)) {
    writeText(
      onboardIndex,
      `<!doctype html><html><head><meta charset="utf-8"><title>Onboarding</title></head>
<body style="font-family:Arial;padding:24px;max-width:900px;margin:auto">
<h1>Onboarding Lookup</h1>
<p>Enter your Intake ID:</p>
<input id="iid" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:8px" placeholder="intake-1234567890">
<button id="go" style="padding:10px 14px;border:1px solid #222;border-radius:10px;background:#fff;margin-top:10px">Open</button>
<pre id="out" style="background:#f7f7f7;border:1px solid #ddd;padding:12px;border-radius:10px;margin-top:12px">Ready.</pre>
<script>
go.onclick = () => {
  const v = (iid.value||"").trim();
  if(!v){ out.textContent="Enter an Intake ID."; return; }
  location.href = "/onboarding/" + encodeURIComponent(v) + ".html";
};
</script>
<p>/product/Back to Product Shell</a></p>
</body></html>`
    );
  }

  // Pipeline viewer
  const pipelineViewer = "public/pipeline/index.html";
  if (!exists(pipelineViewer)) {
    writeText(
      pipelineViewer,
      `<!doctype html><html><head><meta charset="utf-8"><title>Pipeline</title></head>
<body style="font-family:Arial;padding:24px;max-width:1100px;margin:auto">
<h1>Pipeline (Live State)</h1>
<p>This view is generated by Auricrux from intake/offer/payment/onboarding state.</p>
<pre id="out" style="background:#f7f7f7;border:1px solid #ddd;padding:12px;border-radius:10px;overflow:auto">Loading...</pre>
<script>
fetch('/auricrux/pipeline/pipeline.json', { cache:'no-store' })
  .then(r=>r.json()).then(j=>out.textContent=JSON.stringify(j,null,2))
  .catch(()=>out.textContent="Pipeline not generated yet.");
</script>
<p>/product/Back to Product Shell</a></p>
</body></html>`
    );
  }
}

// =====================
// OFFERS PAGES (CUSTOMER VISIBLE)
// =====================
function shipOfferPages(offersRegistry) {
  const pilot = offersRegistry.offers.find((o) => o.id === "pilot") || {
    name: "Pilot",
    priceUsd: 2500,
  };
  const starter = offersRegistry.offers.find((o) => o.id === "starter") || {
    name: "Starter",
    priceUsd: 99,
    status: "draft",
  };

  writeText(
    `${OFFERS_DIR}/pilot.html`,
    `<!doctype html><html><head><meta charset="utf-8"><title>Pilot</title></head>
<body style="font-family:Arial;padding:24px;max-width:900px;margin:auto">
<h1>$${pilot.priceUsd} ${pilot.name}</h1>
<p>Primary offer when readiness triggers exist.</p>
<p>Checkout (requires Intake ID): Start at /intake//intake/</a>.</p>
<p>/product/Back to Product Shell</a></p>
</body></html>`
  );

  writeText(
    `${OFFERS_DIR}/starter.html`,
    `<!doctype html><html><head><meta charset="utf-8"><title>Starter</title></head>
<body style="font-family:Arial;padding:24px;max-width:900px;margin:auto">
<h1>$${starter.priceUsd} ${starter.name}</h1>
<p>Status: ${starter.status}</p>
<p>This offer is present and will be finalized. Pilot remains primary.</p>
<p>/intake/Start Intake</a></p>
<p>/product/Back to Product Shell</a></p>
</body></html>`
  );
}

// =====================
// PIPELINE STATE
// =====================
function ensurePipeline() {
  const def = { version: 1, updatedUtc: "", leads: [], offers: [], payments: [], onboarding: [] };

  // Ensure directory exists for pipeline path
  ensureDirForFile(PIPELINE_PATH);

  if (!exists(PIPELINE_PATH)) {
    writeJson(PIPELINE_PATH, def);
  }
  return readJson(PIPELINE_PATH, def);
}

// =====================
// ONBOARDING PAGES
// =====================
function onboardingPage(intakeId, state) {
  const paidLine = state.paid
    ? `<p><b>Payment:</b> confirmed ✅</p>`
    : `<p><b>Payment:</b> awaiting payment ❌</p>`;

  const checkout = state.checkoutUrl || "";

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Onboarding ${intakeId}</title>
<style>
body{font-family:Arial;padding:24px;max-width:900px;margin:auto}
.card{border:1px solid #ddd;border-radius:12px;padding:16px;margin:12px 0}
pre{background:#f7f7f7;border:1px solid #ddd;padding:12px;border-radius:10px;overflow:auto}
</style></head>
<body>
<h1>FCA Onboarding</h1>
<p><b>Intake ID:</b> ${intakeId}</p>
${paidLine}

<div class="card">
<h2>Next Steps</h2>
${
  state.paid
    ? `
<ol>
  <li>Welcome call scheduled (Auricrux will propose times).</li>
  <li>Upload plan set / scope docs (Files module next).</li>
  <li>Auricrux generates first action plan + milestones.</li>
</ol>
`
    : `
<p>Complete Pilot checkout to begin onboarding:</p>
<p>${checkout}Complete Pilot Checkout</a></p>
`
}
</div>

<div class="card">
<h2>Status</h2>
<pre>${JSON.stringify(state, null, 2)}</pre>
</div>

<p>/product/Back to Product Shell</a></p>
</body></html>`;
}

// =====================
// API OPERATIONS
// =====================
async function fetchBids() {
  const r = await fetch(BID_API);
  if (!r.ok) throw new Error("GET bids failed: " + r.status);
  return await r.json();
}

async function postBid(bid) {
  const r = await fetch(BID_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bid),
  });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error("POST bid failed: " + r.status + " " + t);
  }
  return await r.json();
}

// =====================
// BRAIN (EXECUTIVE MEMORY)
// =====================
function ensureBrain() {
  ensureDirForFile(BRAIN_PATH);

  if (exists(BRAIN_PATH)) return readJson(BRAIN_PATH, {});
  const brain = { version: 1, createdUtc: nowUtc(), lastRunUtc: "", lastShipped: [] };
  writeJson(BRAIN_PATH, brain);
  return brain;
}

// =====================
// AUTONOMOUS EXECUTIVE EXPANSION
// =====================
function expandSystem() {
  const expansionDir = "auricrux/expansion";
  ensureDir(expansionDir);

  const filename = `${expansionDir}/expansion-${Date.now()}.json`;

  writeJson(filename, {
    createdUtc: nowUtc(),
    nextObjectives: [
      "Expand Projects system into real job tracking",
      "Expand Files system into document ingestion + analysis",
      "Expand Academy into training + credential mapping",
      "Improve onboarding workflow automation",
      "Expand revenue system with Starter + future offers",
      "Improve customer experience surfaces",
    ],
    mandate: "Expand FCA ecosystem across ALL modules simultaneously with no dependency on human input.",
  });

  return filename;
}

// =====================
// EXECUTIVE RUN LOOP
// =====================
async function main() {
  // Ensure all system directories exist
  ensureDir(PAY_DIR);
  ensureDir(ONBOARD_DIR);
  ensureDir("public/auricrux/pipeline");
  ensureDir("auricrux/system");

  ensureOffersRegistry();
  ensureProductShellAndModules();

  const offersRegistry = readJson(OFFERS_REGISTRY, { offers: [] });
  shipOfferPages(offersRegistry);

  const brain = ensureBrain();
  const pipeline = ensurePipeline();
  const bids = await fetchBids();

  const pilot = offersRegistry.offers.find((o) => o.id === "pilot");

  // 1) Intake -> Lead -> Offer
  for (const b of bids) {
    if (!b) continue;

    // Only process customer-intake bids with intakeId
    if (b.source === "customer-intake" && b.intakeId) {
      // Capture lead
      upsert(pipeline.leads, "intakeId", {
        intakeId: b.intakeId,
        company: b.company || "",
        project: b.project || "",
        value: b.value || 0,
        createdUtc: b.createdAt || nowUtc(),
      });

      // Capture offer
      const url = checkoutUrl(pilot, b.intakeId);
      upsert(pipeline.offers, "intakeId", {
        intakeId: b.intakeId,
        offerId: "pilot",
        amount: 2500,
        checkoutUrl: url,
        offeredUtc: nowUtc(),
      });

      // Avoid spamming API by re-posting if already offered
      if (b.status !== "pilot-offered") {
        await postBid({
          ...b,
          status: "pilot-offered",
          nextAction: "Complete Pilot checkout",
          checkoutUrl: url,
        });
      }
    }
  }

  // 2) Payment proof detection (repo-based proof file)
  for (const offerRec of pipeline.offers) {
    const proofPath = `${PAY_DIR}/${offerRec.intakeId}.json`;

    const stateBase = {
      intakeId: offerRec.intakeId,
      offerId: offerRec.offerId || "pilot",
      checkoutUrl: offerRec.checkoutUrl || "",
      paid: false,
    };

    if (exists(proofPath)) {
      const proof = readJson(proofPath, {});
      upsert(pipeline.payments, "intakeId", {
        intakeId: offerRec.intakeId,
        paidUtc: proof.paidUtc || nowUtc(),
        proof,
      });

      upsert(pipeline.onboarding, "intakeId", {
        intakeId: offerRec.intakeId,
        startedUtc: nowUtc(),
        status: "active",
      });

      const state = { ...stateBase, paid: true, proof };
      writeText(`${ONBOARD_DIR}/${offerRec.intakeId}.html`, onboardingPage(offerRec.intakeId, state));
    } else {
      writeText(`${ONBOARD_DIR}/${offerRec.intakeId}.html`, onboardingPage(offerRec.intakeId, stateBase));
    }
  }

  // Write pipeline artifact
  pipeline.updatedUtc = nowUtc();
  writeJson(PIPELINE_PATH, pipeline);

  // Executive proof: shipped actions are real customer surfaces + pipeline state
  brain.lastRunUtc = nowUtc();
  brain.lastShipped = [
    "Customer offers pages shipped (/offers/*)",
    "Customer intake shipped (/intake/)",
    "Onboarding pages shipped (/onboarding/<intakeId>.html)",
    "Pipeline state shipped (/auricrux/pipeline/pipeline.json)",
  ];
  writeJson(BRAIN_PATH, brain);

  console.log("AURICRUX_EXEC_COMPLETE");
  console.log("PIPELINE_UPDATED:", PIPELINE_PATH);
}

// =====================
// EXECUTION (CLEAN + VALID)
// =====================
main()
  .then(() => {
    const expansionFile = expandSystem();
    console.log("EXPANSION_GENERATED:", expansionFile);
  })
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });


