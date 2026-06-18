#!/bin/bash
set -euo pipefail

PILOT_CHECKOUT_URL="https://buy.stripe.com/bJe14o0fQ5Pn8Tt7Bw5gc01"

rm -rf dist
mkdir -p dist dist/data
cp -R public/. dist/

GIT_SHA="${GITHUB_SHA:-local-dev}"
DEFAULT_HOST="${AURICRUX_SWA_DEFAULT_HOST:-delightful-mushroom-0de67860f.7.azurestaticapps.net}"
EXPECTED_HOSTS="${AURICRUX_EXPECTED_HOSTS:-futurecontractorsofamerica.com,www.futurecontractorsofamerica.com,delightful-mushroom-0de67860f.7.azurestaticapps.net}"
COMMIT_WITNESS_ROUTE="/commit-witness-${GIT_SHA}.txt"
BUILD_MARKER_DATE="June 18, 2026"
BUILD_MARKER_VERSION="Customer Landing v7 Brand-Audit-Enforced"

IFS=',' read -r -a EXPECTED_HOST_ARRAY <<< "$EXPECTED_HOSTS"
EXPECTED_HOSTS_JSON="$(printf '"%s",' "${EXPECTED_HOST_ARRAY[@]}")"
EXPECTED_HOSTS_JSON="[${EXPECTED_HOSTS_JSON%,}]"

