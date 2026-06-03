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

const BRAIN = "auricrux/system/brain.json";
const BACKLOG = "auricrux/system/backlog.json";
const OFFERS = "auricrux/system/offers.json";
const PRODUCT = "public/product/index.html";
const PIPELINE = "public/auricrux/pipeline/pipeline.json";
const PAYMENTS_DIR = "public/auricrux/payments";
const ONBOARD_DIR = "public/onboarding";
const OFFERS_DIR = "public/offers";
const MODULES_DIR = "public/modules";
const INTAKE = "public/intake/index.html";
const PIPELINE_VIEW = "public/pipeline/index.html";
const ONBOARD_INDEX = "public/onboarding/index.html";
const BID_API = "https://auricrux-bid-api-node-ftcueggjg4b0ehbs.centralus-01.azurewebsites.net/api/bids";
const PILOT_CHECKOUT_BASE = "https://buy.stripe.com/bJe14o0fQ5Pn8Tt7Bw5gc01";

function initIfMissing() {
  if (!exists(BRAIN)) writeJson(BRAIN, { version: 1, createdUtc: UTC(), lastRunUtc: "", lastShip: [] });
  if (!exists(OFFERS)) writeJson(OFFERS, {
    version: 1,
    updatedUtc: UTC(),
    offers: [
      { id:"pilot", name:"FCA Pilot (30 Days)", priceUsd:2500, status:"active", priority:1, checkoutBase:PILOT_CHECKOUT_BASE },
      { id:"starter", name:"FCA Starter", priceUsd:99, status:"draft", priority:2, checkoutBase:"" }
    ]
  });
  if (!exists(BACKLOG)) writeJson(BACKLOG, {
    version: 1,
    updatedUtc: UTC(),
    items: [
      { id:"ship-product-shell", lane:"product", priority:1, status:"todo" },
      { id:"ship-offers-intake", lane:"revenue", priority:1, status:"todo" },
      { id:"ship-pipeline-onboarding", lane:"ops", priority:1, status:"todo" },
      { id:"ship-core-modules", lane:"platform", priority:2, status:"todo" }
    ]
  });
  if (!exists(PIPELINE)) writeJson(PIPELINE, { version:1, updatedUtc:"", leads:[], offers:[], payments:[], onboarding:[] });

  ensureDir(PAYMENTS_DIR);
  ensureDir(ONBOARD_DIR);
  ensureDir(OFFERS_DIR);
  ensureDir(MODULES_DIR);
  ensureDir("public/product");
  ensureDir("public/auricrux/pipeline");
  ensureDir("public/pipeline");
  ensureDir("public/bid-entry");
  ensureDir("public/bid-status");
}

function upsert(arr, key, obj) {
  const i = arr.findIndex(x => x[key] === obj[key]);
  if (i >= 0) arr[i] = { ...arr[i], ...obj };
  else arr.unshift(obj);
}

function checkoutUrl(offer, intakeId) {
  if (!offer.checkoutBase) return "";
  return offer.checkoutBase + "?client_reference_id=" + encodeURIComponent(intakeId);
}

function shipCustomerShell() {
  write(PRODUCT, `<!doctype html><html><head><meta charset="utf-8"><title>FCA Product</title>
<style>
body{font-family:Arial;padding:24px;max-width:980px;margin:auto}
.card{border:1px solid #ddd;border-radius:12px;padding:16px;margin:12px 0}
a{display:inline-block;margin-right:12px;margin-top:6px}
</style></head><body>
<h1>Future Contractors of America</h1>
<div class="card"><h2>Start</h2>
<a href="/offers/pilot.html">Pilot</a>
<a href="/offers/starter.html">Starter</a>
<a href="/intake/">Intake</a>
<a href="/onboarding/">Onboarding</a>
<a href="/pipeline/">Pipeline</a>
</div>
<div class="card"><h2>FCA Bid System</h2>
<a href="/bid-entry/">Bid Entry</a>
<a href="/bid-status/">Bid Status</a>
</div>
<div class="card"><h2>Core Modules</h2>
<a href="/modules/projects.html">Projects</a>
<a href="/modules/files.html">Files</a>
<a href="/modules/academy.html">Academy</a>
</div>
</body></html>`);

  write("public/bid-entry/index.html", `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=../fca-customer-entry/index.html"><title>Redirecting to FCA Customer Bid Intake</title></head><body><p>Redirecting to FCA Customer Bid Intake...</p><p><a href="../fca-customer-entry/index.html">Open FCA Customer Bid Intake</a></p></body></html>`);
  write("public/bid-status/index.html", `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=../fca-customer-status/index.html"><title>Redirecting to FCA Customer Bid Status</title></head><body><p>Redirecting to FCA Customer Bid Status...</p><p><a href="../fca-customer-status/index.html">Open FCA Customer Bid Status</a></p></body></html>`);

  return ["Shipped /product/ (customer shell)"];
}

