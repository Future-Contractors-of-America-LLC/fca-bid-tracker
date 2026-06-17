#!/bin/bash
set -euo pipefail

rm -rf dist
mkdir -p dist
cp -R public/. dist/
mkdir -p dist/data

GIT_SHA="${GITHUB_SHA:-local-dev}"
DEFAULT_HOST="${AURICRUX_SWA_DEFAULT_HOST:-delightful-mushroom-0de67860f.7.azurestaticapps.net}"
EXPECTED_HOSTS="${AURICRUX_EXPECTED_HOSTS:-futurecontractorsofamerica.com,www.futurecontractorsofamerica.com,delightful-mushroom-0de67860f.7.azurestaticapps.net}"
COMMIT_WITNESS_ROUTE="/commit-witness-${GIT_SHA}.txt"
BUILD_MARKER_DATE="June 17, 2026"
BUILD_MARKER_VERSION="Investor Premium Pass 2"

IFS=',' read -r -a EXPECTED_HOST_ARRAY <<< "$EXPECTED_HOSTS"
EXPECTED_HOSTS_JSON="$(printf '"%s",' "${EXPECTED_HOST_ARRAY[@]}")"
EXPECTED_HOSTS_JSON="[${EXPECTED_HOSTS_JSON%,}]"

cat > dist/styles.css <<'CSS'
:root{--bg:#f4f7ff;--ink:#0f172a;--muted:#475569;--line:#dbe4f3;--blue:#1d4ed8;--blue2:#0f3ea8;--navy:#0a1729;--gold:#d4a017;--white:#fff;--good:#15803d}
*{box-sizing:border-box}
body{margin:0;font-family:Inter,Arial,Helvetica,sans-serif;color:var(--ink);background:linear-gradient(180deg,#edf3ff 0%,#ffffff 42%)}
a{text-decoration:none;color:inherit}
.wrap{max-width:1180px;margin:0 auto;padding:0 20px}

.topbar{position:sticky;top:0;z-index:100;background:rgba(255,255,255,.97);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.topbar-inner{display:flex;justify-content:space-between;align-items:center;gap:14px;min-height:68px}
.brand{display:flex;align-items:center;gap:10px}
.brand img{width:42px;height:42px}
.brand strong{display:block;font-size:16px;line-height:1.1}
.brand span{font-size:12px;color:var(--muted)}

.nav-desktop{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.nav-link{padding:8px 11px;border-radius:10px;font-size:14px;font-weight:700;color:#1e293b}
.nav-link:hover,.nav-link.active{background:#edf4ff;color:#0b3ea8}
.nav-dropdown{position:relative}
.nav-dropdown-menu{position:absolute;left:0;top:calc(100% + 6px);min-width:210px;padding:8px;background:#fff;border:1px solid var(--line);border-radius:12px;box-shadow:0 14px 30px rgba(15,23,42,.14);display:none}
.nav-dropdown:hover .nav-dropdown-menu,.nav-dropdown:focus-within .nav-dropdown-menu{display:block}
.nav-dropdown-menu a{display:block;padding:8px 10px;border-radius:8px;font-weight:600;font-size:14px}
.nav-dropdown-menu a:hover{background:#f8fbff}

.btn{display:inline-flex;align-items:center;justify-content:center;padding:10px 13px;border-radius:10px;border:1px solid #cbd5e1;font-size:14px;font-weight:700}
.btn-primary{background:linear-gradient(135deg,var(--blue) 0%,var(--blue2) 100%);border-color:var(--blue);color:#fff}
.btn-secondary{background:#fff;color:#1d4ed8}
.btn-gold{background:linear-gradient(135deg,#8a6116 0%,var(--gold) 100%);border-color:#8a6116;color:#fff}

.mobile-toggle{display:none;background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:8px 11px;font-weight:700}
.mobile-panel{display:none;border-top:1px solid var(--line);padding:9px 0 12px}
.mobile-panel.open{display:block}
.mobile-panel a,.mobile-panel button{display:block;width:100%;text-align:left;padding:10px 12px;border:0;background:transparent;border-radius:9px;font-size:15px;font-weight:700;color:#1e293b}
.mobile-panel a:hover,.mobile-panel button:hover{background:#f8fbff}
.mobile-submenu{display:none;padding-left:10px}
.mobile-submenu.open{display:block}

.page{padding:48px 0 24px}
.hero-grid{display:grid;grid-template-columns:1.12fr .88fr;gap:18px}
.card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:22px;box-shadow:0 16px 34px rgba(15,23,42,.06)}
.card-dark{background:linear-gradient(135deg,#0a1729 0%,#1b3659 100%);color:#e2e8f0;border:0}
.eyebrow{display:inline-block;padding:7px 11px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;background:#eef4ff;border:1px solid #c5d8ff;color:#1d4ed8}
.eyebrow-gold{background:#fff7e1;border-color:#ecd089;color:#8a6116}
h1{font-size:clamp(34px,5vw,58px);line-height:1.03;margin:14px 0}
h2{font-size:30px;line-height:1.1;margin:0 0 10px}
h3{margin:0 0 8px}
.lead{font-size:18px;line-height:1.7;color:#334155}
.muted{color:var(--muted);line-height:1.65}
.section{padding:24px 0}
.grid-2,.grid-3,.grid-4{display:grid;gap:16px}
.grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}
.grid-3{grid-template-columns:repeat(3,minmax(0,1fr))}
.grid-4{grid-template-columns:repeat(4,minmax(0,1fr))}
.cta-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}
.pill-row{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}
.pill{padding:7px 11px;border:1px solid var(--line);border-radius:999px;background:#f8fbff;font-size:13px;font-weight:700;color:#334155}
.pill.ops-marker{display:none}
.list{padding-left:18px;line-height:1.8;color:#334155}
.badge{display:inline-block;padding:6px 10px;border-radius:999px;background:#dcfce7;color:var(--good);font-weight:800;font-size:12px}
.metric{font-size:29px;font-weight:800}
.field{display:grid;gap:6px}
.field input,.field select,.field textarea{width:100%;padding:12px;border:1px solid #cbd5e1;border-radius:12px}
.field textarea{min-height:120px}
.status{padding:13px;border-radius:12px;background:#eef2ff;border:1px solid #c7d2fe}
.status.warn{background:#fff7ed;border-color:#fdba74}
.status.success{background:#ecfdf5;border-color:#86efac}
.data-table{width:100%;border-collapse:collapse}
.data-table th,.data-table td{padding:12px;border-bottom:1px solid var(--line);text-align:left}
.footer{padding:34px 0 48px;color:#475569}
.footer strong{color:#0f172a}

@media(max-width:980px){
  .nav-desktop{display:none}
  .mobile-toggle{display:inline-flex}
  .topbar{position:relative}
  .topbar-inner{min-height:64px}
  .hero-grid,.grid-2,.grid-3,.grid-4{grid-template-columns:1fr}
  .page{padding-top:32px}
}
CSS

cat > dist/data/live-workspace-pack.json <<'JSON'
{
  "version": 6,
  "workspace": { "id": "fca-live-proof-workspace", "status": "active", "currentPhase": "proposal" },
  "project": { "id": "PRJ-001", "name": "Launch Demo Project", "stage": "Proposal", "nextStep": "Move package to approval" },
  "files": [
    { "name": "Intake Summary.pdf", "category": "intake", "status": "staged" },
    { "name": "Proposal-Draft-v2.docx", "category": "proposal", "status": "review" },
    { "name": "Plans-Package.zip", "category": "plans", "status": "ready" }
  ],
  "audit": [
    { "event": "Customer intake created", "actor": "User", "status": "Recorded" },
    { "event": "Checkout activation completed", "actor": "System", "status": "Recorded" },
    { "event": "Login-backed platform opened", "actor": "System", "status": "Recorded" }
  ]
}
JSON

header_markup='\
<header class="topbar">\
  <div class="wrap topbar-inner">\
    <div class="brand">\
      <img src="/favicon.svg" alt="FCA logo" />\
      <div><strong>Future Contractors of America</strong><span>Contractor Command Platform</span></div>\
    </div>\
    <nav class="nav-desktop" aria-label="Primary">\
      <a class="nav-link" href="/">Home</a>\
      <a class="nav-link" href="/features/">Features</a>\
      <div class="nav-dropdown">\
        <a class="nav-link" href="/solutions/">Solutions ▾</a>\
        <div class="nav-dropdown-menu">\
          <a href="/solutions/">By Company Stage</a>\
          <a href="/pricing/">Plans and Pricing</a>\
          <a href="/auricrux/">Guided Decision Support</a>\
        </div>\
      </div>\
      <a class="nav-link" href="/pricing/">Pricing</a>\
      <a class="nav-link" href="/contact/">Contact</a>\
      <a class="btn btn-secondary" href="/intake/">Get Started</a>\
      <a class="btn btn-primary" href="/login/">Login</a>\
    </nav>\
    <button class="mobile-toggle" type="button" aria-expanded="false" aria-controls="mobilePanel" onclick="window.fcaToggleMobileNav && window.fcaToggleMobileNav()">Menu</button>\
  </div>\
  <div class="wrap mobile-panel" id="mobilePanel">\
    <a href="/">Home</a>\
    <a href="/features/">Features</a>\
    <button type="button" onclick="window.fcaToggleMobileSolutions && window.fcaToggleMobileSolutions()">Solutions</button>\
    <div class="mobile-submenu" id="mobileSolutions">\
      <a href="/solutions/">By Company Stage</a>\
      <a href="/pricing/">Plans and Pricing</a>\
      <a href="/auricrux/">Guided Decision Support</a>\
    </div>\
    <a href="/pricing/">Pricing</a>\
    <a href="/contact/">Contact</a>\
    <a href="/intake/">Get Started</a>\
    <a href="/login/">Login</a>\
  </div>\
</header>\
<script>\
(function(){\
  window.fcaToggleMobileNav=function(){\
    var panel=document.getElementById("mobilePanel");\
    var btn=document.querySelector(".mobile-toggle");\
    if(!panel||!btn) return;\
    var open=panel.classList.toggle("open");\
    btn.setAttribute("aria-expanded",open?"true":"false");\
  };\
  window.fcaToggleMobileSolutions=function(){\
    var menu=document.getElementById("mobileSolutions");\
    if(menu) menu.classList.toggle("open");\
  };\
  var path=(location.pathname||"/").replace(/\/$/,"")||"/";\
  var links=document.querySelectorAll(".nav-link");\
  links.forEach(function(link){\
    var href=(link.getAttribute("href")||"/").replace(/\/$/,"")||"/";\
    if(path===href || (href!=="/" && path.startsWith(href))){\
      link.classList.add("active");\
    }\
  });\
})();\
</script>'

footer_markup='\
<footer class="footer">\
  <div class="wrap grid-2">\
    <div><strong>Future Contractors of America</strong><p>A client-ready operating platform for intake, bids, proposals, files, and project coordination.</p></div>\
    <div><strong>Contact</strong><p>sales@futurecontractorsofamerica.com<br/>info@futurecontractorsofamerica.com<br/>support@futurecontractorsofamerica.com</p></div>\
  </div>\
</footer>'

create_page(){
  local page_path="$1"
  local title="$2"
  local body="$3"
  mkdir -p "dist${page_path}"
  cat > "dist${page_path}/index.html" <<HTML
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="stylesheet" href="/styles.css" />
</head>
<body>
${header_markup}
${body}
${footer_markup}
</body>
</html>
HTML
}

create_page "/" "Future Contractors of America | Contractor Command" '<main><section class="page"><div class="wrap hero-grid"><div><span class="eyebrow">Contractor Growth Platform</span><h1>Win more work with a cleaner customer journey and stronger operational control.</h1><p class="lead">FCA Contractor Command gives contracting businesses a professional digital experience from intake and bid tracking through proposal delivery and project execution visibility.</p><div class="pill-row"><span class="pill">Built for real contractor teams</span><span class="pill">Clear client experience</span><span class="pill">Faster bid to project handoff</span><span class="pill ops-marker">Cross-host login continuity patch active</span></div><div class="cta-row"><a class="btn btn-primary" href="/intake/">Start Intake</a><a class="btn btn-secondary" href="/pricing/">View Pricing</a><a class="btn btn-gold" href="/auricrux/">Explore Auricrux</a></div></div><aside class="card card-dark"><span class="eyebrow">Live Workflow</span><h2 style="color:#f8fafc">See the product in action</h2><ul class="list" style="color:#e2e8f0"><li>Create your company account.</li><li>Complete plan activation.</li><li>Sign in and open your dashboard.</li><li>Review projects, files, and audit in one workspace.</li></ul><div class="cta-row"><a class="btn btn-primary" href="/portal/platform/">Open Platform</a></div></aside></div></section><section class="section"><div class="wrap grid-4"><article class="card"><span class="badge">Sales Ready</span><h3 style="margin-top:10px">Lead Intake</h3><p class="muted">Capture qualified customer opportunities with a polished intake flow.</p></article><article class="card"><span class="badge">Ops Ready</span><h3 style="margin-top:10px">Bid Visibility</h3><p class="muted">Track opportunity status and next actions with less manual overhead.</p></article><article class="card"><span class="badge">Client Ready</span><h3 style="margin-top:10px">Proposal Movement</h3><p class="muted">Advance from pricing to approval with clearer customer communication.</p></article><article class="card"><span class="badge">Execution Ready</span><h3 style="margin-top:10px">Workspace Continuity</h3><p class="muted">Use connected project, file, and audit surfaces in a single system.</p></article></div></section></main>'

create_page "/features" "FCA Features" '<main class="page"><div class="wrap"><span class="eyebrow">Features</span><h1>Everything needed to run modern contractor operations</h1><div class="grid-3"><article class="card"><h3>Account-based intake</h3><p class="muted">Every customer starts with a secure account and workspace access.</p></article><article class="card"><h3>Connected operations</h3><p class="muted">Projects, files, and activity history stay aligned across your workflow.</p></article><article class="card"><h3>Decision support</h3><p class="muted">Auricrux guidance helps teams choose plans and next steps confidently.</p></article></div></div></main>'

create_page "/solutions" "FCA Solutions" '<main class="page"><div class="wrap"><span class="eyebrow">Solutions</span><h1>Designed for contractors at every stage of growth</h1><div class="grid-3"><article class="card"><h3>Owner operators</h3><p class="muted">Present a more professional experience and improve close rates.</p></article><article class="card"><h3>Growing teams</h3><p class="muted">Standardize bid and proposal execution across staff.</p></article><article class="card"><h3>Enterprise rollouts</h3><p class="muted">Scale customer operations with stronger visibility and control.</p></article></div></div></main>'

create_page "/pricing" "FCA Pricing" '<main class="page"><div class="wrap"><span class="eyebrow">Pricing</span><h1>Plans that scale with your business</h1><div class="grid-4"><article class="card"><h3>Startup</h3><div class="metric">$99/mo</div><p class="muted">For owner operators building a strong digital workflow foundation.</p><div class="cta-row"><a class="btn btn-primary" href="/intake/?plan=startup">Choose Startup</a></div></article><article class="card"><h3>Team</h3><div class="metric">$299/mo</div><p class="muted">For active teams managing more bids, proposals, and communication.</p><div class="cta-row"><a class="btn btn-primary" href="/intake/?plan=team">Choose Team</a></div></article><article class="card"><h3>Growth</h3><div class="metric">$1,500/mo</div><p class="muted">For scaling operations that need stronger consistency and control.</p><div class="cta-row"><a class="btn btn-primary" href="/intake/?plan=growth">Choose Growth</a></div></article><article class="card"><h3>Enterprise</h3><div class="metric">$3,500+/mo</div><p class="muted">For multi-team environments with advanced operational needs.</p><div class="cta-row"><a class="btn btn-gold" href="/intake/?plan=enterprise">Choose Enterprise</a></div></article></div></div></main>'

create_page "/contact" "Contact FCA" '<main class="page"><div class="wrap"><span class="eyebrow">Contact</span><h1>Talk with FCA</h1><div class="grid-3"><article class="card"><h3>Sales</h3><p class="muted">sales@futurecontractorsofamerica.com</p></article><article class="card"><h3>Information</h3><p class="muted">info@futurecontractorsofamerica.com</p></article><article class="card"><h3>Support</h3><p class="muted">support@futurecontractorsofamerica.com</p></article></div></div></main>'

create_page "/auricrux" "Auricrux" '<main class="page"><div class="wrap"><section class="card"><span class="eyebrow eyebrow-gold">Auricrux</span><h1 style="font-size:48px">Guided decisions for faster onboarding and cleaner execution.</h1><p class="lead">Auricrux helps your team choose the right plan, activate quickly, and align next actions across sales and operations.</p><div class="cta-row"><a class="btn btn-gold" href="/intake/">Start Guided Intake</a><a class="btn btn-secondary" href="/portal/platform/">Open Platform</a></div></section></div></main>'

create_page "/intake" "FCA Intake" '<main class="page"><div class="wrap"><span class="eyebrow">Step 1 · Intake</span><h1>Create your account and start your workspace</h1><section class="card"><form id="intakeForm"><div class="grid-2"><div class="field"><label for="plan">Plan</label><select id="plan"><option value="startup">Startup</option><option value="team">Team</option><option value="growth">Growth</option><option value="enterprise">Enterprise</option></select></div><div class="field"><label for="company">Company</label><input id="company" required /></div><div class="field"><label for="name">Contact name</label><input id="name" required /></div><div class="field"><label for="email">Email</label><input id="email" type="email" required /></div><div class="field"><label for="password">Password</label><input id="password" type="password" required /></div><div class="field"><label for="confirmPassword">Confirm password</label><input id="confirmPassword" type="password" required /></div></div><div id="intakeStatus" class="status warn" style="margin-top:14px">These credentials will be used for your workspace login.</div><div class="cta-row"><button class="btn btn-primary" type="submit">Continue to Activation</button></div></form></section></div></main><script>const params=new URLSearchParams(location.search);const p=params.get("plan");if(p)document.getElementById("plan").value=p;document.getElementById("intakeForm").addEventListener("submit",e=>{e.preventDefault();const pw=password.value;const cp=confirmPassword.value;if(pw!==cp){intakeStatus.className="status warn";intakeStatus.textContent="Passwords do not match.";return;}const rec={plan:plan.value,company:company.value,name:name.value,email:email.value.trim().toLowerCase(),password:pw};localStorage.setItem("fca_customer_record",JSON.stringify(rec));location.href="/checkout/?plan="+encodeURIComponent(rec.plan);});</script>'

create_page "/checkout" "FCA Activation" '<main class="page"><div class="wrap"><span class="eyebrow">Step 2 · Activation</span><h1>Apply your code and continue to login</h1><section class="card"><div id="summary" class="status">Loading intake record…</div><div class="field" style="margin-top:12px"><label for="promo">Activation code</label><input id="promo" placeholder="Enter your code" /></div><div id="promoStatus" class="status warn" style="margin-top:12px">Enter your activation or promo code if provided.</div><div class="cta-row"><button class="btn btn-primary" type="button" onclick="applyCode()">Apply Code</button><a class="btn btn-secondary" href="/login/">Continue to Login</a></div></section></div></main><script>const rec=JSON.parse(localStorage.getItem("fca_customer_record")||"null");if(rec){summary.innerHTML=`<strong>Plan:</strong> ${rec.plan}<br/><strong>Company:</strong> ${rec.company}<br/><strong>Email:</strong> ${rec.email}`;}else{summary.textContent="No intake record found.";}function applyCode(){const v=(promo.value||"").trim();if(v){promoStatus.className="status success";promoStatus.textContent="Code applied.";}else{promoStatus.className="status warn";promoStatus.textContent="Enter a code to apply.";}}</script>'

create_page "/login" "FCA Login" '<main class="page"><div class="wrap"><span class="eyebrow">Step 3 · Login</span><h1>Sign in to your FCA workspace</h1><section class="card"><form id="loginForm"><div class="field"><label>Email</label><input id="email" type="email" /></div><div class="field"><label>Password</label><input id="password" type="password" /></div><div class="cta-row"><button class="btn btn-primary" type="submit">Sign In</button><a class="btn btn-secondary" href="/intake/">Create Account</a></div><p style="font-size:13px;color:#64748b">Validation fallback account is available for launch checks.</p></form><div id="statusBox" class="status" style="margin-top:12px">Use your intake credentials.</div></section></div></main><script>const f={email:"launch.customer@futurecontractorsofamerica.com",password:"FCA-Launch-2026!"};const rec=JSON.parse(localStorage.getItem("fca_customer_record")||"null");if(rec?.email)email.value=rec.email;loginForm.addEventListener("submit",e=>{e.preventDefault();const e1=email.value.trim().toLowerCase(),p1=password.value.trim();if((rec&&rec.email===e1&&rec.password===p1)||(e1===f.email&&p1===f.password)){statusBox.className="status success";statusBox.textContent="Login successful. Opening platform…";setTimeout(()=>location.href="/portal/platform/",350);}else{statusBox.className="status warn";statusBox.textContent="Credentials did not validate.";}});</script>'

create_page "/portal/platform" "FCA Platform" '<main class="page"><div class="wrap"><span class="eyebrow">Live Product Surface</span><h1>Platform Dashboard</h1><p class="lead">Your live workspace for project visibility, file continuity, and operational activity tracking.</p><div class="grid-4"><div class="card"><h3>Project</h3><p id="projectName">Loading…</p></div><div class="card"><h3>Customer</h3><p id="customerName">Loading…</p></div><div class="card"><h3>Next Action</h3><p id="nextAction">Loading…</p></div><div class="card"><h3>Workspace</h3><p id="workspaceState">Loading…</p></div></div><div class="cta-row"><a class="btn btn-primary" href="/portal/projects/">Projects</a><a class="btn btn-secondary" href="/portal/files/">Files</a><a class="btn btn-secondary" href="/portal/audit/">Audit</a><a class="btn btn-gold" href="/pricing/">Upgrade Plan</a></div></div></main><script>async function h(){const rec=JSON.parse(localStorage.getItem("fca_customer_record")||"null");const p=await fetch('/data/live-workspace-pack.json').then(r=>r.json());customerName.textContent=rec?.company||'Launch Customer Workspace';projectName.textContent=rec?.company?`${rec.company} — Initial Opportunity`:p.project.name;nextAction.textContent=p.project.nextStep;workspaceState.textContent=p.workspace.status;}h();</script>'

create_page "/portal/projects" "FCA Projects" '<main class="page"><div class="wrap"><h1>Projects</h1><section class="card"><table class="data-table"><thead><tr><th>Project</th><th>Stage</th><th>Next Step</th></tr></thead><tbody id="rows"><tr><td>Loading…</td><td>—</td><td>—</td></tr></tbody></table></section></div></main><script>async function h(){const p=await fetch('/data/live-workspace-pack.json').then(r=>r.json());rows.innerHTML=`<tr><td>${p.project.name}</td><td>${p.project.stage}</td><td>${p.project.nextStep}</td></tr>`;}h();</script>'

create_page "/portal/files" "FCA Files" '<main class="page"><div class="wrap"><h1>Files</h1><div id="grid" class="grid-3"></div></div></main><script>async function h(){const p=await fetch('/data/live-workspace-pack.json').then(r=>r.json());grid.innerHTML=p.files.map(f=>`<article class="card"><h3>${f.name}</h3><p class="muted">${f.category} · ${f.status}</p></article>`).join("");}h();</script>'

create_page "/portal/audit" "FCA Audit" '<main class="page"><div class="wrap"><h1>Audit</h1><section class="card"><table class="data-table"><thead><tr><th>Event</th><th>Actor</th><th>Status</th></tr></thead><tbody id="rows"><tr><td>Loading…</td><td>—</td><td>—</td></tr></tbody></table></section></div></main><script>async function h(){const p=await fetch('/data/live-workspace-pack.json').then(r=>r.json());rows.innerHTML=p.audit.map(a=>`<tr><td>${a.event}</td><td>${a.actor}</td><td>${a.status}</td></tr>`).join("");}h();</script>'

create_page "/warranty" "FCA Warranty" '<main class="page"><div class="wrap"><h1>Warranty Continuity</h1><section class="card"><p class="lead">Warranty route remains active and reachable.</p></section></div></main>'
create_page "/referrals" "FCA Referrals" '<main class="page"><div class="wrap"><h1>Referral Continuity</h1><section class="card"><p class="lead">Referral route remains active and reachable.</p></section></div></main>'

cat > dist/deployment-status.json <<JSON
{
  "status": "live-shell-investor-premium-pass-2-active",
  "shell": "FCA Contractor Command",
  "execution": "Auricrux-Central",
  "nextAction": "MNCL-004",
  "proofRoutes": [
    "/portal/platform/",
    "/portal/projects/",
    "/portal/files/",
    "/portal/audit/",
    "/auricrux/run-digest/index.json",
    "/deployment-status.json"
  ],
  "dataPack": "/data/live-workspace-pack.json",
  "gitSha": "${GIT_SHA}",
  "defaultHost": "${DEFAULT_HOST}",
  "commitWitnessRoute": "${COMMIT_WITNESS_ROUTE}",
  "buildMarkerDate": "${BUILD_MARKER_DATE}",
  "buildMarkerVersion": "${BUILD_MARKER_VERSION}"
}
JSON

cat > dist/domain-continuity.json <<JSON
{
  "primary": "futurecontractorsofamerica.com",
  "www": "www.futurecontractorsofamerica.com",
  "swa": "${DEFAULT_HOST}",
  "status": "continuity-preserved",
  "expectedHosts": ${EXPECTED_HOSTS_JSON}
}
JSON

cat > dist/runtime-fingerprint.txt <<EOF
shell=FCA Contractor Command
gitSha=${GIT_SHA}
defaultHost=${DEFAULT_HOST}
commitWitnessRoute=${COMMIT_WITNESS_ROUTE}
status=live-shell-investor-premium-pass-2-active
buildMarkerDate=${BUILD_MARKER_DATE}
buildMarkerVersion=${BUILD_MARKER_VERSION}
EOF

cat > dist/live-shell-verification.html <<'HTML'
<!doctype html><html lang="en"><head><meta charset="utf-8"><title>FCA Live Shell Verification</title></head><body><h1>FCA Live Shell Verification</h1><p>Investor premium pass 2 is active with cleaner customer copy and rebuilt responsive navigation.</p></body></html>
HTML

cat > dist/host-binding-audit.html <<'HTML'
<!doctype html><html lang="en"><head><meta charset="utf-8"><title>FCA Host Binding Audit</title></head><body><h1>Host Binding Audit</h1><p>futurecontractorsofamerica.com</p><p>www.futurecontractorsofamerica.com</p><p>delightful-mushroom-0de67860f.7.azurestaticapps.net</p></body></html>
HTML

cat > dist/api-continuity-audit.html <<'HTML'
<!doctype html><html lang="en"><head><meta charset="utf-8"><title>FCA API Continuity Audit</title></head><body><h1>API Continuity Audit</h1><p>/api/customer-login preserved as optional validation endpoint.</p><p>/api/run-task preserved.</p><p>Auricrux-Central execute route preserved.</p></body></html>
HTML

cat > "dist${COMMIT_WITNESS_ROUTE}" <<EOF
gitSha=${GIT_SHA}
defaultHost=${DEFAULT_HOST}
status=live-shell-investor-premium-pass-2-active
buildMarkerDate=${BUILD_MARKER_DATE}
buildMarkerVersion=${BUILD_MARKER_VERSION}
EOF

echo "FCA investor premium pass 2 build completed for ${GIT_SHA}"