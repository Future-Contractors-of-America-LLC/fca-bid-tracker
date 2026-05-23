import fs from "fs";

const BID_API = "https://auricrux-bid-api-node-ftcueggjg4b0ehbs.centralus-01.azurewebsites.net/api/bids";
const PILOT_CHECKOUT_BASE = "https://buy.stripe.com/bJe14o0fQ5Pn8Tt7Bw5gc01"; // [2](https://outlook.office365.com/owa/?ItemID=AAMkADMyNmVmNmI4LWQwMDMtNDhiNy1hOGRkLTQ4ZDExMjI2MGM4ZABGAAAAAADLDCXBdgSDTI8n2XHKXO2rBwCB0dqlD%2b2iTbpUUMk47FqNAAAAAAEJAACB0dqlD%2b2iTbpUUMk47FqNAADpycgRAAA%3d&exvsurl=1&viewmodel=ReadMessageItem)

const PIPELINE_PATH = "public/auricrux/pipeline/pipeline.json";
const ONBOARD_DIR = "public/onboarding";

function ensureDir(p){ fs.mkdirSync(p, { recursive: true }); }
function exists(p){ return fs.existsSync(p); }
function readJson(p, def){ try{ return JSON.parse(fs.readFileSync(p,"utf-8")); }catch{ return def; } }
function writeJson(p, obj){
  ensureDir(p.split("/").slice(0,-1).join("/"));
  fs.writeFileSync(p, JSON.stringify(obj,null,2), "utf-8");
}
function writeFile(p, c){
  ensureDir(p.split("/").slice(0,-1).join("/"));
  fs.writeFileSync(p, c, "utf-8");
}
const nowUtc = () => new Date().toISOString();

async function fetchBids(){
  const r = await fetch(BID_API);
  if(!r.ok) throw new Error("GET bids failed: "+r.status);
  return await r.json();
}
async function postBid(bid){
  const r = await fetch(BID_API, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(bid)
  });
  if(!r.ok){
    const t = await r.text().catch(()=> "");
    throw new Error("POST bid failed: "+r.status+" "+t);
  }
  return await r.json();
}

function checkoutUrl(intakeId){
  return PILOT_CHECKOUT_BASE + "?client_reference_id=" + encodeURIComponent(intakeId);
}

function ensurePipeline(){
  if(!exists(PIPELINE_PATH)){
    writeJson(PIPELINE_PATH, { version:1, updatedUtc:"", leads:[], offers:[], payments:[], onboarding:[] });
  }
  return readJson(PIPELINE_PATH, { version:1, updatedUtc:"", leads:[], offers:[], payments:[], onboarding:[] });
}

function upsert(arr, key, obj){
  const i = arr.findIndex(x => x[key] === obj[key]);
  if(i >= 0) arr[i] = { ...arr[i], ...obj };
  else arr.unshift(obj);
}

function onboardingPage(intakeId, state){
  const paidLine = state.paid ? `<p><b>Payment:</b> confirmed ✅</p>` : `<p><b>Payment:</b> awaiting payment ❌</p>`;
  const checkout = checkoutUrl(intakeId);

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Onboarding ${intakeId}</title>
<style>
body{font-family:Arial;padding:24px;max-width:900px;margin:auto}
.card{border:1px solid #ddd;border-radius:12px;padding:16px;margin:12px 0}
pre{background:#f7f7f7;border:1px solid #ddd;padding:12px;border-radius:10px}
</style></head>
<body>
<h1>FCA Onboarding</h1>
<p><b>Intake ID:</b> ${intakeId}</p>
${paidLine}

<div class="card">
<h2>Next Steps</h2>
${state.paid ? `
<ol>
  <li>Welcome call scheduled (Auricrux will propose times).</li>
  <li>Upload plan set / scope docs (Files module next).</li>
  <li>Auricrux generates first action plan + milestones.</li>
</ol>
` : `
<p>Complete Pilot checkout to begin onboarding:</p>
<p>${checkout}Complete Pilot Checkout</a></p>
`}
</div>

<div class="card">
<h2>Status</h2>
<pre>${JSON.stringify(state, null, 2)}</pre>
</div>

<p>/product/Back to Product Shell</a></p>
</body></html>`;
}

async function main(){
  ensureDir(ONBOARD_DIR);
  const pipeline = ensurePipeline();

  const bids = await fetchBids();

  // 1) Intake -> Lead
  for(const b of bids){
    if(b && b.source === "customer-intake" && b.intakeId){
      upsert(pipeline.leads, "intakeId", {
        intakeId: b.intakeId,
        company: b.company || "",
        project: b.project || "",
        value: b.value || 0,
        createdUtc: b.createdAt || nowUtc()
      });

      // 2) Offer Pilot immediately (primary offer) [1](https://futurecontractorsofameri319-my.sharepoint.com/personal/michael_futurecontractorsofamerica_com/_layouts/15/Doc.aspx?sourcedoc=%7BFD7A28E4-26D4-4826-9783-2E490DA798AB%7D&file=Superseded%20and%20Retired%20Documents%20Register%20v1.2.docx&action=default&mobileredirect=true&DefaultItemOpen=1)
      upsert(pipeline.offers, "intakeId", {
        intakeId: b.intakeId,
        offer: "pilot",
        amount: 2500,
        checkoutUrl: checkoutUrl(b.intakeId),
        offeredUtc: nowUtc()
      });

      // reflect offer status back into bid record (operational loop)
      await postBid({ ...b, status: "pilot-offered", nextAction: "Complete Pilot checkout" });
    }
  }

  // 3) Payment proof check (local file drop from webhook proof folder)
  // In production you will later move this to Azure Table/Cosmos; this keeps the loop closed now.
  // The webhook function writes payments/<intakeId>.json in its own environment; we will mirror it later.
  // For now, you can manually drop payment proof artifacts into repo under:
  // public/auricrux/payments/<intakeId>.json
  const payDir = "public/auricrux/payments";
  ensureDir(payDir);

  for(const offer of pipeline.offers){
    const proofPath = `${payDir}/${offer.intakeId}.json`;
    if(exists(proofPath)){
      const proof = readJson(proofPath, {});
      upsert(pipeline.payments, "intakeId", {
        intakeId: offer.intakeId,
        paidUtc: proof.paidUtc || nowUtc(),
        proof
      });

      // onboarding record
      upsert(pipeline.onboarding, "intakeId", {
        intakeId: offer.intakeId,
        startedUtc: nowUtc(),
        status: "active"
      });

      // generate onboarding page (customer-visible)
      const state = { intakeId: offer.intakeId, paid: true, offer, proof };
      writeFile(`${ONBOARD_DIR}/${offer.intakeId}.html`, onboardingPage(offer.intakeId, state));
    } else {
      // generate “awaiting payment” onboarding page
      const state = { intakeId: offer.intakeId, paid: false, offer };
      writeFile(`${ONBOARD_DIR}/${offer.intakeId}.html`, onboardingPage(offer.intakeId, state));
    }
  }

  pipeline.updatedUtc = nowUtc();
  writeJson(PIPELINE_PATH, pipeline);

  console.log("AURICRUX_EXEC_COMPLETE");
  console.log("PIPELINE_UPDATED:", PIPELINE_PATH);
}

main().catch(e => { console.error(e); process.exit(1); });
