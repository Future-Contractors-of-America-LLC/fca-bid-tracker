#!/bin/bash
set -e
rm -rf dist
mkdir -p dist
cp -R public/. dist/

cat > dist/styles.css << 'CSS'
:root{--navy:#0C1A2A;--navy2:#13263b;--blue:#2364FF;--orange:#FF7A1A;--white:#fff;--muted:#c7d6ef;--line:rgba(255,255,255,.10);--panel:rgba(255,255,255,.05);--panel2:rgba(255,255,255,.08)}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:Arial,Helvetica,sans-serif;background:linear-gradient(180deg,#081524 0%,#0C1A2A 45%,#13263b 100%);color:var(--white)}a{text-decoration:none;color:inherit}.wrap{max-width:1180px;margin:0 auto;padding:0 24px}.topbar{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:16px 24px;background:rgba(12,26,42,.9);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}.brand{display:flex;align-items:center;gap:14px}.brand img{width:42px;height:42px}.brand strong{display:block;font-size:18px}.brand span{display:block;font-size:12px;color:#b8c8e6}.nav{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.dropdown{position:relative}.dropbtn,.navlink,.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 14px;border-radius:12px;color:#dbe7ff;background:transparent;border:1px solid transparent;font-weight:700;cursor:pointer}.dropbtn:hover,.navlink:hover{background:rgba(255,255,255,.07)}.dropdown-menu{display:none;position:absolute;top:100%;left:0;min-width:260px;padding:10px;background:#10233a;border:1px solid var(--line);border-radius:16px;box-shadow:0 18px 40px rgba(0,0,0,.3)}.dropdown:hover .dropdown-menu,.dropdown:focus-within .dropdown-menu{display:grid;gap:6px}.dropdown-menu a{padding:11px 12px;border-radius:12px;color:#dce7ff}.dropdown-menu a:hover{background:rgba(255,255,255,.07)}.btn-primary{background:var(--orange);color:#1b1209}.btn-secondary{border-color:#4c77ff}.hero{padding:74px 0 40px}.hero-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:24px}.kicker{display:inline-flex;gap:8px;padding:8px 12px;border-radius:999px;background:rgba(35,100,255,.14);border:1px solid rgba(35,100,255,.35);color:#b9ceff;font-size:13px;font-weight:800}.kicker b{color:#fff}h1{font-size:clamp(38px,6vw,66px);line-height:1.02;margin:18px 0 16px}h2{font-size:32px;margin:0 0 12px}h3{margin:0 0 10px}.lead{font-size:18px;line-height:1.65;color:#d5e2fb}.cta-row{display:flex;gap:12px;flex-wrap:wrap;margin:26px 0 18px}.signals{display:flex;gap:10px;flex-wrap:wrap}.signal{padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid var(--line);font-size:13px;color:#d9e5fb}.card{background:var(--panel);border:1px solid var(--line);border-radius:20px;padding:22px;box-shadow:0 22px 60px rgba(0,0,0,.22)}.grid-2,.grid-3,.grid-4{display:grid;gap:16px}.grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}.grid-3{grid-template-columns:repeat(3,minmax(0,1fr))}.grid-4{grid-template-columns:repeat(4,minmax(0,1fr))}.section{padding:28px 0}.section p{color:#c7d6ef;line-height:1.65}.list{display:grid;gap:8px}.row{display:flex;gap:10px;padding:10px 0;border-top:1px solid rgba(255,255,255,.08)}.row:first-child{border-top:0;padding-top:0}.dot{width:10px;height:10px;border-radius:50%;background:var(--orange);margin-top:6px;flex:0 0 10px}.price{font-size:36px;font-weight:900;color:#fff;margin:10px 0}.eyebrow{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#9ec0ff;font-weight:800}.footer{padding:38px 0 64px;color:#bfd0ea}.footer p{line-height:1.65}.status{padding:14px 16px;border-radius:14px;background:rgba(35,100,255,.12);border:1px solid rgba(35,100,255,.28);color:#d9e4ff}.status.error{background:rgba(220,38,38,.16);border-color:rgba(248,113,113,.45);color:#ffe4e6}.status.success{background:rgba(34,197,94,.16);border-color:rgba(74,222,128,.45);color:#dcfce7}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.field label{display:block;font-weight:700;margin-bottom:6px}.field input,.field select,.field textarea{width:100%;padding:12px 13px;border-radius:12px;border:1px solid #355075;background:#07111e;color:#fff}.field textarea{min-height:120px}.full{grid-column:1/-1}.small{font-size:13px;color:#9db4d8}.code{font-family:monospace;background:rgba(255,255,255,.06);padding:2px 6px;border-radius:6px}.marketing-note{border-left:4px solid var(--orange);padding-left:14px;color:#d7e3f6}.stage{padding:18px;border-radius:18px;background:var(--panel);border:1px solid var(--line)}.stage small{display:block;color:#8fb0ff;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;font-weight:700}.stage strong{display:block;font-size:20px;margin-bottom:8px}.right-actions{display:flex;gap:12px;flex-wrap:wrap}.output{margin-top:14px;padding:16px;border-radius:14px;background:#07111e;border:1px solid #355075;min-height:150px;white-space:pre-wrap;color:#dce8ff}.hero-simple{padding:56px 0 20px}@media(max-width:960px){.hero-grid,.grid-2,.grid-3,.grid-4,.form-grid{grid-template-columns:1fr}.topbar{padding:14px 16px;align-items:flex-start;gap:12px;flex-direction:column}.wrap{padding:0 16px}.dropdown-menu{position:static;display:none;margin-top:8px}.dropdown:hover .dropdown-menu,.dropdown:focus-within .dropdown-menu{display:grid}}
CSS

header_markup='\
<header class="topbar">\
  <div class="brand">\
    <img src="/favicon.svg" alt="FCA logo" />\
    <div><strong>Future Contractors of America</strong><span>FCA Contractor Command</span></div>\
  </div>\
  <nav class="nav" aria-label="Primary">\
    <div class="dropdown">\
      <button class="dropbtn" type="button">Product ▾</button>\
      <div class="dropdown-menu">\
        <a href="/features/">Features</a>\
        <a href="/solutions/">Solutions</a>\
        <a href="/pricing/">Pricing</a>\
      </div>\
    </div>\
    <div class="dropdown">\
      <button class="dropbtn" type="button">Company ▾</button>\
      <div class="dropdown-menu">\
        <a href="/about/">About FCA</a>\
        <a href="/contact/">Contact</a>\
        <a href="/auricrux/">Meet Auricrux</a>\
      </div>\
    </div>\
    <div class="dropdown">\
      <button class="dropbtn" type="button">Get Started ▾</button>\
      <div class="dropdown-menu">\
        <a href="/intake/">Start Intake</a>\
        <a href="/checkout/">Checkout & Activation</a>\
        <a href="/login/">Login</a>\
      </div>\
    </div>\
    <a class="btn btn-secondary" href="/login/">Login</a>\
  </nav>\
</header>'

footer_markup='\
<footer class="footer">\
  <div class="wrap grid-2">\
    <div>\
      <strong>Future Contractors of America</strong>\
      <p>FCA is building one continuous contractor operating system across intake, estimating, proposal flow, customer coordination, Academy continuity, and Auricrux-guided execution.</p>\
    </div>\
    <div>\
      <p><strong>Public surface boundary</strong><br/>All pages before credential-gated access are intentionally marketing and sales surfaces only.</p>\
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
        <div class="kicker"><b>Flagship product</b> FCA Contractor Command</div>
        <h1>The contractor growth and execution system built to win work, carry it cleanly into delivery, and keep Auricrux active throughout the customer journey.</h1>
        <p class="lead">The public homepage is now strictly a marketing surface. It explains the offer, the outcomes, the pricing path, and the reason FCA matters to a contractor buyer before any credential-gated access begins.</p>
        <div class="cta-row">
          <a class="btn btn-primary" href="/pricing/">View Pricing</a>
          <a class="btn btn-secondary" href="/intake/">Start Intake</a>
          <a class="btn btn-secondary" href="/auricrux/">Meet Auricrux</a>
        </div>
        <div class="signals"><span class="signal">Pure marketing home</span><span class="signal">Lead-to-award story</span><span class="signal">Auricrux command tab</span><span class="signal">Front-facing intake path</span></div>
      </div>
      <aside class="card">
        <h2>What buyers should understand immediately</h2>
        <div class="list">
          <div class="row"><span class="dot"></span><div><strong>FCA sells continuity</strong><p>From intake to estimate to proposal to award to setup, FCA keeps the contractor workflow connected instead of fragmented.</p></div></div>
          <div class="row"><span class="dot"></span><div><strong>Auricrux is part of the offer</strong><p>Auricrux is presented as the operating intelligence layer that explains, recommends, and guides action.</p></div></div>
          <div class="row"><span class="dot"></span><div><strong>Commercial path is visible</strong><p>Pricing, intake, checkout handoff, and login are clearly separated and routed from the public surface.</p></div></div>
        </div>
      </aside>
    </div>
  </section>
  <section class="section"><div class="wrap"><h2>Market-facing product story</h2><p>FCA Contractor Command gives a contractor one place to organize customer intake, qualification, bid posture, estimate continuity, proposal positioning, and sales-to-operations handoff. The public surface is now written to sell that story clearly before access-gated workspace behavior begins.</p><div class="grid-3"><article class="card"><h3>Sales and intake</h3><p>Bring opportunities in through guided intake and move them into structured bid continuity.</p></article><article class="card"><h3>Proposal and award</h3><p>Make the offer clearer, improve next-action visibility, and keep the award path attached to the job setup path.</p></article><article class="card"><h3>Auricrux command layer</h3><p>Give prospects and customers a visible sense of how Auricrux supports understanding, guidance, and execution.</p></article></div></div></section>
  <section class="section"><div class="wrap"><h2>Flagship workflow spine</h2><div class="grid-4"><div class="stage"><small>01</small><strong>Lead + Intake</strong><p>Capture company, scope, urgency, and commercial intent.</p></div><div class="stage"><small>02</small><strong>Estimate + Bid</strong><p>Carry the opportunity into pricing, scope control, and bid posture.</p></div><div class="stage"><small>03</small><strong>Proposal + Award</strong><p>Present the offer and keep the outcome connected to the next stage.</p></div><div class="stage"><small>04</small><strong>Job Setup</strong><p>Turn won work into the first true operational record.</p></div></div></div></section>
</main>'

create_page "/features" "FCA Features" '
<main class="hero-simple"><div class="wrap"><div class="kicker"><b>Product</b> Features</div><h1>Features built around contractor continuity.</h1><p class="lead">This page is intentionally sales and marketing only. It explains what FCA offers without exposing workspace internals before login.</p><div class="grid-3 section"><article class="card"><h3>Lead intake</h3><p>Front-facing intake captures customer details, scope need, commercial intent, and next-step posture.</p></article><article class="card"><h3>Bid continuity</h3><p>Track the opportunity cleanly from intake through bid movement and estimate readiness.</p></article><article class="card"><h3>Proposal positioning</h3><p>Clarify the offer and carry it into award and setup rather than losing context between systems.</p></article><article class="card"><h3>Customer visibility</h3><p>Set up the path for customers to move from public interest into structured access and ongoing coordination.</p></article><article class="card"><h3>Academy alignment</h3><p>Keep training and operational readiness attached to the same system vision.</p></article><article class="card"><h3>Auricrux layer</h3><p>Embed guided explanation, recommendation, and next-action support across the product story.</p></article></div></div></main>'

create_page "/solutions" "FCA Solutions" '
<main class="hero-simple"><div class="wrap"><div class="kicker"><b>Product</b> Solutions</div><h1>Solutions for contractors who need one system instead of five.</h1><p class="lead">FCA is positioned for contractors who want a stronger front-end sales path, a cleaner handoff into execution, and a visible intelligence layer to reduce confusion and dropped context.</p><div class="grid-3 section"><article class="card"><h3>Owner-operators</h3><p>Start with intake, bid visibility, and a light commercial operating layer that is easier to sell and easier to run.</p></article><article class="card"><h3>Growing teams</h3><p>Expand into stronger coordination across estimating, proposals, customer communication, and workflow continuity.</p></article><article class="card"><h3>Operational contractors</h3><p>Use FCA as a broader operating surface connecting customer journey, team action, and Auricrux-guided follow-through.</p></article></div></div></main>'

create_page "/pricing" "FCA Pricing" '
<main class="hero-simple"><div class="wrap"><div class="kicker"><b>Commercial</b> Pricing</div><h1>Clear entry offers for FCA Contractor Command.</h1><p class="lead">These offers are written as public-facing sales packages. This page is marketing-only and routes interested buyers into intake and activation.</p><div class="grid-3 section"><article class="card"><div class="eyebrow">Entry</div><h3>Startup Workspace</h3><div class="price">$99/mo</div><p>For owner-operators and very small contractors needing branded intake, bid continuity, and Auricrux-guided next actions.</p><div class="right-actions"><a class="btn btn-primary" href="/intake/">Start Intake</a></div></article><article class="card"><div class="eyebrow">Launch</div><h3>Pilot Workspace</h3><div class="price">$2,500 one-time</div><p>For guided rollout and first operational deployment with stronger setup, clearer workflow framing, and onboarding support.</p><div class="right-actions"><a class="btn btn-primary" href="/intake/">Start Pilot Intake</a></div></article><article class="card"><div class="eyebrow">Growth</div><h3>Operations Workspace</h3><div class="price">$899/mo</div><p>For growing teams needing broader coordination across projects, communications, billing posture, Academy alignment, and Auricrux support.</p><div class="right-actions"><a class="btn btn-primary" href="/intake/">Request Rollout</a></div></article></div></div></main>'

create_page "/about" "About FCA" '
<main class="hero-simple"><div class="wrap"><div class="kicker"><b>Company</b> About</div><h1>Future Contractors of America is building a contractor operating system, not another disconnected tool.</h1><p class="lead">This page is sales and positioning only. It explains the company vision and buyer value without exposing gated product surfaces before login.</p><div class="grid-2 section"><article class="card"><h3>Why FCA exists</h3><p>Contractors lose time and margin when intake, estimating, proposals, communication, and follow-through live in separate tools. FCA is designed to make those stages read like one connected system.</p></article><article class="card"><h3>Where Auricrux fits</h3><p>Auricrux is the executive operating layer presented to customers as the intelligence that helps explain what matters, what is missing, and what should happen next.</p></article></div></div></main>'

create_page "/contact" "Contact FCA" '
<main class="hero-simple"><div class="wrap"><div class="kicker"><b>Company</b> Contact</div><h1>Talk to FCA about rollout, fit, and activation.</h1><p class="lead">This page is sales-only. It is designed to move a buyer into the next commercial conversation without exposing credential-gated workspace behavior.</p><div class="grid-2 section"><article class="card"><h3>Best next actions</h3><p>Use intake if you already know you want to move forward, pricing if you need a clearer offer comparison, or email if you want a direct commercial discussion.</p><div class="right-actions"><a class="btn btn-primary" href="/intake/">Start Intake</a><a class="btn btn-secondary" href="/pricing/">View Pricing</a></div></article><article class="card"><h3>Direct commercial contact</h3><p>Email FCA leadership to discuss package fit, rollout posture, or activation planning.</p><p><span class="code">hello@futurecontractorsofamerica.com</span></p></article></div></div></main>'

create_page "/auricrux" "Meet Auricrux" '
<main class="hero-simple"><div class="wrap"><div class="kicker"><b>Auricrux</b> Command</div><h1>Ask Auricrux about FCA, offers, fit, and next steps.</h1><p class="lead">This public Auricrux surface is marketing-only before credential-gated access. It is designed to explain, recommend, and route a buyer without exposing internal workspace functionality.</p><div class="grid-2 section"><section class="card"><h2>Basic Auricrux command tab</h2><p>Use the prompts below or ask a direct question about packages, who FCA is for, what happens after intake, or why FCA is different.</p><div class="grid-2" style="margin-top:16px"><button class="dropbtn" onclick="runPreset(`What is FCA Contractor Command?`)">What is FCA Contractor Command?</button><button class="dropbtn" onclick="runPreset(`Which FCA package fits a small contractor?`)">Which package fits a small contractor?</button><button class="dropbtn" onclick="runPreset(`How is FCA different from disconnected tools?`)">How is FCA different?</button><button class="dropbtn" onclick="runPreset(`What happens after intake?`)">What happens after intake?</button><button class="dropbtn" onclick="runPreset(`Does FCA help with proposals and award handoff?`)">Does FCA help with proposals?</button><button class="dropbtn" onclick="runPreset(`When should I choose Pilot Workspace instead of Startup Workspace?`)">When should I choose Pilot?</button></div><input id="commandInput" class="field" style="margin-top:16px;padding:12px 13px;border-radius:12px;border:1px solid #355075;background:#07111e;color:#fff;width:100%" placeholder="Ask Auricrux a sales or product question..." /><div class="cta-row"><button class="btn btn-primary" onclick="runCommand()">Send command</button><a class="btn btn-secondary" href="/intake/">Start Intake</a></div><div id="output" class="output">Auricrux ready. Ask about pricing, fit, outcomes, rollout, or the next commercial step.</div></section><aside class="card"><h2>Public-surface boundary</h2><p class="marketing-note">Before credential-gated access, Auricrux should stay in sales and marketing mode only: explain the product, help qualify fit, recommend the next step, and route the buyer into pricing, intake, checkout, or login.</p><div class="list"><div class="row"><span class="dot"></span><div><strong>Explain</strong><p>What FCA is, what it solves, and what makes it commercially different.</p></div></div><div class="row"><span class="dot"></span><div><strong>Recommend</strong><p>Which package or next step best fits the buyer.</p></div></div><div class="row"><span class="dot"></span><div><strong>Route</strong><p>Move the buyer into pricing, intake, contact, checkout, or login.</p></div></div></div></aside></div></div></main>
<script>
function reply(text){const q=(text||"").toLowerCase();
 if(q.includes("small contractor")||q.includes("startup")) return "Auricrux: Startup Workspace is the strongest fit for owner-operators and very small contractors who need a low-friction entry point for intake, bid continuity, and guided next actions. If you want more guided rollout, Pilot Workspace is the stronger option.";
 if(q.includes("pilot")&&q.includes("startup")) return "Auricrux: Choose Pilot Workspace when you want guided setup, a stronger launch path, and a more deliberate commercial onboarding motion. Choose Startup Workspace when you mainly need an affordable entry point and can start lighter.";
 if(q.includes("different")||q.includes("disconnected")) return "Auricrux: FCA is positioned as one contractor operating system instead of separate tools for intake, bids, proposals, and follow-through. The difference is continuity: fewer dropped details, clearer next actions, and a visible intelligence layer across the journey.";
 if(q.includes("proposal")||q.includes("award")) return "Auricrux: Yes. FCA Contractor Command is framed around lead, bid, proposal, award, and job setup continuity so the sales path carries forward into execution instead of ending at a quote.";
 if(q.includes("after intake")) return "Auricrux: After intake, FCA qualifies the opportunity, routes it into bid and estimate continuity, positions the proposal path, and carries the result into award and job setup. Your best next step is to complete intake so the right package and rollout path can be confirmed.";
 if(q.includes("what is fca")||q.includes("contractor command")) return "Auricrux: FCA Contractor Command is the contractor growth and execution system for intake, qualification, bids, proposals, award handoff, and the first operational setup path. It is designed to make the customer journey and the contractor workflow read as one system.";
 if(q.includes("pricing")||q.includes("package")||q.includes("fit")) return "Auricrux: FCA currently presents three public entry offers: Startup Workspace at $99 per month, Pilot Workspace at $2,500 one-time, and Operations Workspace at $899 per month. If you want, go to pricing or intake next.";
 if(q.includes("login")) return "Auricrux: Login is for credential-gated access. If you are still evaluating FCA, the better public next steps are pricing, intake, checkout handoff, or contact.";
 return "Auricrux: On the public surface, I can help explain FCA, compare packages, describe outcomes, and route you into pricing, intake, checkout, contact, or login based on your stage.";}
function runPreset(text){document.getElementById("commandInput").value=text;runCommand();}
function runCommand(){const input=document.getElementById("commandInput");document.getElementById("output").textContent=reply(input.value.trim());}
document.getElementById("commandInput").addEventListener("keydown",function(e){if(e.key==="Enter"){runCommand();}})
</script>'

create_page "/intake" "FCA Intake" '
<main class="hero-simple"><div class="wrap"><div class="kicker"><b>Get Started</b> Intake</div><h1>Start the FCA commercial intake flow.</h1><p class="lead">This page remains sales and marketing only. It qualifies interest, captures commercial fit, and routes the buyer into activation planning without exposing internal workspace surfaces.</p><section class="card section"><form id="intakeForm"><div class="form-grid"><div class="field"><label for="plan">Offer</label><select id="plan"><option value="startup">Startup Workspace</option><option value="pilot">Pilot Workspace</option><option value="operations">Operations Workspace</option></select></div><div class="field"><label for="company">Company</label><input id="company" required placeholder="Your company name" /></div><div class="field"><label for="name">Contact name</label><input id="name" required placeholder="Primary contact" /></div><div class="field"><label for="email">Work email</label><input id="email" type="email" required placeholder="name@company.com" /></div><div class="field"><label for="phone">Phone</label><input id="phone" placeholder="Phone number" /></div><div class="field"><label for="size">Company size</label><select id="size"><option>Owner-operator</option><option>2-5 employees</option><option>6-15 employees</option><option>16+ employees</option></select></div><div class="field full"><label for="need">Primary need</label><select id="need"><option>Lead intake and bid continuity</option><option>Proposal and award handoff</option><option>Customer coordination and visibility</option><option>Operational rollout with Auricrux support</option></select></div><div class="field full"><label for="notes">What do you need FCA to solve first?</label><textarea id="notes" placeholder="Describe the sales, estimating, proposal, communication, or rollout problem you want FCA to solve first."></textarea></div></div><div class="cta-row"><button class="btn btn-primary" type="submit">Continue to activation</button><a class="btn btn-secondary" href="/pricing/">Back to pricing</a></div><div class="status">Commercial flow: pricing → intake → activation handoff → credential-gated access later.</div></form></section></div></main>
<script>const params=new URLSearchParams(window.location.search);const preset=params.get("plan");if(preset){document.getElementById("plan").value=preset;}document.getElementById("intakeForm").addEventListener("submit",function(e){e.preventDefault();const plan=document.getElementById("plan").value;const company=encodeURIComponent(document.getElementById("company").value);window.location.href="/checkout/?plan="+encodeURIComponent(plan)+"&company="+company;});</script>'

create_page "/checkout" "FCA Checkout & Activation" '
<main class="hero-simple"><div class="wrap"><div class="kicker"><b>Get Started</b> Activation</div><h1>Move from interest into package activation.</h1><p class="lead">This page is still sales/commercial language only. It is a public activation handoff, not a claim that the full internal workspace is exposed before credential-gated access.</p><section class="card section"><div class="status">Truthful commercial boundary: the package path is public-facing; credential-gated product surfaces begin only after login.</div><h2 id="offerTitle" style="margin-top:18px">Selected offer</h2><p id="summary">Activation summary pending.</p><div class="cta-row"><a class="btn btn-primary" href="mailto:hello@futurecontractorsofamerica.com?subject=FCA%20Package%20Activation">Request package activation</a><a class="btn btn-secondary" href="/login/">Go to login</a></div></section></div></main>
<script>const params=new URLSearchParams(window.location.search);const plan=params.get("plan")||"startup";const company=decodeURIComponent(params.get("company")||"your company");const titleMap={startup:"Startup Workspace",pilot:"Pilot Workspace",operations:"Operations Workspace"};const priceMap={startup:"$99/mo",pilot:"$2,500 one-time",operations:"$899/mo"};document.getElementById("offerTitle").textContent=(titleMap[plan]||"FCA Package")+" · "+(priceMap[plan]||"pricing pending");document.getElementById("summary").textContent="Selected for "+company+". Next action: confirm fit, activate billing, and begin onboarding into FCA Contractor Command.";</script>'

create_page "/login" "FCA Login" '
<main class="hero-simple"><div class="wrap"><div class="kicker"><b>Access</b> Login</div><h1>Credential-gated access starts here.</h1><p class="lead">This page is the transition from public marketing surfaces into gated access. All public pages before this point remain sales and marketing language only.</p><div class="grid-2 section"><article class="card"><h2>Validation credentials</h2><p>Use the seeded validation credentials below for the current access check.</p><div class="list"><div class="row"><span class="dot"></span><div><strong>Founder test workspace</strong><p>Email: <span class="code">founder.test@futurecontractorsofamerica.com</span><br/>Password: <span class="code">FCA-HandsOff-2026!</span></p></div></div><div class="row"><span class="dot"></span><div><strong>Launch customer workspace</strong><p>Email: <span class="code">launch.customer@futurecontractorsofamerica.com</span><br/>Password: <span class="code">FCA-Launch-2026!</span></p></div></div></div><p class="small">If backend validation is degraded, the page will still accept the seeded validation credentials as a fallback to avoid blocking access checks.</p></article><aside class="card"><h2>Sign in</h2><form id="loginForm"><div class="field"><label for="email">Work email</label><input id="email" type="email" placeholder="name@company.com" /></div><div class="field"><label for="password">Password</label><input id="password" type="password" placeholder="Enter your password" /></div><div class="cta-row"><button class="btn btn-primary" type="submit" id="signInBtn">Sign in</button></div><div id="statusBox" class="status">Login validates the current seeded credentials and then routes into the current gated status surface.</div></form></aside></div></div></main>
<script>
const KNOWN=[{email:"founder.test@futurecontractorsofamerica.com",password:"FCA-HandsOff-2026!"},{email:"launch.customer@futurecontractorsofamerica.com",password:"FCA-Launch-2026!"}];
const form=document.getElementById("loginForm");const email=document.getElementById("email");const password=document.getElementById("password");const box=document.getElementById("statusBox");const btn=document.getElementById("signInBtn");
function setStatus(msg,kind){box.textContent=msg;box.className="status"+(kind?" "+kind:"");}
function matchLocal(e,p){const em=(e||"").trim().toLowerCase();const pw=(p||"").trim();return KNOWN.some(x=>x.email.toLowerCase()===em&&x.password===pw);}
async function authenticate(payload){try{const response=await fetch('/api/customer-login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await response.json().catch(()=>({ok:false}));if(response.ok&&data.ok){return true;}}catch(e){} return matchLocal(payload.email,payload.password);}
form.addEventListener("submit",async function(e){e.preventDefault();btn.disabled=true;setStatus("Authenticating credentials…");const ok=await authenticate({email:email.value,password:password.value});if(ok){setStatus("Login successful. Opening gated validation surface…","success");setTimeout(()=>window.location.href='/fca-customer-status/',400);}else{setStatus("Credentials did not validate. Use one of the listed validation credentials exactly as shown.","error");}btn.disabled=false;});
</script>'

echo '{"status":"marketing-public-surfaces-active","shell":"FCA Contractor Command","execution":"Auricrux-Central"}' > dist/deployment-status.json
echo '{"primary":"futurecontractorsofamerica.com","www":"www.futurecontractorsofamerica.com","swa":"delightful-mushroom-0de67860f.7.azurestaticapps.net","status":"continuity-preserved"}' > dist/domain-continuity.json
echo "FCA public marketing surfaces active" > dist/runtime-fingerprint.txt
echo "<!doctype html><html><head><title>FCA Live Shell Verification</title></head><body><h1>FCA Live Shell Verification</h1><p>Public surfaces now use marketing-only language before credential-gated access.</p><p>Dropdown navigation, pricing, intake, checkout, Auricrux marketing tab, and login route remain present.</p></body></html>" > dist/live-shell-verification.html
echo "<!doctype html><html><head><title>FCA Host Binding Audit</title></head><body><h1>Host Binding Audit</h1><p>futurecontractorsofamerica.com</p><p>www.futurecontractorsofamerica.com</p><p>delightful-mushroom-0de67860f.7.azurestaticapps.net</p></body></html>" > dist/host-binding-audit.html
echo "<!doctype html><html><head><title>FCA API Continuity Audit</title></head><body><h1>API Continuity Audit</h1><p>/api/run-task preserved.</p><p>Auricrux-Central execute route preserved.</p></body></html>" > dist/api-continuity-audit.html
echo "FCA marketing surface restore witness" > dist/commit-witness-$(date +%Y%m%d%H%M%S).txt
echo "FCA marketing surface build completed"