function shipModules() {
  const out = [];
  const modules = [
    ["projects","Projects Module","Project/Job spine entrypoint (expanding)."],
    ["files","Files Module","Files/Document spine entrypoint (expanding)."],
    ["academy","Academy Module","Academy spine entrypoint (expanding)."]
  ];
  for (const [id,title,desc] of modules) {
    const p = `${MODULES_DIR}/${id}.html`;
    if (!exists(p)) {
      write(p, `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family:Arial;padding:24px;max-width:900px;margin:auto">
<h1>${title}</h1><p>${desc}</p><p><a href="/product/">Back</a></p></body></html>`);
      out.push(`Shipped /modules/${id}.html`);
    }
  }
  return out;
}

function shipOffersPages(offers) {
  const out = [];
  const pilot = offers.find(o=>o.id==="pilot");
  const starter = offers.find(o=>o.id==="starter");

  write(`${OFFERS_DIR}/pilot.html`, `<!doctype html><html><head><meta charset="utf-8"><title>Pilot</title></head>
<body style="font-family:Arial;padding:24px;max-width:900px;margin:auto">
<h1>$${pilot.priceUsd} ${pilot.name}</h1>
<p>Primary offer.</p>
<p>Start at <a href="/intake/">/intake/</a> to generate your Intake ID.</p>
<p><a href="/product/">Back</a></p></body></html>`);
  out.push("Shipped /offers/pilot.html");

  write(`${OFFERS_DIR}/starter.html`, `<!doctype html><html><head><meta charset="utf-8"><title>Starter</title></head>
<body style="font-family:Arial;padding:24px;max-width:900px;margin:auto">
<h1>$${starter.priceUsd} ${starter.name}</h1>
<p>Status: ${starter.status}</p>
<p>Starter exists and will activate once checkoutBase is set.</p>
<p><a href="/intake/">/intake/</a> | <a href="/product/">Back</a></p></body></html>`);
  out.push("Shipped /offers/starter.html");

  if (!exists(INTAKE)) {
    write(INTAKE, `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Intake</title>
<style>body{font-family:Arial;padding:24px;max-width:900px;margin:auto}input{width:100%;padding:10px;border:1px solid #ccc;border-radius:8px}button{padding:10px 14px;border:1px solid #222;border-radius:10px;background:#fff}</style>
</head><body>
<h1>FCA Intake</h1>
<label>Company<br><input id="company"></label><br><br>
<label>Project<br><input id="project"></label><br><br>
<label>Value (USD)<br><input id="value" type="number"></label><br><br>
<button id="submit">Submit Intake</button>
<pre id="out" style="background:#f7f7f7;border:1px solid #ddd;padding:12px;border-radius:10px;margin-top:12px">Ready.</pre>
<script>
const API=${JSON.stringify(BID_API)};
const CHECKOUT=${JSON.stringify(PILOT_CHECKOUT_BASE)};
submit.onclick=async ()=>{
  const intakeId="intake-"+Date.now();
  const payload={id:intakeId,intakeId,company:company.value||"Unknown",project:project.value||"Unnamed Project",value:Number(value.value||0),status:"new",source:"customer-intake"};
  out.textContent="Submitting...";
  const r=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
  const j=await r.json().catch(()=>({}));
  if(!r.ok){out.textContent="ERROR: "+JSON.stringify(j);return;}
  const url=CHECKOUT+"?client_reference_id="+encodeURIComponent(intakeId);
  out.textContent="Submitted. Intake ID: "+intakeId+"\n\nCheckout: "+url+"\n\nOnboarding: "+location.origin+"/onboarding/"+intakeId+".html";
};
</script>
<p><a href="/product/">Back</a></p></body></html>`);
    out.push("Shipped /intake/");
  }
  return out;
}

function shipOnboardingIndex() {
  if (!exists(ONBOARD_INDEX)) {
    write(ONBOARD_INDEX, `<!doctype html><html><head><meta charset="utf-8"><title>Onboarding</title></head>
<body style="font-family:Arial;padding:24px;max-width:900px;margin:auto">
<h1>Onboarding Lookup</h1>
<input id="iid" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:8px" placeholder="intake-123...">
<button id="go" style="padding:10px 14px;border:1px solid #222;border-radius:10px;background:#fff;margin-top:10px">Open</button>
<pre id="out" style="background:#f7f7f7;border:1px solid #ddd;padding:12px;border-radius:10px;margin-top:12px">Ready.</pre>
<script>
go.onclick=()=>{const v=(iid.value||"").trim();if(!v){out.textContent="Enter Intake ID";return;}location.href="/onboarding/"+encodeURIComponent(v)+".html";};
</script>
<p><a href="/product/">Back</a></p></body></html>`);
    return ["Shipped /onboarding/ index"];
  }
  return [];
}

