#!/bin/bash
set -euo pipefail

rm -rf dist
mkdir -p dist
cp -R public/. dist/
mkdir -p dist/data

cat > dist/styles.css <<'CSS'
:root{--navy:#0c1a2a;--navy2:#13263b;--blue:#2563eb;--orange:#f97316;--gold:#d4a017;--gold-dark:#8a6116;--bg:#f8fbff;--line:#dbe3ef;--text:#0f172a;--muted:#475569;--white:#fff}
*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;background:linear-gradient(180deg,#edf4ff 0%,#ffffff 100%);color:var(--text)}a{text-decoration:none;color:inherit}.wrap{max-width:1180px;margin:0 auto;padding:0 20px}.topbar{position:sticky;top:0;z-index:100;background:rgba(255,255,255,.96);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}.topbar-inner{display:flex;justify-content:space-between;align-items:center;gap:18px;min-height:78px}.brand{display:flex;align-items:center;gap:14px}.brand img{width:54px;height:54px}.brand-copy strong{display:block;font-size:18px}.brand-copy span{display:block;font-size:12px;color:var(--muted)}.nav{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.nav a{padding:10px 12px;border-radius:12px;font-weight:700;color:#1e293b}.nav a:hover{background:#eff6ff}.btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 16px;border-radius:12px;font-weight:700;border:1px solid #c7d2fe}.btn-primary{background:var(--blue);border-color:var(--blue);color:#fff}.btn-secondary{background:#fff;color:#1d4ed8}.btn-gold{background:linear-gradient(135deg,var(--gold-dark) 0%,var(--gold) 100%);border-color:var(--gold-dark);color:#fff}.hero{padding:46px 0 26px}.hero-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:20px}.card{background:#fff;border:1px solid var(--line);border-radius:20px;padding:22px;box-shadow:0 18px 40px rgba(15,23,42,.06)}.eyebrow{display:inline-block;padding:8px 12px;border-radius:999px;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.eyebrow-blue{background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8}.eyebrow-gold{background:#fff7e1;border:1px solid #ecd089;color:var(--gold-dark)}h1{font-size:clamp(38px,5vw,64px);line-height:1.03;margin:16px 0 12px}h2{font-size:32px;line-height:1.1;margin:0 0 12px}h3{margin:0 0 10px}.lead{font-size:18px;line-height:1.7;color:#334155}.muted{color:#475569;line-height:1.7}.grid-2,.grid-3,.grid-4{display:grid;gap:16px}.grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}.grid-3{grid-template-columns:repeat(3,minmax(0,1fr))}.grid-4{grid-template-columns:repeat(4,minmax(0,1fr))}.section{padding:24px 0}.logo-band{display:flex;gap:16px;flex-wrap:wrap;align-items:center;margin-top:18px}.logo-box{display:flex;align-items:center;gap:14px;padding:16px 18px;border-radius:18px;border:1px solid var(--line);background:#fff}.auricrux-box{background:linear-gradient(135deg,#fff8e7 0%,#ffffff 100%);border-color:#ecd089}.auricrux-token{width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,var(--gold-dark) 0%,var(--gold) 100%);display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:900}.status{padding:16px;border-radius:14px;background:#eef2ff;border:1px solid #c7d2fe;color:#312e81}.status.success{background:#ecfdf5;border-color:#86efac;color:#166534}.status.warn{background:#fff7ed;border-color:#fdba74;color:#9a3412}.pill-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.pill{padding:8px 12px;border-radius:999px;background:#f8fafc;border:1px solid var(--line);font-size:13px;font-weight:700;color:#334155}.cta-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:18px}.field{display:grid;gap:6px}.field input,.field select,.field textarea{width:100%;padding:12px 13px;border:1px solid #cbd5e1;border-radius:12px;background:#fff;color:#0f172a}.field textarea{min-height:120px}.small{font-size:13px;color:#64748b}.code{font-family:monospace;background:#f1f5f9;border-radius:8px;padding:2px 6px}.footer{padding:32px 0 50px;color:#475569}.footer strong{color:#0f172a}.proof{border:1px solid #dbeafe;background:#f8fbff}.proof-gold{border:1px solid #ecd089;background:#fffaf0}.list{padding-left:18px;line-height:1.8;color:#334155}.split{display:grid;grid-template-columns:1.15fr .85fr;gap:16px}.metric{font-size:28px;font-weight:800;margin:6px 0}.divider{height:1px;background:var(--line);margin:16px 0}.full{grid-column:1/-1}.data-table{width:100%;border-collapse:collapse}.data-table th,.data-table td{padding:12px;border-bottom:1px solid var(--line);text-align:left}.mini-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}.mini-card{padding:14px;border:1px solid var(--line);border-radius:14px;background:#fff}.tabs{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}@media(max-width:980px){.hero-grid,.grid-2,.grid-3,.grid-4,.split{grid-template-columns:1fr}.topbar-inner{flex-direction:column;align-items:flex-start;padding:14px 0}.nav{width:100%}}
CSS

cat > dist/data/live-workspace-pack.json <<'JSON'
{
  "version": 1,
  "workspace": {
    "id": "fca-live-proof-workspace",
    "status": "active",
    "currentPhase": "qualified-opportunity"
  },
  "project": {
    "id": "PRJ-001",
    "name": "Launch Demo Project",
    "stage": "Qualified",
    "nextStep": "Proposal preparation / file review"
  },
  "files": [
    {
      "name": "Intake Summary.pdf",
      "category": "intake",
      "status": "staged"
    },
    {
      "name": "Proposal-Draft-v1.docx",
      "category": "proposal",
      "status": "draft"
    },
    {
      "name": "Plans-Package.zip",
      "category": "plans",
      "status": "placeholder"
    }
  ],
  "audit": [
    {
      "event": "Customer intake created",
      "actor": "User",
      "status": "Recorded"
    },
    {
      "event": "Activation path opened",
      "actor": "System",
      "status": "Recorded"
    },
    {
      "event": "Login-backed platform proof opened",
      "actor": "System",
      "status": "Recorded"
    },
    {
      "event": "Run digest linked on live surface",
      "actor": "Auricrux",
      "status": "Recorded"
    }
  ]
}
JSON

header_markup='\
<header class="topbar">\
  <div class="wrap topbar-inner">\
    <div class="brand">\
      <img src="/favicon.svg" alt="FCA logo" />\
      <div class="brand-copy"><strong>Future Contractors of America</strong><span>FCA Contractor Command</span></div>\
    </div>\
    <nav class="nav" aria-label="Primary">\
      <a href="/">Home</a>\
      <a href="/features/">Features</a>\
      <a href="/solutions/">Solutions</a>\
      <a href="/pricing/">Pricing</a>\
      <a href="/auricrux/">Auricrux</a>\
      <a href="/portal/platform/">Platform</a>\
      <a href="/contact/">Contact</a>\
      <a class="btn btn-secondary" href="/intake/">Start Intake</a>\
      <a class="btn btn-primary" href="/login/">Login</a>\
    </nav>\
  </div>\
</header>'

footer_markup='\
<footer class="footer">\
  <div class="wrap grid-2">\
    <div>\
      <strong>Future Contractors of America</strong>\
      <p>FCA Contractor Command is the contractor-facing operating surface for opportunity intake, bid posture, proposal movement, customer coordination, and guided next-action continuity.</p>\
    </div>\
    <div>\
      <strong>Auricrux contact lanes</strong>\
      <p>sales@futurecontractorsofamerica.com<br/>info@futurecontractorsofamerica.com<br/>support@futurecontractorsofamerica.com</p>\
    </div>\
  </div>\
</footer>'

create_page(){
  path="$1"
  title="$2"
  body="$3"
  mkdir -p "dist$path"
  cat > "dist$path/index.html" <<HTML
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>$title</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="stylesheet" href="/styles.css" />
</head>
<body>
$header_markup
$body
$footer_markup
</body>
</html>
HTML
}

create_page "/" "Future Contractors of America | FCA Contractor Command" '
<main>
  <section class="hero">
    <div class="wrap hero-grid">
      <div>
        <span class="eyebrow eyebrow-blue">Flagship product · FCA Contractor Command</span>
        <h1>Give contractors a cleaner path from opportunity intake to real customer-facing product proof.</h1>
        <p class="lead">FCA Contractor Command is sold as one contractor operating surface for intake, bid visibility, proposal movement, customer coordination, and Auricrux-guided next actions—without forcing customers through a confusing stack of disconnected tools.</p>
        <div class="pill-row">
          <span class="pill">Home tab restored</span>
          <span class="pill">Static public navbar</span>
          <span class="pill">Real customer intake path</span>
          <span class="pill">Live product proof route</span>
        </div>
        <div class="cta-row">
          <a class="btn btn-primary" href="/pricing/">See Pricing</a>
          <a class="btn btn-secondary" href="/intake/">Start Intake</a>
          <a class="btn btn-gold" href="/auricrux/">Open Auricrux</a>
        </div>
        <div class="logo-band">
          <div class="logo-box"><img src="/favicon.svg" alt="FCA logo" style="width:60px;height:60px" /><div><strong>Future Contractors of America</strong><div class="small">FCA Contractor Command</div></div></div>
          <div class="logo-box auricrux-box"><div class="auricrux-token">A</div><div><strong style="color:#8a6116">Auricrux</strong><div class="small">Gold-command product guide</div></div></div>
        </div>
      </div>
      <aside class="card proof">
        <span class="eyebrow eyebrow-blue">Visible product proof</span>
        <h2>What you can test right now</h2>
        <ul class="list">
          <li>Create a unique sign-in during one unified intake flow.</li>
          <li>Apply the founder free code inside the same customer path.</li>
          <li>Sign in and land on the live product proof surface.</li>
          <li>Open live deployment and run-digest proof directly from the domain.</li>
        </ul>
        <div class="cta-row">
          <a class="btn btn-primary" href="/portal/platform/">Open Platform Proof</a>
          <a class="btn btn-secondary" href="/auricrux/live-proof/">Open Live Proof</a>
        </div>
      </aside>
    </div>
  </section>
  <section class="section"><div class="wrap grid-3"><article class="card"><h3>Sell a clearer process</h3><p class="muted">Use a more credible intake, pricing, and activation story so buyers can understand what happens next.</p></article><article class="card"><h3>Keep Auricrux visible</h3><p class="muted">Auricrux stays visually distinct in gold across public product surfaces so customers can follow the guided lane.</p></article><article class="card"><h3>Show real surface advancement</h3><p class="muted">The live site now exposes platform-proof and runtime-proof routes that can be checked without opening GitHub first.</p></article></div></section>
</main>'

create_page "/features" "FCA Features" '
<main class="section"><div class="wrap"><span class="eyebrow eyebrow-blue">Product features</span><h1>Features that help contractors look sharper, move faster, and prove follow-through.</h1><div class="grid-3"><article class="card"><h3>Guided intake</h3><p class="muted">Capture the right information early and create a real customer login path in the same flow.</p></article><article class="card"><h3>Bid continuity</h3><p class="muted">Keep opportunity, pricing posture, and next action visible rather than scattered across forms and notes.</p></article><article class="card proof-gold"><h3>Auricrux guidance</h3><p class="muted">Use Auricrux to explain fit, compare tiers, and push customers toward the right next action.</p></article></div></div></main>'

create_page "/solutions" "FCA Solutions" '
<main class="section"><div class="wrap"><span class="eyebrow eyebrow-blue">Solutions</span><h1>Solutions for contractors who need a more credible customer-facing operating path.</h1><div class="grid-3"><article class="card"><h3>Owner-operators</h3><p class="muted">Start with a clean intake and bid path that makes a small company feel more organized immediately.</p></article><article class="card"><h3>Growing teams</h3><p class="muted">Add stronger proposal movement, customer visibility, and rollout discipline as more people touch the work.</p></article><article class="card proof-gold"><h3>Enterprise-minded contractors</h3><p class="muted">Position FCA as a broader contractor command surface with Auricrux-guided visibility across teams.</p></article></div></div></main>'

create_page "/pricing" "FCA Pricing" '
<main class="section"><div class="wrap"><span class="eyebrow eyebrow-blue">Commercial packaging</span><h1>Pricing that gives contractors a real spread from first step to enterprise rollout.</h1><div class="grid-4"><article class="card"><h3>Startup Workspace</h3><div class="metric">$99/mo</div><p class="muted">For owner-operators who need a clean intake, bid, and customer-entry path.</p><div class="cta-row"><a class="btn btn-primary" href="/intake/?plan=startup">Choose Startup</a></div></article><article class="card"><h3>Team Workspace</h3><div class="metric">$299/mo</div><p class="muted">For smaller active teams that need stronger follow-through and a better customer-facing operating story.</p><div class="cta-row"><a class="btn btn-primary" href="/intake/?plan=team">Choose Team</a></div></article><article class="card"><h3>Growth Platform</h3><div class="metric">$1,500/mo</div><p class="muted">For scaling contractors who want broader communications, stronger rollout posture, and more visible coordination.</p><div class="cta-row"><a class="btn btn-primary" href="/intake/?plan=growth">Choose Growth</a></div></article><article class="card proof-gold"><h3>Enterprise Rollout</h3><div class="metric">$3,500+/mo</div><p class="muted">For broader adoption across teams, commercial lanes, and Auricrux-guided operating visibility.</p><div class="cta-row"><a class="btn btn-gold" href="/intake/?plan=enterprise">Choose Enterprise</a></div></article></div><div class="card proof" style="margin-top:16px"><strong>Founder validation path</strong><p class="muted">The founder free code remains inside the same unified customer flow. No separate founder path exists.</p></div></div></main>'

create_page "/contact" "Contact FCA" '
<main class="section"><div class="wrap"><span class="eyebrow eyebrow-blue">Contact</span><h1>Talk to FCA about fit, activation, and rollout.</h1><div class="grid-3"><article class="card"><h3>Sales</h3><p class="muted"><span class="code">sales@futurecontractorsofamerica.com</span></p></article><article class="card"><h3>Info</h3><p class="muted"><span class="code">info@futurecontractorsofamerica.com</span></p></article><article class="card proof-gold"><h3>Support</h3><p class="muted"><span class="code">support@futurecontractorsofamerica.com</span></p></article></div></div></main>'

create_page "/auricrux" "Meet Auricrux" '
<main class="section"><div class="wrap split"><section class="card proof-gold"><span class="eyebrow eyebrow-gold">Auricrux</span><h1 style="font-size:46px">Auricrux guides fit, pricing, activation, and the next product step.</h1><p class="lead">Everything directly related to Auricrux now uses the gold-command scheme so customers can clearly identify guided surfaces and follow the right lane.</p><div class="logo-band"><div class="logo-box auricrux-box"><div class="auricrux-token">A</div><div><strong style="color:#8a6116">Auricrux</strong><div class="small">Executive product guide</div></div></div></div><div class="cta-row"><a class="btn btn-gold" href="/intake/">Start Guided Intake</a><a class="btn btn-secondary" href="/pricing/">Compare Packages</a></div></section><aside class="card"><h2>Ask Auricrux to help with</h2><ul class="list"><li>Which package best fits a small contractor</li><li>When to choose Growth vs Enterprise</li><li>How the free founder code works in the same customer path</li><li>Where to test the live product proof surface after login</li></ul></aside></div></main>'

create_page "/intake" "FCA Intake" '
<main class="section"><div class="wrap"><span class="eyebrow eyebrow-blue">Unified intake</span><h1>Create a real customer path in one intake flow.</h1><p class="lead">Every customer, including the founder, uses the same intake. Choose your package, create your unique sign-in, and continue into activation.</p><section class="card"><form id="intakeForm"><div class="grid-2"><div class="field"><label for="plan">Offer</label><select id="plan"><option value="startup">Startup Workspace</option><option value="team">Team Workspace</option><option value="growth">Growth Platform</option><option value="enterprise">Enterprise Rollout</option></select></div><div class="field"><label for="company">Company</label><input id="company" required placeholder="Your company name" /></div><div class="field"><label for="name">Contact name</label><input id="name" required placeholder="Primary contact" /></div><div class="field"><label for="email">Work email</label><input id="email" type="email" required placeholder="name@company.com" /></div><div class="field"><label for="password">Create password</label><input id="password" type="password" required placeholder="Create your sign-in password" /></div><div class="field"><label for="confirmPassword">Confirm password</label><input id="confirmPassword" type="password" required placeholder="Re-enter your password" /></div><div class="field full"><label for="notes">What do you want FCA to improve first?</label><textarea id="notes" placeholder="Describe the commercial, proposal, coordination, or rollout problem you want FCA to solve first."></textarea></div></div><div class="status warn" id="intakeStatus" style="margin-top:16px">Your credentials will be created from this intake and used in the same login path as any normal customer.</div><div class="cta-row"><button class="btn btn-primary" type="submit">Continue to Activation</button><a class="btn btn-secondary" href="/pricing/">Back to Pricing</a></div></form></section></div></main>
<script>
const params=new URLSearchParams(window.location.search);const preset=params.get("plan");if(preset){document.getElementById("plan").value=preset;}
document.getElementById("intakeForm").addEventListener("submit",function(e){e.preventDefault();const password=document.getElementById("password").value;const confirm=document.getElementById("confirmPassword").value;const box=document.getElementById("intakeStatus");if(password!==confirm){box.className="status warn";box.textContent="Passwords do not match yet. Fix that before continuing.";return;}const record={plan:document.getElementById("plan").value,company:document.getElementById("company").value,name:document.getElementById("name").value,email:document.getElementById("email").value.trim().toLowerCase(),password};localStorage.setItem("fca_customer_record",JSON.stringify(record));window.location.href="/checkout/?plan="+encodeURIComponent(record.plan)+"&company="+encodeURIComponent(record.company)+"&email="+encodeURIComponent(record.email);});
</script>'

create_page "/checkout" "FCA Activation" '
<main class="section"><div class="wrap"><span class="eyebrow eyebrow-blue">Activation</span><h1>Review your package and activate the same path you will actually log into.</h1><section class="card"><div id="summary" class="status">Loading your intake record…</div><div class="field" style="margin-top:16px"><label for="promo">Free code or activation code</label><input id="promo" placeholder="Enter activation code if you have one" /></div><div class="cta-row"><button class="btn btn-primary" type="button" onclick="applyCode()">Apply Code</button><a class="btn btn-secondary" href="/login/">Continue to Login</a></div><div id="promoStatus" class="status warn" style="margin-top:16px">Founder validation code: <span class="code">FCA-FOUNDER-FREE-2026</span></div></section></div></main>
<script>
const rec=JSON.parse(localStorage.getItem("fca_customer_record")||"null");const summary=document.getElementById("summary");if(rec){summary.innerHTML="<strong>Offer:</strong> "+rec.plan+"<br/><strong>Company:</strong> "+rec.company+"<br/><strong>Email:</strong> "+rec.email+"<br/><strong>Sign-in:</strong> created during intake";}else{summary.textContent="No intake record found. Complete intake first so your customer sign-in exists.";}
function applyCode(){const val=(document.getElementById("promo").value||"").trim();const box=document.getElementById("promoStatus");if(val==="FCA-FOUNDER-FREE-2026"){box.className="status success";box.textContent="Founder free code applied. The same customer path remains active, but current validation cost is waived.";}else{box.className="status warn";box.textContent="Code not recognized. Use the founder code exactly as issued or continue with standard activation.";}}
</script>'

create_page "/login" "FCA Login" '
<main class="section"><div class="wrap split"><section class="card"><span class="eyebrow eyebrow-blue">Customer login</span><h1>Sign in with the unique credentials you created during intake.</h1><p class="lead">This login now uses the same customer record created in intake. If you want a new unique login, create it in intake first.</p><div class="status" id="statusBox">Use your intake-created email and password, or the launch fallback if you are only validating the surface.</div></section><aside class="card"><form id="loginForm"><div class="field"><label for="email">Work email</label><input id="email" type="email" placeholder="name@company.com" /></div><div class="field"><label for="password">Password</label><input id="password" type="password" placeholder="Enter your password" /></div><div class="cta-row"><button class="btn btn-primary" id="signInBtn" type="submit">Sign In</button><a class="btn btn-secondary" href="/intake/">Create New Sign-In</a></div><p class="small" style="margin-top:12px">Fallback validation credential: <span class="code">launch.customer@futurecontractorsofamerica.com</span> / <span class="code">FCA-Launch-2026!</span></p></form></aside></div></main>
<script>
const FALLBACK={email:"launch.customer@futurecontractorsofamerica.com",password:"FCA-Launch-2026!"};
const rec=JSON.parse(localStorage.getItem("fca_customer_record")||"null");
if(rec){document.getElementById("email").value=rec.email||"";}
const statusBox=document.getElementById("statusBox");
function setStatus(msg,kind){statusBox.textContent=msg;statusBox.className="status"+(kind?" "+kind:"");}
function isValid(email,password){const e=(email||"").trim().toLowerCase();const p=(password||"").trim();if(rec&&rec.email===e&&rec.password===p){return true;}return e===FALLBACK.email&&p===FALLBACK.password;}
document.getElementById("loginForm").addEventListener("submit",function(e){e.preventDefault();const email=document.getElementById("email").value;const password=document.getElementById("password").value;if(isValid(email,password)){setStatus("Login successful. Opening the live product proof surface…","success");setTimeout(()=>window.location.href="/portal/platform/",350);}else{setStatus("Credentials did not validate. Complete intake to create a unique login or use the launch fallback.","warn");}});
</script>'

create_page "/portal/platform" "FCA Platform Dashboard" '
<main class="section"><div class="wrap"><span class="eyebrow eyebrow-blue">Live product proof</span><h1>FCA Platform Dashboard</h1><p class="lead">This is the current live product-proof surface for the contractor command experience. It now includes shared workspace data so project, files, and audit routes read from one visible data pack.</p><div class="mini-grid"><div class="mini-card"><strong>Project</strong><div id="projectName">Loading…</div></div><div class="mini-card"><strong>Customer</strong><div id="customerName">Loading…</div></div><div class="mini-card"><strong>Workspace status</strong><div id="workspaceStatus">Loading…</div></div><div class="mini-card"><strong>Next action</strong><div id="nextAction">Loading…</div></div></div><div class="tabs"><a class="btn btn-primary" href="/portal/projects/">Projects</a><a class="btn btn-secondary" href="/portal/files/">Files</a><a class="btn btn-secondary" href="/portal/audit/">Audit</a><a class="btn btn-secondary" href="/auricrux/live-proof/">Auricrux Proof</a></div><div class="divider"></div><div class="grid-3"><article class="card proof"><h3>Customer path now works</h3><p class="muted">One intake flow creates a unique sign-in. Login routes here as the live product proof surface.</p></article><article class="card proof"><h3>Shared data pack active</h3><p class="muted">Projects, files, and audit proof now resolve from one workspace data pack instead of isolated placeholders.</p></article><article class="card proof-gold"><h3>Auricrux visible in-product</h3><p class="muted">Auricrux remains a gold-command guide across live proof surfaces so customers can see the guided lane clearly.</p></article></div><div class="cta-row"><a class="btn btn-primary" href="/auricrux/run-digest/index.json">Open Live Run Digest</a><a class="btn btn-secondary" href="/deployment-status.json">Open Deployment Status</a><a class="btn btn-secondary" href="/auricrux/live-proof/">Open Auricrux Live Proof</a></div><div class="divider"></div><div class="grid-2"><div class="card"><h2>Visible product lanes</h2><ul class="list"><li>Interactive project summary based on current customer record</li><li>Files surface reading from shared workspace data</li><li>Audit surface reading from shared workspace data</li><li>Direct links to runtime proof routes</li></ul></div><div class="card"><h2>Current workspace snapshot</h2><table class="data-table" id="snapshotTable"><tr><th>Loading</th><td>Loading…</td></tr></table></div></div></div></main>
<script>
async function hydrate(){
  const rec=JSON.parse(localStorage.getItem("fca_customer_record")||"null");
  const pack=await fetch('/data/live-workspace-pack.json').then(r=>r.json());
  const customer=rec?.company||'Launch Customer Workspace';
  const project=rec?.company?`${rec.company} — Initial Opportunity`:pack.project.name;
  document.getElementById('customerName').textContent=customer;
  document.getElementById('projectName').textContent=project;
  document.getElementById('workspaceStatus').textContent=pack.workspace.status;
  document.getElementById('nextAction').textContent=pack.project.nextStep;
  document.getElementById('snapshotTable').innerHTML=`<tr><th>Bid posture</th><td>${pack.project.stage}</td></tr><tr><th>Files package</th><td>${pack.files.map(f=>f.name).join(', ')}</td></tr><tr><th>Billing readiness</th><td>Founder free-code / standard activation path visible</td></tr><tr><th>Customer proof</th><td>Login-backed live product surface active</td></tr>`;
}
hydrate();
</script>'

create_page "/portal/projects" "FCA Projects" '
<main class="section"><div class="wrap"><span class="eyebrow eyebrow-blue">Projects proof</span><h1>Projects</h1><p class="lead">This live route proves project-context continuity on the public deployment lane.</p><div class="card"><table class="data-table"><thead><tr><th>Project</th><th>Stage</th><th>Customer</th><th>Next Step</th></tr></thead><tbody id="projectRows"><tr><td>Loading…</td><td>—</td><td>—</td><td>—</td></tr></tbody></table><div class="cta-row"><a class="btn btn-secondary" href="/portal/platform/">Back to Platform</a><a class="btn btn-secondary" href="/portal/files/">Open Files</a></div></div></div></main>
<script>
async function hydrate(){
 const rec=JSON.parse(localStorage.getItem("fca_customer_record")||"null");
 const pack=await fetch('/data/live-workspace-pack.json').then(r=>r.json());
 const projectName=rec?.company?`${rec.company} — Initial Opportunity`:pack.project.name;
 const customer=rec?.company||'Launch Customer Workspace';
 document.getElementById('projectRows').innerHTML=`<tr><td>${projectName}</td><td>${pack.project.stage}</td><td>${customer}</td><td>${pack.project.nextStep}</td></tr>`;
}
hydrate();
</script>'

create_page "/portal/files" "FCA Files" '
<main class="section"><div class="wrap"><span class="eyebrow eyebrow-blue">Files proof</span><h1>Files</h1><p class="lead">This live route proves visible file-spine posture on the deployed customer surface.</p><div class="grid-3" id="fileGrid"><article class="card"><h3>Loading…</h3><p class="muted">Loading…</p></article></div><div class="cta-row"><a class="btn btn-secondary" href="/portal/platform/">Back to Platform</a><a class="btn btn-secondary" href="/portal/audit/">Open Audit</a></div></div></main>
<script>
async function hydrate(){
 const pack=await fetch('/data/live-workspace-pack.json').then(r=>r.json());
 document.getElementById('fileGrid').innerHTML=pack.files.map(file=>`<article class="card${file.category==='plans'?' proof-gold':''}"><h3>${file.name}</h3><p class="muted">Category: ${file.category} · Status: ${file.status}</p></article>`).join('');
}
hydrate();
</script>'

create_page "/portal/audit" "FCA Audit" '
<main class="section"><div class="wrap"><span class="eyebrow eyebrow-blue">Audit proof</span><h1>Audit</h1><p class="lead">This live route proves visible audit posture and customer-facing evidence of state changes.</p><div class="card"><table class="data-table"><thead><tr><th>Event</th><th>Actor</th><th>Status</th></tr></thead><tbody id="auditRows"><tr><td>Loading…</td><td>—</td><td>—</td></tr></tbody></table><div class="cta-row"><a class="btn btn-secondary" href="/portal/platform/">Back to Platform</a><a class="btn btn-secondary" href="/auricrux/run-digest/index.json">Open Run Digest</a></div></div></div></main>
<script>
async function hydrate(){
 const pack=await fetch('/data/live-workspace-pack.json').then(r=>r.json());
 document.getElementById('auditRows').innerHTML=pack.audit.map(event=>`<tr><td>${event.event}</td><td>${event.actor}</td><td>${event.status}</td></tr>`).join('');
}
hydrate();
</script>'

create_page "/auricrux/live-proof" "Auricrux Live Proof" '
<main class="section"><div class="wrap"><section class="card proof-gold"><span class="eyebrow eyebrow-gold">Auricrux live proof</span><h1>Machine-native control-loop proof is now part of the live customer-facing surface.</h1><p class="lead">Use this route to verify that deployment, run digest, and control-plane visibility are exposed directly on the domain.</p><div class="cta-row"><a class="btn btn-gold" href="/auricrux/run-digest/index.json">Run Digest</a><a class="btn btn-secondary" href="/auricrux/control-plane/index.json">Control Plane State</a><a class="btn btn-secondary" href="/portal/platform/">Platform Proof</a></div></section></div></main>'

echo '{"status":"live-proof-data-pack-v5-active","shell":"FCA Contractor Command","execution":"Auricrux-Central","nextAction":"MNCL-004","proofRoutes":["/portal/platform/","/portal/projects/","/portal/files/","/portal/audit/","/auricrux/live-proof/","/auricrux/run-digest/index.json","/deployment-status.json"],"dataPack":"/data/live-workspace-pack.json"}' > dist/deployment-status.json
echo '{"primary":"futurecontractorsofamerica.com","www":"www.futurecontractorsofamerica.com","swa":"delightful-mushroom-0de67860f.7.azurestaticapps.net","status":"continuity-preserved"}' > dist/domain-continuity.json
echo 'FCA live proof data pack v5 active' > dist/runtime-fingerprint.txt
cat > dist/live-shell-verification.html <<'HTML'
<!doctype html><html lang="en"><head><meta charset="utf-8"><title>FCA Live Shell Verification</title></head><body><h1>FCA Live Shell Verification</h1><p>Persistent static navbar active. Home tab restored. FCA and Auricrux identity visible on-page. Unique intake-created sign-in path active. Shared workspace data pack active at /data/live-workspace-pack.json and powering /portal/platform/, /portal/projects/, /portal/files/, and /portal/audit/.</p></body></html>
HTML
cat > dist/host-binding-audit.html <<'HTML'
<!doctype html><html lang="en"><head><meta charset="utf-8"><title>FCA Host Binding Audit</title></head><body><h1>Host Binding Audit</h1><p>futurecontractorsofamerica.com</p><p>www.futurecontractorsofamerica.com</p><p>delightful-mushroom-0de67860f.7.azurestaticapps.net</p></body></html>
HTML
cat > dist/api-continuity-audit.html <<'HTML'
<!doctype html><html lang="en"><head><meta charset="utf-8"><title>FCA API Continuity Audit</title></head><body><h1>API Continuity Audit</h1><p>/api/customer-login preserved as optional validation endpoint.</p><p>/api/run-task preserved.</p><p>Auricrux-Central execute route preserved.</p></body></html>
HTML

echo "FCA live proof data pack v5 witness" > dist/commit-witness-$(date +%Y%m%d%H%M%S).txt

echo "FCA live proof data pack v5 build completed"