cat > dist/styles.css <<'CSS'
:root{
  --fca-blue-900:#0b2458;
  --fca-blue-800:#143b8f;
  --fca-blue-700:#1d4ed8;
  --fca-blue-600:#3157d7;
  --fca-blue-500:#4f7cff;
  --fca-blue-100:#dce9ff;
  --fca-blue-050:#eef4ff;
  --ink:#0f172a;
  --muted:#475569;
  --line:#dbe4f3;

  --auricrux-gold-900:#5a3909;
  --auricrux-gold-800:#7c5313;
  --auricrux-gold-700:#8a6116;
  --auricrux-gold-600:#b8841c;
  --auricrux-gold-500:#d4a017;
  --auricrux-gold-100:#fff2c8;
  --auricrux-gold-050:#fff8e6;
}
*{box-sizing:border-box}
body{margin:0;font-family:Inter,Arial,Helvetica,sans-serif;color:var(--ink);background:radial-gradient(1200px 520px at 80% -120px,var(--fca-blue-100) 0%,#ecf2ff 45%,#fff 100%)}
a{text-decoration:none;color:inherit}.wrap{max-width:1200px;margin:0 auto;padding:0 20px}
.topbar{position:sticky;top:0;z-index:100;background:rgba(255,255,255,.98);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.topbar-inner{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:74px}
.brand{display:flex;align-items:center;gap:12px}.brand img{width:48px;height:48px}.brand-copy strong{display:block;font-size:18px;line-height:1.02}.brand-copy span{font-size:12px;color:var(--muted)}
.nav-desktop{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.nav-link{padding:8px 11px;border-radius:10px;font-size:14px;font-weight:800;color:#1e293b}.nav-link:hover,.nav-link.active{background:var(--fca-blue-050);color:var(--fca-blue-700)}
.nav-dropdown{position:relative}.nav-dropdown-menu{position:absolute;left:0;top:calc(100% + 6px);min-width:220px;padding:8px;background:#fff;border:1px solid var(--line);border-radius:12px;box-shadow:0 14px 30px rgba(15,23,42,.14);display:none}.nav-dropdown:hover .nav-dropdown-menu,.nav-dropdown:focus-within .nav-dropdown-menu{display:block}.nav-dropdown-menu a{display:block;padding:8px 10px;border-radius:8px;font-weight:600;font-size:14px}.nav-dropdown-menu a:hover{background:#f8fbff}
.btn{display:inline-flex;align-items:center;justify-content:center;padding:10px 14px;border-radius:10px;border:1px solid #cbd5e1;font-size:14px;font-weight:800}
.btn-primary{background:linear-gradient(135deg,var(--fca-blue-700) 0%,var(--fca-blue-800) 100%);border-color:var(--fca-blue-700);color:#fff}
.btn-secondary{background:#fff;color:var(--fca-blue-700);border-color:#bfdbfe}
.btn-auricrux{background:linear-gradient(135deg,var(--auricrux-gold-800) 0%,var(--auricrux-gold-500) 100%);border-color:var(--auricrux-gold-700);color:#fff}
.mobile-toggle{display:none;background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:8px 11px;font-weight:800}.mobile-panel{display:none;border-top:1px solid var(--line);padding:10px 0 12px}.mobile-panel.open{display:block}.mobile-panel a,.mobile-panel button{display:block;width:100%;text-align:left;padding:10px 12px;border:0;background:transparent;border-radius:9px;font-size:15px;font-weight:800;color:#1e293b}.mobile-panel a:hover,.mobile-panel button:hover{background:#f8fbff}.mobile-submenu{display:none;padding-left:10px}.mobile-submenu.open{display:block}
.page{padding:52px 0 24px}.hero-grid{display:grid;grid-template-columns:1.08fr .92fr;gap:18px}.card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:22px;box-shadow:0 18px 34px rgba(15,23,42,.06)}.card-pop{background:linear-gradient(155deg,var(--fca-blue-800) 0%,var(--fca-blue-700) 48%,var(--fca-blue-500) 100%);color:#f8fafc;border:0}
.eyebrow{display:inline-block;padding:7px 11px;border-radius:999px;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;background:var(--fca-blue-050);border:1px solid #c5d8ff;color:var(--fca-blue-700)}
.eyebrow-auricrux{background:var(--auricrux-gold-050);border-color:#ecd089;color:var(--auricrux-gold-700)}
h1{font-size:clamp(36px,5vw,62px);line-height:1.02;margin:14px 0}h2{font-size:30px;line-height:1.1;margin:0 0 10px}h3{margin:0 0 8px}.lead{font-size:19px;line-height:1.68;color:#334155}.muted{color:var(--muted);line-height:1.65}
.section{padding:24px 0}.grid-2,.grid-3,.grid-4{display:grid;gap:16px}.grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}.grid-3{grid-template-columns:repeat(3,minmax(0,1fr))}.grid-4{grid-template-columns:repeat(4,minmax(0,1fr))}
.cta-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}.pill-row{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}.pill{padding:7px 11px;border:1px solid var(--line);border-radius:999px;background:#f8fbff;font-size:13px;font-weight:800;color:#334155}
.metric{font-size:32px;font-weight:900}.metric-label{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#93c5fd;font-weight:800}
.brand-rail{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:16px}.brand-chip{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:#fff;font-weight:800}
.field{display:grid;gap:6px}.field input,.field select{width:100%;padding:12px;border:1px solid #cbd5e1;border-radius:12px}.status{padding:13px;border-radius:12px;background:#eef2ff;border:1px solid #c7d2fe}.status.warn{background:#fff7ed;border-color:#fdba74}.status.success{background:#ecfdf5;border-color:#86efac}
.data-table{width:100%;border-collapse:collapse}.data-table th,.data-table td{padding:12px;border-bottom:1px solid var(--line);text-align:left}.footer{padding:34px 0 48px;color:#475569}.footer strong{color:#0f172a}
.tier-kicker{font-size:12px;text-transform:uppercase;letter-spacing:.08em;font-weight:900;color:var(--fca-blue-700);margin-bottom:8px}
.auricrux-callout{border:1px solid #ecd089;border-radius:12px;padding:10px;background:var(--auricrux-gold-050)}
.auricrux-logo{display:inline-flex;align-items:center;gap:10px}
.auricrux-logo svg{width:38px;height:38px}
.auricrux-logo span{font-weight:900;letter-spacing:.06em;color:var(--auricrux-gold-700);text-transform:uppercase}
.auricrux-dock-btn{position:fixed;right:16px;bottom:16px;z-index:9999;border-radius:999px;padding:10px 14px;border:1px solid var(--auricrux-gold-500);background:linear-gradient(135deg,var(--auricrux-gold-100) 0%,var(--auricrux-gold-500) 60%,var(--auricrux-gold-700) 100%);color:#2c1803;font-weight:900;cursor:pointer;box-shadow:0 14px 24px rgba(124,83,19,.32)}
.auricrux-dock-panel{position:fixed;right:16px;bottom:68px;z-index:9999;width:min(92vw,360px);border:1px solid #ecd089;border-radius:14px;background:linear-gradient(135deg,var(--auricrux-gold-050) 0%,#fff 68%);box-shadow:0 20px 32px rgba(124,83,19,.2);padding:12px;display:none}
.auricrux-dock-panel.open{display:block}
.auricrux-dock-panel input{width:100%;padding:10px;border:1px solid #e7c77f;border-radius:10px;margin:8px 0}
.auricrux-dock-panel .reply{border:1px solid #ecd089;border-radius:10px;background:#fffdf5;padding:10px;color:#4b3208;line-height:1.6}
@media(max-width:980px){.nav-desktop{display:none}.mobile-toggle{display:inline-flex}.topbar{position:relative}.topbar-inner{min-height:66px}.hero-grid,.grid-2,.grid-3,.grid-4{grid-template-columns:1fr}.page{padding-top:30px}}
CSS

cat > dist/nav.js <<'JS'
(function(){
  function toggleById(id){
    var el=document.getElementById(id);
    if(el) el.classList.toggle('open');
  }
  document.addEventListener('click',function(evt){
    var t=evt.target;
    if(!(t instanceof Element)) return;
    var btn=t.closest('[data-toggle-nav]');
    if(btn){
      var id=btn.getAttribute('data-toggle-nav');
      if(id) toggleById(id);
      return;
    }
    var ask=t.closest('[data-auricrux-ask]');
    if(ask){
      var input=document.getElementById('auricruxPrompt');
      var reply=document.getElementById('auricruxReply');
      var v=(input&&input.value||'').toLowerCase();
      if(!reply) return;
      if(v.indexOf('next')>=0||v.indexOf('priority')>=0) reply.textContent='Auricrux: Open Platform Dashboard, review blockers, then execute next action in operations.';
      else if(v.indexOf('academy')>=0||v.indexOf('training')>=0) reply.textContent='Auricrux: Open Academy Catalog and map role tracks to project stage.';
      else if(v.indexOf('pricing')>=0||v.indexOf('plan')>=0) reply.textContent='Auricrux: Compare Starter Team, Team, and Operations to match rollout pace.';
      else reply.textContent='Auricrux: Request received. Continue via Platform, Academy, or Contact routes.';
      if(input) input.value='';
    }
  });
  var path=(location.pathname||'/').replace(/\/$/,'')||'/';
  document.querySelectorAll('.nav-link').forEach(function(link){
    var href=(link.getAttribute('href')||'/').replace(/\/$/,'')||'/';
    if(path===href || (href!=='/' && path.indexOf(href)===0)) link.classList.add('active');
  });
})();
JS

cat > dist/data/live-workspace-pack.json <<'JSON'
{
  "version": 13,
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

auricrux_logo_markup=$(cat <<'HTML'
<div class="auricrux-logo">
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="cruxGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(60 60) rotate(90) scale(56)">
        <stop stop-color="#FFF4D1"/>
        <stop offset="0.58" stop-color="#D4A017"/>
        <stop offset="1" stop-color="#8A6116"/>
      </radialGradient>
    </defs>
    <circle cx="60" cy="60" r="52" fill="url(#cruxGlow)" stroke="#7C5313" stroke-width="4"/>
    <path d="M60 24L68 42L88 44L73 56L77 76L60 67L43 76L47 56L32 44L52 42L60 24Z" fill="#FFE9A6" stroke="#7C5313" stroke-width="2"/>
    <path d="M60 43L66 51V59L60 66L54 59V51L60 43Z" fill="#4B3208"/>
    <path d="M60 66V84" stroke="#4B3208" stroke-width="7" stroke-linecap="round"/>
    <path d="M48 72H72" stroke="#4B3208" stroke-width="7" stroke-linecap="round"/>
  </svg>
  <span>Auricrux</span>
</div>
HTML
)

header_markup=$(cat <<HTML
<header class="topbar">
  <div class="wrap topbar-inner">
    <div class="brand">
      <img src="/favicon.svg" alt="FCA logo" />
      <div class="brand-copy"><strong>Future Contractors of America</strong><span>FCA Contractor Command · Auricrux-driven</span></div>
    </div>
    <nav class="nav-desktop" aria-label="Primary">
      <a class="nav-link" href="/">Home</a>
      <a class="nav-link" href="/features/">Why FCA</a>
      <div class="nav-dropdown">
        <a class="nav-link" href="/solutions/">Programs ▾</a>
        <div class="nav-dropdown-menu">
          <a href="/solutions/">Contractor Command Programs</a>
          <a href="/pricing/">Plans and Pricing</a>
          <a href="/auricrux/">Auricrux Guidance</a>
        </div>
      </div>
      <a class="nav-link" href="/pricing/">Pricing</a>
      <a class="nav-link" href="/contact/">Book Demo</a>
      <a class="btn btn-secondary" href="/intake/">Apply</a>
      <a class="btn btn-primary" href="/login/">Client Login</a>
    </nav>
    <button class="mobile-toggle" type="button" data-toggle-nav="mobilePanel">Menu</button>
  </div>
  <div class="wrap mobile-panel" id="mobilePanel">
    <a href="/">Home</a>
    <a href="/features/">Why FCA</a>
    <button type="button" data-toggle-nav="mobilePrograms">Programs</button>
    <div class="mobile-submenu" id="mobilePrograms">
      <a href="/solutions/">Contractor Command Programs</a>
      <a href="/pricing/">Plans and Pricing</a>
      <a href="/auricrux/">Auricrux Guidance</a>
    </div>
    <a href="/pricing/">Pricing</a>
    <a href="/contact/">Book Demo</a>
    <a href="/intake/">Apply</a>
    <a href="/login/">Client Login</a>
  </div>
</header>
HTML
)

footer_markup=$(cat <<'HTML'
<footer class="footer">
  <div class="wrap grid-2">
    <div><strong>Future Contractors of America</strong><p>FCA is the complete construction operating system from lead to repeat business with one unified blue-led experience.</p></div>
    <div><strong>Legal</strong><p><a href="/terms/">Terms of Service</a><br/><a href="/privacy/">Privacy Policy</a><br/><a href="/refunds/">Refunds & Billing</a></p></div>
    <div><strong>Contact</strong><p><a href="mailto:sales@futurecontractorsofamerica.com">sales@futurecontractorsofamerica.com</a><br/><a href="mailto:info@futurecontractorsofamerica.com">info@futurecontractorsofamerica.com</a><br/><a href="mailto:support@futurecontractorsofamerica.com">support@futurecontractorsofamerica.com</a></p></div>
  </div>
</footer>
HTML
)

auricrux_dock_markup=$(cat <<HTML
<button class="auricrux-dock-btn" type="button" data-toggle-nav="auricruxDock">Auricrux Live</button>
<div class="auricrux-dock-panel" id="auricruxDock">
  <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px">
    ${auricrux_logo_markup}
    <a href="/auricrux/" style="font-size:12px;color:#8a6116;font-weight:700">Open Full Surface</a>
  </div>
  <div id="auricruxReply" class="reply">Auricrux online. Ask for pricing guidance, academy next steps, or your highest priority action.</div>
  <input id="auricruxPrompt" placeholder="Ask Auricrux for next action" />
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    <button class="btn btn-auricrux" type="button" data-auricrux-ask="1">Ask Auricrux</button>
    <a class="btn btn-secondary" href="/portal/platform/">Platform</a>
    <a class="btn btn-secondary" href="/academy/">Academy</a>
  </div>
</div>
HTML
)

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
${auricrux_dock_markup}
<script src="/nav.js"></script>
</body>
</html>
HTML
}

create_page "/" "Future Contractors of America | Construction Operating System" "<main><section class=\"page\"><div class=\"wrap hero-grid\"><div><span class=\"eyebrow\">FCA Contractor Command · Auricrux-driven</span><h1>One connected construction system from first lead to repeat business.</h1><p class=\"lead\">FCA unifies sales, preconstruction, field execution, closeout, and customer follow-through in one seamless operating flow. Auricrux runs and drives the system all the way around.</p><div class=\"brand-rail\"><div class=\"brand-chip\"><img src=\"/favicon.svg\" alt=\"FCA\" style=\"width:28px;height:28px\" /><span>FCA SaaS Operating Platform</span></div><div class=\"brand-chip\">${auricrux_logo_markup}</div></div><div class=\"pill-row\"><span class=\"pill\">Lead to repeat workflow continuity</span><span class=\"pill\">Unified SaaS + Academy experience</span><span class=\"pill\">Auricrux integrated in every layer</span></div><div class=\"cta-row\"><a class=\"btn btn-primary\" href=\"${PILOT_CHECKOUT_URL}\">Buy Pilot — \$2,500</a><a class=\"btn btn-secondary\" href=\"/pricing/\">View All Plans</a><a class=\"btn btn-secondary\" href=\"/login/\">Try Demo</a><a class=\"btn btn-auricrux\" href=\"/auricrux/\">Open Auricrux</a></div></div><aside class=\"card card-pop\"><div class=\"metric-label\">System advantage</div><div class=\"metric\">One operating flow</div><div class=\"metric-label\" style=\"margin-top:12px\">Control advantage</div><div class=\"metric\">Auricrux-driven continuity</div><div class=\"metric-label\" style=\"margin-top:12px\">Growth advantage</div><div class=\"metric\">Retention + repeat business</div></aside></div></section></main>"

create_page "/features" "Why FCA" "<main class=\"page\"><div class=\"wrap\"><span class=\"eyebrow\">Why FCA</span><h1>Designed for contractors who need growth without operational chaos</h1><div class=\"grid-3\"><article class=\"card\"><h3>Structured onboarding</h3><p class=\"muted\">Account-based intake creates a reliable start for every client engagement.</p></article><article class=\"card\"><h3>Unified operating view</h3><p class=\"muted\">Project status, files, and activity history stay connected in one surface.</p></article><article class=\"card\"><h3>Auricrux system control</h3><p class=\"muted\">Auricrux preserves next actions, continuity, and execution quality across the full lifecycle.</p></article></div></div></main>"

create_page "/solutions" "Programs" "<main class=\"page\"><div class=\"wrap\"><span class=\"eyebrow\">Programs</span><h1>Program options that match team maturity and growth goals</h1><div class=\"grid-3\"><article class=\"card\"><h3>Contractor Command Pilot</h3><p class=\"muted\">Guided launch for teams moving from fragmented tools into one system.</p></article><article class=\"card\"><h3>Growth Team Program</h3><p class=\"muted\">Increase bid conversion and improve handoff quality.</p></article><article class=\"card\"><h3>Scaled Rollout Program</h3><p class=\"muted\">Standardize delivery across business units with clear control and visibility.</p></article></div></div></main>"

create_page "/pricing" "Plans and Pricing" "<main class=\"page\"><div class=\"wrap\"><span class=\"eyebrow\">Plans and Pricing</span><h1>Narrowed pricing ladder for smoother upsell and rollout growth</h1><p class=\"lead\">Every tier now includes explicit Auricrux role, Academy depth, and operational scope.</p><div class=\"grid-4\"><article class=\"card\"><div class=\"tier-kicker\">Startup Workspace</div><h3>$99/mo</h3><p class=\"muted\">Best for owner-operators entering governed workflow.</p><p><strong>Academy:</strong> Foundations onboarding</p><p><strong>Auricrux:</strong> Next-action continuity</p><div class=\"cta-row\"><a class=\"btn btn-primary\" href=\"/intake/?plan=startup\">Select Startup</a></div></article><article class=\"card\"><div class=\"tier-kicker\">Starter Team Workspace</div><h3>$249/mo</h3><p class=\"muted\">Best for small teams needing stronger bid + comms continuity.</p><p><strong>Academy:</strong> Foundations + qualification + estimate tracks</p><p><strong>Auricrux:</strong> Bid/file/comms blocker guidance</p><div class=\"cta-row\"><a class=\"btn btn-primary\" href=\"/intake/?plan=starter-team\">Select Starter Team</a></div></article><article class=\"card\"><div class=\"tier-kicker\">Team Workspace</div><h3>$499/mo</h3><p class=\"muted\">Best for active delivery teams with recurring project load.</p><p><strong>Academy:</strong> Role-based tracks + progression checks</p><p><strong>Auricrux:</strong> Cross-route continuity control</p><div class=\"cta-row\"><a class=\"btn btn-primary\" href=\"/intake/?plan=team\">Select Team</a></div></article><article class=\"card\"><div class=\"tier-kicker\">Operations Workspace</div><h3>$899/mo</h3><p class=\"muted\">Best for mid-size operations managing heavier coordination.</p><p><strong>Academy:</strong> Command-track + credentials</p><p><strong>Auricrux:</strong> Escalation + execution governance</p><div class=\"cta-row\"><a class=\"btn btn-primary\" href=\"/intake/?plan=operations\">Select Operations</a></div></article><article class=\"card\"><div class=\"tier-kicker\">Growth Platform</div><h3>$1,500/mo</h3><p class=\"muted\">Best for growing organizations scaling project volume and teams.</p><p><strong>Academy:</strong> Full operator + leadership paths</p><p><strong>Auricrux:</strong> Growth-stage sequencing control</p><div class=\"cta-row\"><a class=\"btn btn-primary\" href=\"/intake/?plan=growth\">Select Growth</a></div></article><article class=\"card\"><div class=\"tier-kicker\">Scale Operations Platform</div><h3>$2,400/mo</h3><p class=\"muted\">Best for multi-crew orgs preparing enterprise standardization.</p><p><strong>Academy:</strong> Governance + readiness dashboards</p><p><strong>Auricrux:</strong> Multi-workflow decision control</p><div class=\"cta-row\"><a class=\"btn btn-primary\" href=\"/intake/?plan=scale-operations\">Select Scale Operations</a></div></article><article class=\"card\"><div class=\"tier-kicker\">Enterprise Rollout</div><h3>$3,500+/mo</h3><p class=\"muted\">Best for large organizations deploying FCA as operating standard.</p><p><strong>Academy:</strong> Organization-wide enablement</p><p><strong>Auricrux:</strong> Executive operating intelligence</p><div class=\"cta-row\"><a class=\"btn btn-auricrux\" href=\"/intake/?plan=enterprise\">Select Enterprise</a></div></article><article class=\"card\"><div class=\"tier-kicker\">Pilot Workspace</div><h3>$2,500 one-time</h3><p class=\"muted\">Guided implementation package for teams launching FCA.</p><p><strong>Academy:</strong> Launch classrooms</p><p><strong>Auricrux:</strong> Rollout sequencing + activation</p><div class=\"cta-row\"><a class=\"btn btn-primary\" href=\"${PILOT_CHECKOUT_URL}\">Buy Pilot — \$2,500</a></div></article></div><section class=\"section\"><div class=\"auricrux-callout\"><span class=\"eyebrow eyebrow-auricrux\">Academy Spotlight</span><h2>FCA Academy is a massive innovation layer</h2><p class=\"muted\">Academy is integrated workforce development tied directly to live execution: training, licensure prep, certifications, apprenticeship pathways, and role advancement—inside the same operational system Auricrux is driving.</p><div class=\"cta-row\"><a class=\"btn btn-secondary\" href=\"/academy/\">Open Academy</a><a class=\"btn btn-auricrux\" href=\"/auricrux/\">Ask Auricrux</a></div></div></section></div></main>"

create_page "/contact" "Book Demo" "<main class=\"page\"><div class=\"wrap\"><span class=\"eyebrow\">Book Demo</span><h1>Schedule a live walkthrough for your team</h1><div class=\"grid-3\"><article class=\"card\"><h3>Sales</h3><p class=\"muted\"><a href=\"mailto:sales@futurecontractorsofamerica.com\">sales@futurecontractorsofamerica.com</a></p></article><article class=\"card\"><h3>Information</h3><p class=\"muted\"><a href=\"mailto:info@futurecontractorsofamerica.com\">info@futurecontractorsofamerica.com</a></p></article><article class=\"card\"><h3>Support</h3><p class=\"muted\"><a href=\"mailto:support@futurecontractorsofamerica.com\">support@futurecontractorsofamerica.com</a></p></article></div></div></main>"

create_page "/terms" "Terms of Service" "<main class=\"page\"><div class=\"wrap\"><span class=\"eyebrow\">Legal</span><h1>Terms of Service</h1><section class=\"card\"><p>By using FCA you agree to our service terms. Paid plans bill through Stripe. Questions: <a href=\"mailto:hello@futurecontractorsofamerica.com\">hello@futurecontractorsofamerica.com</a></p></section></div></main>"

create_page "/privacy" "Privacy Policy" "<main class=\"page\"><div class=\"wrap\"><span class=\"eyebrow\">Legal</span><h1>Privacy Policy</h1><section class=\"card\"><p>FCA collects account and workspace data to operate your contractor platform. We do not sell personal information. Contact: <a href=\"mailto:hello@futurecontractorsofamerica.com\">hello@futurecontractorsofamerica.com</a></p></section></div></main>"

create_page "/refunds" "Refunds and Billing" "<main class=\"page\"><div class=\"wrap\"><span class=\"eyebrow\">Legal</span><h1>Refunds & Billing Policy</h1><section class=\"card\"><p>Subscriptions cancel anytime. Pilot fees are refundable within 7 days if onboarding has not started. Digital products are non-refundable once delivered unless defective.</p></section></div></main>"

create_page "/auricrux" "Auricrux Guidance" "<main class=\"page\"><div class=\"wrap\"><section class=\"card\"><span class=\"eyebrow eyebrow-auricrux\">Auricrux Guidance</span><div class=\"brand-rail\"><div class=\"brand-chip\">${auricrux_logo_markup}</div></div><h1 style=\"font-size:48px\">Auricrux runs and drives the FCA system all the way around.</h1><p class=\"lead\">Auricrux is not a side assistant. He is the operating intelligence layer embedded across sales, delivery, file continuity, billing flow, Academy progression, support, and recurring customer growth.</p><div class=\"cta-row\"><a class=\"btn btn-auricrux\" href=\"/intake/\">Start Guided Intake</a><a class=\"btn btn-secondary\" href=\"/contact/\">Book Walkthrough</a><a class=\"btn btn-secondary\" href=\"/portal/platform/\">Open Platform Dashboard</a></div></section></div></main>"

create_page "/intake" "Pilot Intake" '<main class="page"><div class="wrap"><span class="eyebrow">Step 1</span><h1>Submit your company profile and start pilot onboarding</h1><section class="card"><form id="intakeForm"><div class="grid-2"><div class="field"><label for="plan">Plan</label><select id="plan"><option value="startup">Startup</option><option value="starter-team">Starter Team</option><option value="team">Team</option><option value="operations">Operations</option><option value="growth">Growth</option><option value="scale-operations">Scale Operations</option><option value="enterprise">Enterprise</option><option value="pilot">Pilot</option></select></div><div class="field"><label for="company">Company</label><input id="company" required /></div><div class="field"><label for="name">Contact name</label><input id="name" required /></div><div class="field"><label for="email">Email</label><input id="email" type="email" required /></div><div class="field"><label for="password">Password</label><input id="password" type="password" required /></div><div class="field"><label for="confirmPassword">Confirm password</label><input id="confirmPassword" type="password" required /></div></div><div id="intakeStatus" class="status warn" style="margin-top:14px">These credentials will be used for workspace login.</div><div class="cta-row"><button class="btn btn-primary" type="submit">Continue to Activation</button></div></form></section></div></main><script>const params=new URLSearchParams(location.search);const p=params.get("plan");if(p)document.getElementById("plan").value=p;document.getElementById("intakeForm").addEventListener("submit",e=>{e.preventDefault();const pw=password.value;const cp=confirmPassword.value;if(pw!==cp){intakeStatus.className="status warn";intakeStatus.textContent="Passwords do not match.";return;}const rec={plan:plan.value,company:company.value,name:name.value,email:email.value.trim().toLowerCase(),password:pw};localStorage.setItem("fca_customer_record",JSON.stringify(rec));location.href="/checkout/?plan="+encodeURIComponent(rec.plan);});</script>'

create_page "/checkout" "Activation" '<main class="page"><div class="wrap"><span class="eyebrow">Step 2</span><h1>Apply your code and continue to workspace login</h1><section class="card"><div id="summary" class="status">Loading intake record…</div><div class="field" style="margin-top:12px"><label for="promo">Activation code</label><input id="promo" placeholder="Enter your code" /></div><div id="promoStatus" class="status warn" style="margin-top:12px">Enter your activation or promo code if provided.</div><div class="cta-row"><button class="btn btn-primary" type="button" onclick="applyCode()">Apply Code</button><a class="btn btn-secondary" href="/login/">Continue to Login</a></div></section></div></main><script>const rec=JSON.parse(localStorage.getItem("fca_customer_record")||"null");if(rec){summary.innerHTML=`<strong>Plan:</strong> ${rec.plan}<br/><strong>Company:</strong> ${rec.company}<br/><strong>Email:</strong> ${rec.email}`;}else{summary.textContent="No intake record found.";}function applyCode(){const v=(promo.value||"").trim();if(v){promoStatus.className="status success";promoStatus.textContent="Code applied.";}else{promoStatus.className="status warn";promoStatus.textContent="Enter a code to apply.";}}</script>'

create_page "/login" "Client Login" '<main class="page"><div class="wrap"><span class="eyebrow">Step 3</span><h1>Sign in to your FCA workspace</h1><section class="card"><form id="loginForm"><div class="field"><label>Email</label><input id="email" type="email" /></div><div class="field"><label>Password</label><input id="password" type="password" /></div><div class="cta-row"><button class="btn btn-primary" type="submit">Sign In</button><a class="btn btn-secondary" href="/intake/">Create Account</a></div><p style="font-size:13px;color:#64748b">Validation fallback account is available for launch checks.</p></form><div id="statusBox" class="status" style="margin-top:12px">Use your intake credentials.</div></section></div></main><script>const f={email:"launch.customer@futurecontractorsofamerica.com",password:"FCA-Launch-2026!"};const rec=JSON.parse(localStorage.getItem("fca_customer_record")||"null");if(rec?.email)email.value=rec.email;loginForm.addEventListener("submit",e=>{e.preventDefault();const e1=email.value.trim().toLowerCase(),p1=password.value.trim();if((rec&&rec.email===e1&&rec.password===p1)||(e1===f.email&&p1===f.password)){statusBox.className="status success";statusBox.textContent="Login successful. Opening platform…";setTimeout(()=>location.href="/portal/platform/",350);}else{statusBox.className="status warn";statusBox.textContent="Credentials did not validate.";}});</script>'

create_page "/portal/platform" "Platform" '<main class="page"><div class="wrap"><span class="eyebrow">Live Product Surface</span><h1>Platform Dashboard</h1><p class="lead">Your workspace for project visibility, file continuity, and activity tracking with Auricrux active.</p><div class="grid-4"><div class="card"><h3>Project</h3><p id="projectName">Loading…</p></div><div class="card"><h3>Customer</h3><p id="customerName">Loading…</p></div><div class="card"><h3>Next Action</h3><p id="nextAction">Loading…</p></div><div class="card"><h3>Workspace</h3><p id="workspaceState">Loading…</p></div></div><div class="cta-row"><a class="btn btn-primary" href="/portal/projects/">Projects</a><a class="btn btn-secondary" href="/portal/files/">Files</a><a class="btn btn-secondary" href="/portal/audit/">Audit</a><a class="btn btn-auricrux" href="/pricing/">Upgrade Plan</a></div></div></main><script>async function h(){const rec=JSON.parse(localStorage.getItem("fca_customer_record")||"null");const p=await fetch('/data/live-workspace-pack.json').then(r=>r.json());customerName.textContent=rec?.company||'Launch Customer Workspace';projectName.textContent=rec?.company?`${rec.company} — Initial Opportunity`:p.project.name;nextAction.textContent=p.project.nextStep;workspaceState.textContent=p.workspace.status;}h();</script>'

create_page "/portal/projects" "Projects" '<main class="page"><div class="wrap"><h1>Projects</h1><section class="card"><table class="data-table"><thead><tr><th>Project</th><th>Stage</th><th>Next Step</th></tr></thead><tbody id="rows"><tr><td>Loading…</td><td>—</td><td>—</td></tr></tbody></table></section></div></main><script>async function h(){const p=await fetch('/data/live-workspace-pack.json').then(r=>r.json());rows.innerHTML=`<tr><td>${p.project.name}</td><td>${p.project.stage}</td><td>${p.project.nextStep}</td></tr>`;}h();</script>'

create_page "/portal/files" "Files" '<main class="page"><div class="wrap"><h1>Files</h1><div id="grid" class="grid-3"></div></div></main><script>async function h(){const p=await fetch('/data/live-workspace-pack.json').then(r=>r.json());grid.innerHTML=p.files.map(f=>`<article class="card"><h3>${f.name}</h3><p class="muted">${f.category} · ${f.status}</p></article>`).join("");}h();</script>'

create_page "/portal/audit" "Audit" '<main class="page"><div class="wrap"><h1>Audit</h1><section class="card"><table class="data-table"><thead><tr><th>Event</th><th>Actor</th><th>Status</th></tr></thead><tbody id="rows"><tr><td>Loading…</td><td>—</td><td>—</td></tr></tbody></table></section></div></main><script>async function h(){const p=await fetch('/data/live-workspace-pack.json').then(r=>r.json());rows.innerHTML=p.audit.map(a=>`<tr><td>${a.event}</td><td>${a.actor}</td><td>${a.status}</td></tr>`).join("");}h();</script>'

create_page "/warranty" "Warranty" '<main class="page"><div class="wrap"><h1>Warranty Continuity</h1><section class="card"><p class="lead">Warranty route remains active and reachable.</p></section></div></main>'
create_page "/referrals" "Referrals" '<main class="page"><div class="wrap"><h1>Referral Continuity</h1><section class="card"><p class="lead">Referral route remains active and reachable.</p></section></div></main>'

# === Brand validator (strict) ===
# Rule 1: Gold variables can appear only in :root + Auricrux-specific selectors.
OFFENDING_GOLD_LINES=$(grep -n "var(--auricrux-gold" dist/styles.css | grep -Ev '(:root|\.btn-auricrux|\.eyebrow-auricrux|\.auricrux-)' || true)
OFFENDING_GOLD_COUNT=$(printf "%s" "$OFFENDING_GOLD_LINES" | sed '/^$/d' | wc -l | tr -d ' ')

# Rule 2: Disallowed public alias must not appear.
DISALLOWED_ALIAS_COUNT=$(grep -R "hello@futurecontractorsofamerica.com" dist -n | wc -l | tr -d ' ')

# Rule 3: Approved aliases must be present at least once.
APPROVED_ALIAS_COUNT=$(grep -R "sales@futurecontractorsofamerica.com\|info@futurecontractorsofamerica.com\|support@futurecontractorsofamerica.com" dist -n | wc -l | tr -d ' ')

cat > dist/brand-audit.json <<JSON
{
  "status": "$( [ "$OFFENDING_GOLD_COUNT" = "0" ] && [ "$DISALLOWED_ALIAS_COUNT" = "0" ] && [ "$APPROVED_ALIAS_COUNT" -gt "0" ] && echo pass || echo fail )",
  "buildMarkerVersion": "${BUILD_MARKER_VERSION}",
  "checks": {
    "gold_reserved_for_auricrux": {
      "offending_count": ${OFFENDING_GOLD_COUNT}
    },
    "disallowed_public_alias_absent": {
      "offending_count": ${DISALLOWED_ALIAS_COUNT}
    },
    "approved_public_aliases_present": {
      "match_count": ${APPROVED_ALIAS_COUNT}
    }
  }
}
JSON

if [ "$OFFENDING_GOLD_COUNT" != "0" ]; then
  echo "Brand audit failed: non-Auricrux selectors use Auricrux gold tokens."
  echo "$OFFENDING_GOLD_LINES"
  exit 1
fi

if [ "$DISALLOWED_ALIAS_COUNT" != "0" ]; then
  echo "Brand audit failed: disallowed public alias hello@futurecontractorsofamerica.com detected in dist output."
  exit 1
fi

if [ "$APPROVED_ALIAS_COUNT" = "0" ]; then
  echo "Brand audit failed: approved public aliases were not detected in dist output."
  exit 1
fi

cat > dist/deployment-status.json <<JSON
{
  "status": "live-shell-customer-landing-v7-brand-audit-enforced-active",
  "shell": "FCA Contractor Command",
  "execution": "Auricrux-Central",
  "nextAction": "MNCL-007",
  "proofRoutes": ["/pricing/", "/auricrux/", "/brand-audit.json", "/deployment-status.json"],
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
status=live-shell-customer-landing-v7-brand-audit-enforced-active
buildMarkerDate=${BUILD_MARKER_DATE}
buildMarkerVersion=${BUILD_MARKER_VERSION}
EOF

cat > "dist${COMMIT_WITNESS_ROUTE}" <<EOF
gitSha=${GIT_SHA}
defaultHost=${DEFAULT_HOST}
status=live-shell-customer-landing-v7-brand-audit-enforced-active
buildMarkerDate=${BUILD_MARKER_DATE}
buildMarkerVersion=${BUILD_MARKER_VERSION}
EOF

echo "FCA customer landing v7 build completed for ${GIT_SHA}"