function shipPipelineViewer() {
  if (!exists(PIPELINE_VIEW)) {
    write(PIPELINE_VIEW, `<!doctype html><html><head><meta charset="utf-8"><title>Pipeline</title></head>
<body style="font-family:Arial;padding:24px;max-width:1100px;margin:auto">
<h1>Pipeline (Live)</h1>
<pre id="out" style="background:#f7f7f7;border:1px solid #ddd;padding:12px;border-radius:10px;overflow:auto">Loading...</pre>
<script>
fetch('/auricrux/pipeline/pipeline.json',{cache:'no-store'}).then(r=>r.json()).then(j=>out.textContent=JSON.stringify(j,null,2)).catch(()=>out.textContent="No pipeline yet.");
</script>
<p><a href="/product/">Back</a></p></body></html>`);
    return ["Shipped /pipeline/ viewer"];
  }
  return [];
}

function onboardingPage(intakeId, state) {
  const paidLine = state.paid ? `<p><b>Payment:</b> confirmed ✅</p>` : `<p><b>Payment:</b> awaiting payment ❌</p>`;
  const checkout = state.checkoutUrl || "";
  return `<!doctype html><html><head><meta charset="utf-8"><title>Onboarding ${intakeId}</title>
<style>body{font-family:Arial;padding:24px;max-width:900px;margin:auto}.card{border:1px solid #ddd;border-radius:12px;padding:16px;margin:12px 0}pre{background:#f7f7f7;border:1px solid #ddd;padding:12px;border-radius:10px;overflow:auto}</style>
</head><body>
<h1>FCA Onboarding</h1><p><b>Intake ID:</b> ${intakeId}</p>${paidLine}
<div class="card"><h2>Next Steps</h2>
${state.paid ? `<ol><li>Welcome call scheduling</li><li>Upload plan set/scope docs</li><li>First action plan + milestones</li></ol>`
: `<p>Complete Pilot checkout:</p><p><a href="${checkout}">Complete Pilot Checkout</a></p>`}
</div>
<div class="card"><h2>Status</h2><pre>${JSON.stringify(state,null,2)}</pre></div>
<p><a href="/product/">Back</a></p></body></html>`;
}

async function fetchBids() {
  const r = await fetch(BID_API);
  if (!r.ok) throw new Error("GET bids failed: " + r.status);
  return await r.json();
}

async function postBid(bid) {
  const r = await fetch(BID_API, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(bid)
  });
  if (!r.ok) throw new Error("POST bid failed: " + r.status);
  return await r.json();
}

async function runExecutive() {
  initIfMissing();

  const offersRegistry = readJson(OFFERS, { offers: [] });
  const offers = offersRegistry.offers || [];
  const pilot = offers.find(o=>o.id==="pilot");

  const changes = [];
  changes.push(...shipCustomerShell());
  changes.push(...shipModules());
  changes.push(...shipOffersPages(offers));
  changes.push(...shipOnboardingIndex());
  changes.push(...shipPipelineViewer());

  const pipeline = readJson(PIPELINE, { version:1, updatedUtc:"", leads:[], offers:[], payments:[], onboarding:[] });
  const bids = await fetchBids();

  for (const b of bids) {
    if (b && b.source === "customer-intake" && b.intakeId) {
      upsert(pipeline.leads, "intakeId", { intakeId: b.intakeId, company: b.company||"", project: b.project||"", value: b.value||0, createdUtc: b.createdAt || UTC() });
      const url = checkoutUrl(pilot, b.intakeId);
      upsert(pipeline.offers, "intakeId", { intakeId: b.intakeId, offer:"pilot", amount:2500, checkoutUrl:url, offeredUtc: UTC() });
      await postBid({ ...b, status:"pilot-offered", nextAction:"Complete Pilot checkout", checkoutUrl: url });
    }
  }

  for (const off of pipeline.offers) {
    const proofPath = `${PAYMENTS_DIR}/${off.intakeId}.json`;
    if (exists(proofPath)) {
      const proof = readJson(proofPath, {});
      upsert(pipeline.payments, "intakeId", { intakeId: off.intakeId, paidUtc: proof.paidUtc || UTC(), proof });
      upsert(pipeline.onboarding, "intakeId", { intakeId: off.intakeId, startedUtc: UTC(), status:"active" });

      write(`${ONBOARD_DIR}/${off.intakeId}.html`, onboardingPage(off.intakeId, { intakeId: off.intakeId, paid:true, offer:off, proof, checkoutUrl: off.checkoutUrl }));
    } else {
      write(`${ONBOARD_DIR}/${off.intakeId}.html`, onboardingPage(off.intakeId, { intakeId: off.intakeId, paid:false, offer:off, checkoutUrl: off.checkoutUrl }));
    }
  }

  pipeline.updatedUtc = UTC();
  writeJson(PIPELINE, pipeline);

  const brain = readJson(BRAIN, {});
  brain.lastRunUtc = UTC();
  brain.lastShip = changes.length ? changes : ["No new surface shipped this run"];
  writeJson(BRAIN, brain);

  console.log("AURICRUX_EXEC_COMPLETE");
  console.log("SHIPPED:", changes.length);
}

runExecutive().catch(e => { console.error(e); process.exit(1); });
