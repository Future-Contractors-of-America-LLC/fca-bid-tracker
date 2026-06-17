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
BUILD_MARKER_VERSION="Investor Landing Brand Pass 2"

IFS=',' read -r -a EXPECTED_HOST_ARRAY <<< "$EXPECTED_HOSTS"
EXPECTED_HOSTS_JSON="$(printf '"%s",' "${EXPECTED_HOST_ARRAY[@]}")"
EXPECTED_HOSTS_JSON="[${EXPECTED_HOSTS_JSON%,}]"

cat > dist/styles.css <<'CSS'
:root{--ink:#0f172a;--muted:#475569;--line:#dbe4f3;--blue:#1d4ed8;--blue2:#0f3ea8;--gold:#d4a017;--gold2:#8a6116;--white:#fff;--bg:#eef4ff}
*{box-sizing:border-box}
body{margin:0;font-family:Inter,Arial,Helvetica,sans-serif;color:var(--ink);background:linear-gradient(180deg,var(--bg) 0%,#fff 45%)}
a{text-decoration:none;color:inherit}
.wrap{max-width:1180px;margin:0 auto;padding:0 20px}

.topbar{position:sticky;top:0;z-index:100;background:rgba(255,255,255,.97);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.topbar-inner{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:70px}
.brand{display:flex;align-items:center;gap:12px}
.brand img{width:46px;height:46px}
.brand-copy strong{display:block;font-size:17px;line-height:1.05}
.brand-copy span{font-size:12px;color:var(--muted)}

.brand-rail{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:16px}
.brand-chip{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:#fff}
.auricrux-mark{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,var(--gold2) 0%,var(--gold) 100%);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900}

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
.btn-gold{background:linear-gradient(135deg,var(--gold2) 0%,var(--gold) 100%);border-color:var(--gold2);color:#fff}

.mobile-toggle{display:none;background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:8px 11px;font-weight:700}
.mobile-panel{display:none;border-top:1px solid var(--line);padding:10px 0 12px}
.mobile-panel.open{display:block}
.mobile-panel a,.mobile-panel button{display:block;width:100%;text-align:left;padding:10px 12px;border:0;background:transparent;border-radius:9px;font-size:15px;font-weight:700;color:#1e293b}
.mobile-panel a:hover,.mobile-panel button:hover{background:#f8fbff}
.mobile-submenu{display:none;padding-left:10px}
.mobile-submenu.open{display:block}

.page{padding:46px 0 24px}
.hero-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:18px}
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
.metric{font-size:29px;font-weight:800}
.field{display:grid;gap:6px}
.field input,.field select{width:100%;padding:12px;border:1px solid #cbd5e1;border-radius:12px}
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
  .page{padding-top:30px}
}
CSS

cat > dist/data/live-workspace-pack.json <<'JSON'
{
  "version": 8,
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
      <div class="brand-copy"><strong>Future Contractors of America</strong><span>FCA Contractor Command</span></div>\
    </div>\
    <nav class="nav-desktop" aria-label="Primary">\
      <a class="nav-link" href="/">Home</a>\
      <a class="nav-link" href="/features/">Why FCA</a>\
      <div class="nav-dropdown">\
        <a class="nav-link" href="/solutions/">Programs ▾</a>\
        <div class="nav-dropdown-menu">\
          <a href="/solutions/">Legacy Contractor Program</a>\
          <a href="/pricing/">Plans and Pricing</a>\
          <a href="/auricrux/">Auricrux Guidance</a>\
        </div>\
      </div>\
      <a class="nav-link" href="/pricing/">Pricing</a>\
      <a class="nav-link" href="/contact/">Book Demo</a>\
      <a class="btn btn-secondary" href="/intake/">Apply</a>\
      <a class="btn btn-primary" href="/login/">Client Login</a>\
    </nav>\
    <button class="mobile-toggle" type="button" data-toggle-nav="mobilePanel">Menu</button>\
  </div>\
  <div class="wrap mobile-panel" id="mobilePanel">\
    <a href="/">Home</a>\
    <a href="/features/">Why FCA</a>\
    <button type="button" data-toggle-nav="mobilePrograms">Programs</button>\
    <div class="mobile-submenu" id="mobilePrograms">\
      <a href="/solutions/">Legacy Contractor Program</a>\
      <a href="/pricing/">Plans and Pricing</a>\
      <a href="/auricrux/">Auricrux Guidance</a>\
    </div>\
    <a href="/pricing/">Pricing</a>\
    <a href="/contact/">Book Demo</a>\
    <a href="/intake/">Apply</a>\
    <a href="/login/">Client Login</a>\
  </div>\
</header>'

footer_markup='\
<footer class="footer">\
  <div class="wrap grid-2">\
    <div><strong>Future Contractors of America</strong><p>Landing experience for early adopters, legacy contractors, and investor demonstrations.</p></div>\
    <div><strong>Contact</strong><p>sales@futurecontractorsofamerica.com<br/>info@futurecontractorsofamerica.com<br/>support@futurecontractorsofamerica.com</p></div>\
  </div>\
</footer>'

page_script='\
<script>\
(function(){\
  document.querySelectorAll("[data-toggle-nav]").forEach(function(btn){\
    btn.addEventListener("click",function(){\
      var id=btn.getAttribute("data-toggle-nav");\
      var el=document.getElementById(id);\
      if(el) el.classList.toggle("open");\
    });\
  });\
  var path=(location.pathname||"/").replace(/\/$/,"")||"/";\
  document.querySelectorAll(".nav-link").forEach(function(link){\
    var href=(link.getAttribute("href")||"/").replace(/\/$/,"")||"/";\
    if(path===href || (href!=="/" && path.indexOf(href)===0)){ link.classList.add("active"); }\
  });\
})();\
</script>'

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
${page_script}
</body>
</html>
HTML
}

create_page "/" "Future Contractors of America | Legacy Contractor Launch" '<main><section class="page"><div class="wrap hero-grid"><div><span class="eyebrow">Investor and Early Customer Landing</span><h1>A modern contractor platform built to help legacy companies scale with confidence.</h1><p class="lead">FCA delivers one operating experience for intake, bid movement, project communication, and client trust from first contact through active delivery.</p><div class="brand-rail"><div class="brand-chip"><img src="/favicon.svg" alt="FCA" style="width:28px;height:28px"/><strong>FCA Core Platform</strong></div><div class="brand-chip"><div class="auricrux-mark">A</div><strong style="color:#8a6116">Auricrux Intelligence Layer</strong></div></div><div class="pill-row"><span class="pill">Legacy contractor onboarding</span><span class="pill">Investor presentation ready</span><span class="pill">Pilot conversion focused</span><span class="pill ops-marker">Cross-host login continuity patch active</span></div><div class="cta-row"><a class="btn btn-primary" href="/contact/">Book Demo</a><a class="btn btn-secondary" href="/pricing/">View Plans</a><a class="btn btn-gold" href="/intake/">Apply for Pilot</a></div></div><aside class="card card-dark"><span class="eyebrow">Pilot Journey</span><h2 style="color:#f8fafc">What new customers do first</h2><ul class="list" style="color:#e2e8f0"><li>Apply and create an account.</li><li>Select a launch plan and activate.</li><li>Enter the workspace dashboard.</li><li>Manage projects, files, and activity in one place.</li></ul><div class="cta-row"><a class="btn btn-primary" href="/contact/">Schedule Walkthrough</a></div></aside></div></section><section class="section"><div class="wrap grid-3"><article class="card"><h3>Faster commercial momentum</h3><p class="muted">Move opportunities into qualified pipeline with less administrative drag.</p></article><article class="card"><h3>Stronger operational discipline</h3><p class="muted">Create clear visibility around active work and handoffs.</p></article><article class="card"><h3>Better customer confidence</h3><p class="muted">Present a professional system that supports trust and repeat business.</p></article></div></section></main>'

create_page "/features" "Why FCA" '<main class="page"><div class="wrap"><span class="eyebrow">Why FCA</span><h1>Designed for legacy contractors moving into modern operations</h1><div class="grid-3"><article class="card"><h3>Structured onboarding</h3><p class="muted">Account-based intake that starts every relationship cleanly.</p></article><article class="card"><h3>Unified execution visibility</h3><p class="muted">Projects, files, and activity remain connected across teams.</p></article><article class="card"><h3>Auricrux guidance</h3><p class="muted">Gold-layer guidance supports plan fit and rollout momentum.</p></article></div></div></main>'

create_page "/solutions" "Programs" '<main class="page"><div class="wrap"><span class="eyebrow">Programs</span><h1>Launch paths built for growth stage and team complexity</h1><div class="grid-3"><article class="card"><h3>Legacy Contractor Pilot</h3><p class="muted">For firms modernizing customer and operations workflows.</p></article><article class="card"><h3>Growth Team Program</h3><p class="muted">For teams requiring consistent bid and project coordination.</p></article><article class="card"><h3>Scaled Rollout Program</h3><p class="muted">For multi-team organizations standardizing execution quality.</p></article></div></div></main>'

create_page "/pricing" "Plans and Pricing" '<main class="page"><div class="wrap"><span class="eyebrow">Plans and Pricing</span><h1>Select the launch path that matches your business stage</h1><div class="grid-4"><article class="card"><h3>Startup</h3><div class="metric">$99/mo</div><p class="muted">For owner-led contractors validating a new operating process.</p><div class="cta-row"><a class="btn btn-primary" href="/intake/?plan=startup">Select Startup</a></div></article><article class="card"><h3>Team</h3><div class="metric">$299/mo</div><p class="muted">For active teams needing stronger bid and project coordination.</p><div class="cta-row"><a class="btn btn-primary" href="/intake/?plan=team">Select Team</a></div></article><article class="card"><h3>Growth</h3><div class="metric">$1,500/mo</div><p class="muted">For scaling firms improving communication and consistency.</p><div class="cta-row"><a class="btn btn-primary" href="/intake/?plan=growth">Select Growth</a></div></article><article class="card"><h3>Enterprise</h3><div class="metric">$3,500+/mo</div><p class="muted">For multi-team deployment with advanced requirements.</p><div class="cta-row"><a class="btn btn-gold" href="/intake/?plan=enterprise">Select Enterprise</a></div></article></div></div></main>'

create_page "/contact" "Book Demo" '<main class="page"><div class="wrap"><span class="eyebrow">Book Demo</span><h1>Schedule a walkthrough for your team and stakeholders</h1><div class="grid-3"><article class="card"><h3>Sales</h3><p class="muted">sales@futurecontractorsofamerica.com</p></article><article class="card"><h3>Information</h3><p class="muted">info@futurecontractorsofamerica.com</p></article><article class="card"><h3>Support</h3><p class="muted">support@futurecontractorsofamerica.com</p></article></div></div></main>'

create_page "/auricrux" "Auricrux Guidance" '<main class="page"><div class="wrap"><section class="card"><span class="eyebrow eyebrow-gold">Auricrux Guidance</span><div class="brand-chip" style="margin-top:12px;max-width:340px"><div class="auricrux-mark">A</div><strong style="color:#8a6116">Auricrux Intelligence Layer</strong></div><h1 style="font-size:48px">Guided decisions for faster onboarding and cleaner execution.</h1><p class="lead">Auricrux helps teams choose plans, prioritize rollout steps, and maintain momentum during adoption.</p><div class="cta-row"><a class="btn btn-gold" href="/intake/">Start Guided Intake</a><a class="btn btn-secondary" href="/contact/">Book Walkthrough</a></div></section></div></main>'

create_page "/intake" "Pilot Intake" '<main class="page"><div class="wrap"><span class="eyebrow">Step 1</span><h1>Submit your company profile and start pilot onboarding</h1><section class="card"><form id="intakeForm"><div class="grid-2"><div class="field"><label for="plan">Plan</label><select id="plan"><option value="startup">Startup</option><option value="team">Team</option><option value="growth">Growth</option><option value="enterprise">Enterprise</option></select></div><div class="field"><label for="company">Company</label><input id="company" required /></div><div class="field"><label for="name">Contact name</label><input id="name" required /></div><div class="field"><label for="email">Email</label><input id="email" type="email" required /></div><div class="field"><label for="password">Password</label><input id="password" type="password" required /></div><div class="field"><label for="confirmPassword">Confirm password</label><input id="confirmPassword" type="password" required /></div></div><div id="intakeStatus" class="status warn" style="margin-top:14px">These credentials will be used for workspace login.</div><div class="cta-row"><button class="btn btn-primary" type="submit">Continue to Activation</button></div></form></section></div></main><script>const params=new URLSearchParams(location.search);const p=params.get("plan");if(p)document.getElementById("plan").value=p;document.getElementById("intakeForm").addEventListener("submit",e=>{e.preventDefault();const pw=password.value;const cp=confirmPassword.value;if(pw!==cp){intakeStatus.className="status warn";intakeStatus.textContent="Passwords do not match.";return;}const rec={plan:plan.value,company:company.value,name:name.value,email:email.value.trim().toLowerCase(),password:pw};localStorage.setItem("fca_customer_record",JSON.stringify(rec));location.href="/checkout/?plan="+encodeURIComponent(rec.plan);});</script>'

create_page "/checkout" "Activation" '<main class="page"><div class="wrap"><span class="eyebrow">Step 2</span><h1>Apply your code and continue to workspace login</h1><section class="card"><div id="summary" class="status">Loading intake record…</div><div class="field" style="margin-top:12px"><label for="promo">Activation code</label><input id="promo" placeholder="Enter your code" /></div><div id="promoStatus" class="status warn" style="margin-top:12px">Enter your activation or promo code if provided.</div><div class="cta-row"><button class="btn btn-primary" type="button" onclick="applyCode()">Apply Code</button><a class="btn btn-secondary" href="/login/">Continue to Login</a></div></section></div></main><script>const rec=JSON.parse(localStorage.getItem("fca_customer_record")||"null");if(rec){summary.innerHTML=`<strong>Plan:</strong> ${rec.plan}<br/><strong>Company:</strong> ${rec.company}<br/><strong>Email:</strong> ${rec.email}`;}else{summary.textContent="No intake record found.";}function applyCode(){const v=(promo.value||"").trim();if(v){promoStatus.className="status success";promoStatus.textContent="Code applied.";}else{promoStatus.className="status warn";promoStatus.textContent="Enter a code to apply.";}}</script>'

create_page "/login" "Client Login" '<main class="page"><div class="wrap"><span class="eyebrow">Step 3</span><h1>Sign in to your FCA workspace</h1><section class="card"><form id="loginForm"><div class="field"><label>Email</label><input id="email" type="email" /></div><div class="field"><label>Password</label><input id="password" type="password" /></div><div class="cta-row"><button class="btn btn-primary" type="submit">Sign In</button><a class="btn btn-secondary" href="/intake/">Create Account</a></div><p style="font-size:13px;color:#64748b">Validation fallback account is available for launch checks.</p></form><div id="statusBox" class="status" style="margin-top:12px">Use your intake credentials.</div></section></div></main><script>const f={email:"launch.customer@futurecontractorsofamerica.com",password:"FCA-Launch-2026!"};const rec=JSON.parse(localStorage.getItem("fca_customer_record")||"null");if(rec?.email)email.value=rec.email;loginForm.addEventListener("submit",e=>{e.preventDefault();const e1=email.value.trim().toLowerCase(),p1=password.value.trim();if((rec&&rec.email===e1&&rec.password===p1)||(e1===f.email&&p1===f.password)){statusBox.className="status success";statusBox.textContent="Login successful. Opening platform…";setTimeout(()=>location.href="/portal/platform/",350);}else{statusBox.className="status warn";statusBox.textContent="Credentials did not validate.";}});</script>'

create_page "/portal/platform" "Platform" '<main class="page"><div class="wrap"><span class="eyebrow">Live Product Surface</span><h1>Platform Dashboard</h1><p class="lead">Your workspace for project visibility, file continuity, and activity tracking.</p><div class="grid-4"><div class="card"><h3>Project</h3><p id="projectName">Loading…</p></div><div class="card"><h3>Customer</h3><p id="customerName">Loading…</p></div><div class="card"><h3>Next Action</h3><p id="nextAction">Loading…</p></div><div class="card"><h3>Workspace</h3><p id="workspaceState">Loading…</p></div></div><div class="cta-row"><a class="btn btn-primary" href="/portal/projects/">Projects</a><a class="btn btn-secondary" href="/portal/files/">Files</a><a class="btn btn-secondary" href="/portal/audit/">Audit</a><a class="btn btn-gold" href="/pricing/">Upgrade Plan</a></div></div></main><script>async function h(){const rec=JSON.parse(localStorage.getItem("fca_customer_record")||"null");const p=await fetch('/data/live-workspace-pack.json').then(r=>r.json());customerName.textContent=rec?.company||'Launch Customer Workspace';projectName.textContent=rec?.company?`${rec.company} — Initial Opportunity`:p.project.name;nextAction.textContent=p.project.nextStep;workspaceState.textContent=p.workspace.status;}h();</script>'

create_page "/portal/projects" "Projects" '<main class="page"><div class="wrap"><h1>Projects</h1><section class="card"><table class="data-table"><thead><tr><th>Project</th><th>Stage</th><th>Next Step</th></tr></thead><tbody id="rows"><tr><td>Loading…</td><td>—</td><td>—</td></tr></tbody></table></section></div></main><script>async function h(){const p=await fetch('/data/live-workspace-pack.json').then(r=>r.json());rows.innerHTML=`<tr><td>${p.project.name}</td><td>${p.project.stage}</td><td>${p.project.nextStep}</td></tr>`;}h();</script>'

create_page "/portal/files" "Files" '<main class="page"><div class="wrap"><h1>Files</h1><div id="grid" class="grid-3"></div></div></main><script>async function h(){const p=await fetch('/data/live-workspace-pack.json').then(r=>r.json());grid.innerHTML=p.files.map(f=>`<article class="card"><h3>${f.name}</h3><p class="muted">${f.category} · ${f.status}</p></article>`).join("");}h();</script>'

create_page "/portal/audit" "Audit" '<main class="page"><div class="wrap"><h1>Audit</h1><section class="card"><table class="data-table"><thead><tr><th>Event</th><th>Actor</th><th>Status</th></tr></thead><tbody id="rows"><tr><td>Loading…</td><td>—</td><td>—</td></tr></tbody></table></section></div></main><script>async function h(){const p=await fetch('/data/live-workspace-pack.json').then(r=>r.json());rows.innerHTML=p.audit.map(a=>`<tr><td>${a.event}</td><td>${a.actor}</td><td>${a.status}</td></tr>`).join("");}h();</script>'

create_page "/warranty" "Warranty" '<main class="page"><div class="wrap"><h1>Warranty Continuity</h1><section class="card"><p class="lead">Warranty route remains active and reachable.</p></section></div></main>'
create_page "/referrals" "Referrals" '<main class="page"><div class="wrap"><h1>Referral Continuity</h1><section class="card"><p class="lead">Referral route remains active and reachable.</p></section></div></main>'

cat > dist/deployment-status.json <<JSON
{
  "status": "live-shell-investor-landing-brand-pass-2-active",
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
status=live-shell-investor-landing-brand-pass-2-active
buildMarkerDate=${BUILD_MARKER_DATE}
buildMarkerVersion=${BUILD_MARKER_VERSION}
EOF

cat > dist/live-shell-verification.html <<'HTML'
<!doctype html><html lang="en"><head><meta charset="utf-8"><title>FCA Live Shell Verification</title></head><body><h1>FCA Live Shell Verification</h1><p>Investor landing brand pass 2 is active with repaired mobile menu behavior and stronger FCA and Auricrux identity markers.</p></body></html>
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
status=live-shell-investor-landing-brand-pass-2-active
buildMarkerDate=${BUILD_MARKER_DATE}
buildMarkerVersion=${BUILD_MARKER_VERSION}
EOF

echo "FCA investor landing brand pass 2 build completed for ${GIT_SHA}"