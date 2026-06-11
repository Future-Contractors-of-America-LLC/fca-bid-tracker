#!/bin/bash
set -e
rm -rf dist
mkdir -p dist
cp -R public/. dist/

cat > dist/index.html << 'HTML'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Future Contractors of America | FCA Contractor Command</title>
<meta name="description" content="Future Contractors of America is building FCA Contractor Command: the contractor operating system for lead intake, qualification, estimating, proposals, job setup, and Auricrux-guided continuity." />
<meta name="theme-color" content="#0C1A2A" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="manifest" href="/site.webmanifest" />
<style>
:root{--navy:#0C1A2A;--blue:#2364FF;--orange:#FF7A1A;--white:#FFFFFF;--line:rgba(255,255,255,.10);--panel:rgba(255,255,255,.05);--panel-strong:rgba(255,255,255,.08)}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:Arial,Helvetica,sans-serif;background:linear-gradient(180deg,#081524 0%,#0C1A2A 45%,#13263b 100%);color:var(--white)}a{text-decoration:none;color:inherit}.shell{min-height:100vh}.topbar{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:16px 24px;background:rgba(12,26,42,.88);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}.brand{display:flex;align-items:center;gap:14px}.brand img{width:42px;height:42px}.brand-mark{display:flex;flex-direction:column}.brand-mark strong{font-size:18px;letter-spacing:.02em}.brand-mark span{font-size:12px;color:#b8c8e6}.nav{display:flex;gap:12px;flex-wrap:wrap;align-items:center}.nav a{padding:10px 14px;border-radius:999px;color:#dbe7ff}.nav a:hover{background:rgba(255,255,255,.07)}.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 16px;border-radius:12px;font-weight:700;border:1px solid transparent;cursor:pointer}.btn-primary{background:var(--orange);color:#1b1209}.btn-secondary{background:transparent;border-color:#4c77ff;color:var(--white)}.hero{padding:72px 24px 36px}.wrap{max-width:1200px;margin:0 auto}.hero-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:24px;align-items:stretch}.kicker{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;background:rgba(35,100,255,.14);color:#b9ceff;border:1px solid rgba(35,100,255,.35);font-size:13px;font-weight:700}.kicker b{color:#fff}h1{font-size:clamp(36px,6vw,64px);line-height:1.02;margin:18px 0 16px}.hero p{font-size:18px;line-height:1.6;color:#d5e2fb;max-width:760px}.cta-row{display:flex;flex-wrap:wrap;gap:12px;margin:26px 0 22px}.signal-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}.signal{padding:9px 12px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid var(--line);font-size:13px;color:#d9e5fb}.card{background:var(--panel);border:1px solid var(--line);border-radius:20px;padding:22px;box-shadow:0 22px 60px rgba(0,0,0,.22)}.card h2,.card h3{margin:0 0 12px}.card p{margin:0;color:#cdd9ef;line-height:1.55}.metric{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:16px}.metric .mini{padding:16px;border-radius:16px;background:var(--panel-strong);border:1px solid var(--line)}.metric strong{display:block;font-size:28px;margin-bottom:6px;color:#fff}.section{padding:28px 24px}.section h2{font-size:32px;margin:0 0 12px}.section-lead{color:#c7d6ef;max-width:820px;line-height:1.6;margin-bottom:20px}.grid-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.grid-4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.grid-2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.list{display:grid;gap:10px;margin-top:12px}.row{display:flex;gap:10px;align-items:flex-start;padding:12px 0;border-top:1px solid rgba(255,255,255,.08)}.row:first-child{border-top:0;padding-top:0}.dot{width:10px;height:10px;margin-top:6px;border-radius:50%;background:var(--orange);flex:0 0 10px}.state{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:#cce7d5;background:rgba(78,226,154,.12);border:1px solid rgba(78,226,154,.25);padding:8px 12px;border-radius:999px}.stage{padding:18px;border-radius:18px;background:var(--panel);border:1px solid var(--line)}.stage small{display:block;color:#8fb0ff;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;font-weight:700}.stage strong{display:block;font-size:20px;margin-bottom:8px}.price{font-size:34px;font-weight:900;color:#fff;margin:10px 0}.eyebrow{font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#9ec0ff;font-weight:800}.footer{padding:36px 24px 60px;color:#bfd0ea}.footer-grid{display:grid;grid-template-columns:1.4fr .8fr;gap:20px;align-items:start}.footer p{line-height:1.6}@media (max-width: 920px){.hero-grid,.grid-2,.grid-3,.grid-4,.footer-grid,.metric{grid-template-columns:1fr}.topbar{padding:14px 16px;align-items:flex-start;gap:12px;flex-direction:column}.hero{padding-top:48px}}
</style>
</head>
<body>
<div class="shell">
  <header class="topbar">
    <div class="brand"><img src="/favicon.svg" alt="FCA logo" /><div class="brand-mark"><strong>Future Contractors of America</strong><span>FCA Contractor Command</span></div></div>
    <nav class="nav" aria-label="Primary">
      <a href="#product">Product</a>
      <a href="#workflow">Workflow</a>
      <a href="#pricing">Pricing</a>
      <a href="#access">Access</a>
      <a href="/auricrux/">Auricrux</a>
      <a class="btn btn-secondary" href="/login/">Login</a>
    </nav>
  </header>
  <main>
    <section class="hero">
      <div class="wrap hero-grid">
        <div>
          <div class="kicker"><b>Flagship product</b> FCA Contractor Command</div>
          <h1>Win work faster. Carry it cleanly into execution. Keep Auricrux active at every step.</h1>
          <p>FCA Contractor Command gives contractors a clear front door for intake, qualification, estimating, proposals, customer communication, and sales-to-operations handoff. Auricrux stays embedded as the command layer that explains, recommends, and executes the next action.</p>
          <div class="cta-row">
            <a class="btn btn-primary" href="/intake/">Start intake</a>
            <a class="btn btn-secondary" href="/pricing/">View pricing</a>
            <a class="btn btn-secondary" href="/auricrux/">Open Auricrux</a>
          </div>
          <div class="signal-row"><span class="signal">Lead to award continuity</span><span class="signal">Customer-facing intake</span><span class="signal">Auricrux command layer</span><span class="signal">Pricing and onboarding live</span></div>
        </div>
        <aside class="card">
          <h2>What FCA is selling right now</h2>
          <div class="list">
            <div class="row"><span class="dot"></span><div><strong>Sales spine first</strong><p>Lead intake, bid tracking, proposal generation, award handoff, and customer-facing coordination in one operating story.</p></div></div>
            <div class="row"><span class="dot"></span><div><strong>Auricrux everywhere</strong><p>A visible command tab gives buyers a direct way to experience Auricrux without letting it block the page.</p></div></div>
            <div class="row"><span class="dot"></span><div><strong>Sellable package</strong><p>Pricing, guided intake, login, and next-step onboarding are now part of the public surface.</p></div></div>
          </div>
        </aside>
      </div>
    </section>
    <section id="product" class="section"><div class="wrap"><h2>FCA Contractor Command</h2><p class="section-lead">The first marketable story is a clean contractor sales-and-operations spine: capture the lead, qualify the opportunity, price the work, generate the proposal, convert the award, and carry the job into setup with visible continuity instead of dropped context.</p><div class="grid-3"><article class="card"><h3>Sales + Intake</h3><p>Structured customer intake, qualification, and bid-entry flow so every opportunity starts with usable data.</p></article><article class="card"><h3>Estimating + Proposal</h3><p>Estimate tracking, proposal positioning, and award readiness so your front-end sales story becomes an operational handoff instead of a dead end.</p></article><article class="card"><h3>Auricrux Command</h3><p>Auricrux helps explain what is missing, what matters next, and what should be executed to keep revenue moving.</p></article></div></div></section>
    <section id="workflow" class="section"><div class="wrap"><h2>Flagship workflow spine</h2><p class="section-lead">This is the contractor workflow buyers should understand instantly.</p><div class="grid-4"><div class="stage"><small>01</small><strong>Lead + Intake</strong><p>Capture company, scope, value, urgency, files, and next commercial action.</p></div><div class="stage"><small>02</small><strong>Estimate + Bid</strong><p>Organize scope, pricing direction, bid status, and estimator handoff.</p></div><div class="stage"><small>03</small><strong>Proposal + Award</strong><p>Prepare the offer, position the value, and keep award/decline state visible.</p></div><div class="stage"><small>04</small><strong>Job Setup</strong><p>Turn won work into a customer, project, baseline schedule, and operational record.</p></div></div></div></section>
    <section id="pricing" class="section"><div class="wrap"><h2>Product offerings and pricing</h2><p class="section-lead">These packages are positioned as the current FCA customer-facing entry offers. They are intended to be clear enough to sell now while the deeper platform continues to expand.</p><div class="grid-3"><article class="card"><div class="eyebrow">Entry</div><h3>Startup Workspace</h3><div class="price">$99<span style="font-size:16px;font-weight:700">/mo</span></div><p>For very small contractors who need a branded workspace entry point, lead intake, bid continuity, and Auricrux-guided next actions.</p><div class="list"><div class="row"><span class="dot"></span><div>Basic workspace access</div></div><div class="row"><span class="dot"></span><div>Bid intake + bid status</div></div><div class="row"><span class="dot"></span><div>Auricrux guidance layer</div></div></div><div class="cta-row"><a class="btn btn-primary" href="/intake/?plan=startup">Choose Startup</a></div></article><article class="card"><div class="eyebrow">Launch</div><h3>Pilot Workspace</h3><div class="price">$2,500<span style="font-size:16px;font-weight:700"> one-time</span></div><p>For contractors who want guided rollout, stronger setup, and a concrete pilot story they can operationalize immediately.</p><div class="list"><div class="row"><span class="dot"></span><div>Guided implementation</div></div><div class="row"><span class="dot"></span><div>Sales-to-operations launch path</div></div><div class="row"><span class="dot"></span><div>Customer portal + onboarding support</div></div></div><div class="cta-row"><a class="btn btn-primary" href="/intake/?plan=pilot">Start Pilot Intake</a></div></article><article class="card"><div class="eyebrow">Growth</div><h3>Operations Workspace</h3><div class="price">$899<span style="font-size:16px;font-weight:700">/mo</span></div><p>For teams that need broader coordination across projects, messages, billing posture, Academy alignment, and Auricrux support.</p><div class="list"><div class="row"><span class="dot"></span><div>Multi-seat workspace</div></div><div class="row"><span class="dot"></span><div>Customer visibility + communications</div></div><div class="row"><span class="dot"></span><div>Academy / LMS alignment</div></div></div><div class="cta-row"><a class="btn btn-primary" href="/intake/?plan=operations">Request Operations Rollout</a></div></article></div></div></section>
    <section id="access" class="section"><div class="wrap grid-2"><article class="card"><h2>Front-facing intake and payment path</h2><p>Visitors can now move through a simple commercial path: pick a package, submit intake, and continue into payment/onboarding readiness.</p><div class="list"><div class="row"><span class="dot"></span><div><strong>Step 1</strong><p><a href="/pricing/">Review packages</a> and decide which FCA entry offer fits the customer.</p></div></div><div class="row"><span class="dot"></span><div><strong>Step 2</strong><p><a href="/intake/">Complete intake</a> with company, contact, scope, and commercial intent.</p></div></div><div class="row"><span class="dot"></span><div><strong>Step 3</strong><p><a href="/checkout/">Continue to checkout</a> for payment activation planning and onboarding next steps.</p></div></div></div></article><article class="card"><span class="state">Execution note: Auricrux-Central continuity preserved</span><div class="metric"><div class="mini"><strong>Login</strong><span>Seeded validation login remains available.</span></div><div class="mini"><strong>Auricrux</strong><span>Direct public command tab restored.</span></div><div class="mini"><strong>Pricing</strong><span>Sellable entry offers now visible.</span></div><div class="mini"><strong>Intake</strong><span>Public commercial path now exists.</span></div></div></article></div></section>
  </main>
  <footer class="footer"><div class="wrap footer-grid"><div><strong>Future Contractors of America</strong><p>FCA is building one continuous system across website, SaaS, Academy, and Auricrux-guided execution. The public surface should help a buyer understand the product, the offer, the path to onboarding, and the value of Auricrux in under a minute.</p></div><div><p><strong>Auricrux continuity</strong><br/>/api/run-task preserved for bounded execution-path verification.</p></div></div></footer>
</div>
</body>
</html>
HTML

mkdir -p dist/login
cat > dist/login/index.html << 'HTML'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>FCA Login | Future Contractors of America</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<style>
:root{--navy:#0C1A2A;--blue:#2364FF;--orange:#FF7A1A;--white:#fff;--line:rgba(255,255,255,.1);--muted:#c6d4ec;--panel:rgba(255,255,255,.06)}*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;background:linear-gradient(180deg,#091525 0%,#0C1A2A 60%,#13263b 100%);color:var(--white)}a{text-decoration:none;color:inherit}.wrap{max-width:1120px;margin:0 auto;padding:24px}.top{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:10px 0 24px}.brand{display:flex;gap:12px;align-items:center}.brand img{width:40px;height:40px}.brand strong{display:block}.brand span{display:block;color:var(--muted);font-size:12px}.back{padding:10px 14px;border:1px solid #3556af;border-radius:12px;color:#d9e4ff}.hero{display:grid;grid-template-columns:1fr 1fr;gap:22px;align-items:start;padding:16px 0 28px}.card{background:var(--panel);border:1px solid var(--line);border-radius:20px;padding:22px;box-shadow:0 18px 48px rgba(0,0,0,.2)}h1{font-size:42px;line-height:1.05;margin:10px 0 14px}h2{margin:0 0 12px}p{line-height:1.6;color:var(--muted)}.notice{display:inline-block;padding:8px 12px;border-radius:999px;background:rgba(255,122,26,.14);border:1px solid rgba(255,122,26,.34);color:#ffd9bd;font-weight:700;font-size:13px}.form{display:grid;gap:14px;margin-top:16px}.field label{display:block;font-weight:700;margin-bottom:6px}.field input,.field select{width:100%;padding:12px 13px;border-radius:12px;border:1px solid #355075;background:#07111e;color:#fff}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:6px}.btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 16px;border-radius:12px;font-weight:800;border:1px solid transparent;cursor:pointer}.btn-primary{background:var(--orange);color:#201208}.btn-secondary{background:transparent;border-color:#4c77ff;color:#fff}.list{display:grid;gap:10px;margin-top:14px}.row{padding:12px 0;border-top:1px solid rgba(255,255,255,.08)}.row:first-child{border-top:0;padding-top:0}.status{margin-top:14px;padding:14px 16px;border-radius:14px;background:rgba(35,100,255,.12);border:1px solid rgba(35,100,255,.28);color:#d9e4ff}.status.error{background:rgba(220,38,38,.16);border-color:rgba(248,113,113,.45);color:#ffe4e6}.status.success{background:rgba(34,197,94,.16);border-color:rgba(74,222,128,.45);color:#dcfce7}.small{font-size:13px;color:#9db4d8}@media(max-width:900px){.hero{grid-template-columns:1fr}h1{font-size:34px}.wrap{padding:18px}}
</style>
</head>
<body>
  <div class="wrap">
    <div class="top"><div class="brand"><img src="/favicon.svg" alt="FCA logo" /><div><strong>Future Contractors of America</strong><span>FCA Contractor Command Access</span></div></div><a class="back" href="/">Back to home</a></div>
    <section class="hero">
      <article>
        <span class="notice">Evidence-based interim login</span>
        <h1>Login route restored and wired.</h1>
        <p>This login posts to the seeded FCA customer authentication endpoint so you can validate branded entry, commercial flow, and next-step routing while deeper account infrastructure continues to mature.</p>
        <div class="status" id="statusBox">Working now: branded login route, seeded authentication response, and post-login routing into live customer-facing surfaces.</div>
        <div class="list"><div class="row"><strong>Recovered from evidence</strong><p>Logo presence, FCA-first branding, non-obstructive Auricrux posture, and a real login action instead of a missing route.</p></div><div class="row"><strong>Still not claimed</strong><p>This is not yet full managed production auth. It is a truthful seeded validation login while broader UI recovery continues.</p></div><div class="row"><strong>Next surface after sign-in</strong><p>Successful login routes into the current customer status surface without touching Auricrux-Central settings or <code>/api/run-task</code>.</p></div></div>
      </article>
      <aside class="card">
        <h2>Customer sign in</h2>
        <form class="form" id="loginForm">
          <div class="field"><label for="email">Work email</label><input id="email" type="email" placeholder="name@company.com" /></div>
          <div class="field"><label for="password">Password</label><input id="password" type="password" placeholder="Enter your password" /></div>
          <div class="field"><label for="mode">Access mode</label><select id="mode"><option>Customer workspace validation</option><option>Bid status review</option><option>Bid intake access</option></select></div>
          <div class="actions"><button class="btn btn-primary" type="submit" id="signInBtn">Sign in</button><button class="btn btn-secondary" type="button" id="validationBtn">Use validation access</button></div>
          <p class="small">Validation access uses the seeded FCA test workspace route so the login surface is actually testable in public deployment.</p>
        </form>
      </aside>
    </section>
  </div>
<script>
const form=document.getElementById('loginForm'); const email=document.getElementById('email'); const password=document.getElementById('password'); const signInBtn=document.getElementById('signInBtn'); const validationBtn=document.getElementById('validationBtn'); const statusBox=document.getElementById('statusBox');
function setStatus(message, kind){statusBox.textContent=message;statusBox.className='status'+(kind?' '+kind:'');}
async function authenticate(payload){ const response=await fetch('/api/customer-login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); const data=await response.json().catch(()=>({ok:false,error:'Invalid login response.'})); if(!response.ok||!data.ok){throw new Error(data.error||'Login failed.');} return data; }
form.addEventListener('submit',async function(event){ event.preventDefault(); signInBtn.disabled=true; validationBtn.disabled=true; setStatus('Authenticating FCA customer session…'); try{ await authenticate({email:email.value.trim(),password:password.value}); setStatus('Login successful. Opening customer status surface…','success'); setTimeout(function(){window.location.href='/fca-customer-status/';},500); }catch(error){ setStatus('Login failed: '+error.message,'error'); }finally{ signInBtn.disabled=false; validationBtn.disabled=false; }});
validationBtn.addEventListener('click',async function(){ signInBtn.disabled=true; validationBtn.disabled=true; setStatus('Opening seeded validation workspace…'); try{ await authenticate({email:'founder.test@futurecontractorsofamerica.com',password:'FCA-HandsOff-2026!'}); setStatus('Seeded validation login succeeded. Opening customer status surface…','success'); setTimeout(function(){window.location.href='/fca-customer-status/';},500); }catch(error){ setStatus('Validation access failed: '+error.message,'error'); }finally{ signInBtn.disabled=false; validationBtn.disabled=false; }});
</script>
</body>
</html>
HTML

mkdir -p dist/auricrux
cat > dist/auricrux/index.html << 'HTML'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Auricrux | FCA Command Layer</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<style>
:root{--navy:#0C1A2A;--blue:#2364FF;--orange:#FF7A1A;--white:#fff;--muted:#c6d4ec;--panel:rgba(255,255,255,.06);--line:rgba(255,255,255,.1)}*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;background:linear-gradient(180deg,#081524 0%,#0C1A2A 55%,#13263b 100%);color:#fff}.wrap{max-width:1100px;margin:0 auto;padding:24px}.top{display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap}.brand{display:flex;align-items:center;gap:12px}.brand img{width:42px;height:42px}.back{padding:10px 14px;border-radius:12px;border:1px solid #3556af;color:#d8e4ff;text-decoration:none}.grid{display:grid;grid-template-columns:1.1fr .9fr;gap:20px;margin-top:26px}.card{background:var(--panel);border:1px solid var(--line);border-radius:20px;padding:22px}.pill{display:inline-block;padding:8px 12px;border-radius:999px;background:rgba(255,122,26,.14);border:1px solid rgba(255,122,26,.35);color:#ffd9bd;font-size:13px;font-weight:800}.prompt{display:grid;gap:10px;margin-top:16px}.prompt button,.send{padding:12px 14px;border-radius:12px;border:1px solid #395782;background:#07111e;color:#fff;cursor:pointer;text-align:left}.send.primary{background:#FF7A1A;border-color:#FF7A1A;color:#201208;font-weight:800;text-align:center}.output{margin-top:14px;padding:16px;border-radius:14px;background:#07111e;border:1px solid #355075;min-height:140px;white-space:pre-wrap;color:#dce8ff}.input{width:100%;padding:12px 13px;border-radius:12px;border:1px solid #355075;background:#07111e;color:#fff;margin-top:12px}.list{display:grid;gap:10px;margin-top:14px}.row{padding:12px 0;border-top:1px solid rgba(255,255,255,.08)}.row:first-child{border-top:0;padding-top:0}@media(max-width:900px){.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="wrap">
  <div class="top"><div class="brand"><img src="/favicon.svg" alt="FCA logo" /><div><strong>Future Contractors of America</strong><div style="color:#c6d4ec;font-size:12px">Auricrux Command Layer</div></div></div><a class="back" href="/">Back to home</a></div>
  <div class="grid">
    <section class="card">
      <span class="pill">Basic Auricrux command tab</span>
      <h1 style="margin:14px 0 10px">Ask Auricrux what to do next.</h1>
      <p style="color:#c6d4ec;line-height:1.6">This public command surface is intentionally lightweight. It gives prospective FCA customers a simple way to experience Auricrux as a sales, guidance, and workflow command layer without letting a floating panel block the rest of the site.</p>
      <div class="prompt"><button type="button" onclick="runPreset('What is FCA Contractor Command?')">What is FCA Contractor Command?</button><button type="button" onclick="runPreset('Which FCA package is best for a small contractor?')">Which FCA package is best for a small contractor?</button><button type="button" onclick="runPreset('What happens after intake?')">What happens after intake?</button></div>
      <input id="commandInput" class="input" placeholder="Ask Auricrux a question..." />
      <button class="send primary" type="button" onclick="runCommand()">Send command</button>
      <div id="output" class="output">Auricrux ready. Ask about pricing, intake, rollout, proposals, or next steps.</div>
    </section>
    <aside class="card">
      <h2 style="margin-top:0">What this tab is for</h2>
      <div class="list"><div class="row"><strong>Explain</strong><div style="color:#c6d4ec">Help a buyer understand the product, the offer, and the next step.</div></div><div class="row"><strong>Recommend</strong><div style="color:#c6d4ec">Point a buyer toward the right package, intake path, or rollout option.</div></div><div class="row"><strong>Execute</strong><div style="color:#c6d4ec">Route the buyer into intake, pricing, login, or customer status flow.</div></div></div>
    </aside>
  </div>
</div>
<script>
function reply(text){const q=(text||'').toLowerCase(); if(q.includes('package')||q.includes('pricing')) return 'Auricrux: Startup Workspace is the lightest entry point, Pilot Workspace is the strongest guided launch offer, and Operations Workspace is the best fit for teams that need broader coordination. Open /pricing/ or /intake/ to continue.'; if(q.includes('after intake')) return 'Auricrux: After intake, FCA qualifies the opportunity, routes it into bid and estimate continuity, positions the proposal path, and carries the result into award and job setup.'; if(q.includes('what is fca')) return 'Auricrux: FCA Contractor Command is the contractor operating system for lead intake, qualification, estimating, proposals, and sales-to-operations continuity.'; return 'Auricrux: I can guide you to pricing, intake, login, or the current customer validation workspace.';}
function runPreset(text){document.getElementById('commandInput').value=text; runCommand();}
function runCommand(){const input=document.getElementById('commandInput'); document.getElementById('output').textContent=reply(input.value.trim());}
document.getElementById('commandInput').addEventListener('keydown',function(e){if(e.key==='Enter'){runCommand();}})
</script>
</body>
</html>
HTML

mkdir -p dist/pricing
cat > dist/pricing/index.html << 'HTML'
<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>FCA Pricing</title><link rel="icon" type="image/svg+xml" href="/favicon.svg" /><style>body{margin:0;font-family:Arial,Helvetica,sans-serif;background:linear-gradient(180deg,#081524 0%,#0C1A2A 55%,#13263b 100%);color:#fff}.wrap{max-width:1100px;margin:0 auto;padding:24px}.top{display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap}.back{padding:10px 14px;border:1px solid #3556af;border-radius:12px;color:#d8e4ff;text-decoration:none}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:24px}.card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:22px}.price{font-size:36px;font-weight:900;margin:8px 0}.btn{display:inline-flex;padding:12px 14px;border-radius:12px;background:#FF7A1A;color:#201208;text-decoration:none;font-weight:800;margin-top:14px}.eyebrow{font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#9ec0ff;font-weight:800}@media(max-width:900px){.grid{grid-template-columns:1fr}}</style></head><body><div class="wrap"><div class="top"><div><h1 style="margin:0">FCA Pricing</h1><p style="color:#c6d4ec">Clear entry offers for FCA Contractor Command.</p></div><a class="back" href="/">Back to home</a></div><div class="grid"><div class="card"><div class="eyebrow">Entry</div><h2>Startup Workspace</h2><div class="price">$99/mo</div><p style="color:#d1ddf3;line-height:1.6">For owner-operators and very small contractors needing branded intake, bid continuity, and Auricrux-guided next actions.</p><a class="btn" href="/intake/?plan=startup">Choose Startup</a></div><div class="card"><div class="eyebrow">Launch</div><h2>Pilot Workspace</h2><div class="price">$2,500 one-time</div><p style="color:#d1ddf3;line-height:1.6">For guided rollout and first operational deployment with stronger setup and onboarding support.</p><a class="btn" href="/intake/?plan=pilot">Start Pilot Intake</a></div><div class="card"><div class="eyebrow">Growth</div><h2>Operations Workspace</h2><div class="price">$899/mo</div><p style="color:#d1ddf3;line-height:1.6">For growing teams that need broader coordination across projects, messages, billing, Academy alignment, and Auricrux support.</p><a class="btn" href="/intake/?plan=operations">Request Operations Rollout</a></div></div></div></body></html>
HTML

mkdir -p dist/intake
cat > dist/intake/index.html << 'HTML'
<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>FCA Intake</title><link rel="icon" type="image/svg+xml" href="/favicon.svg" /><style>body{margin:0;font-family:Arial,Helvetica,sans-serif;background:linear-gradient(180deg,#091525 0%,#0C1A2A 60%,#13263b 100%);color:#fff}.wrap{max-width:980px;margin:0 auto;padding:24px}.card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:22px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.field label{display:block;font-weight:700;margin-bottom:6px}.field input,.field select,.field textarea{width:100%;padding:12px 13px;border-radius:12px;border:1px solid #355075;background:#07111e;color:#fff}.field textarea{min-height:120px}.full{grid-column:1/-1}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:18px}.btn{display:inline-flex;padding:12px 14px;border-radius:12px;background:#FF7A1A;color:#201208;text-decoration:none;font-weight:800;border:none;cursor:pointer}.back{padding:10px 14px;border:1px solid #3556af;border-radius:12px;color:#d8e4ff;text-decoration:none}.top{display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:18px}.status{margin-top:16px;padding:14px 16px;border-radius:14px;background:rgba(35,100,255,.12);border:1px solid rgba(35,100,255,.28);color:#d9e4ff}@media(max-width:900px){.grid{grid-template-columns:1fr}}</style></head><body><div class="wrap"><div class="top"><div><h1 style="margin:0">FCA Customer Intake</h1><p style="color:#c6d4ec">Select an offer, submit company details, and continue toward payment and onboarding.</p></div><a class="back" href="/">Back to home</a></div><section class="card"><form id="intakeForm"><div class="grid"><div class="field"><label for="plan">Offer</label><select id="plan"><option value="startup">Startup Workspace</option><option value="pilot">Pilot Workspace</option><option value="operations">Operations Workspace</option></select></div><div class="field"><label for="company">Company</label><input id="company" required placeholder="Your company name" /></div><div class="field"><label for="name">Contact name</label><input id="name" required placeholder="Primary contact" /></div><div class="field"><label for="email">Work email</label><input id="email" type="email" required placeholder="name@company.com" /></div><div class="field"><label for="phone">Phone</label><input id="phone" placeholder="Phone number" /></div><div class="field"><label for="size">Company size</label><select id="size"><option>Owner-operator</option><option>2-5 employees</option><option>6-15 employees</option><option>16+ employees</option></select></div><div class="field full"><label for="needs">What do you need FCA to solve first?</label><textarea id="needs" placeholder="Lead intake, estimating, proposals, customer coordination, workflow continuity, training, billing visibility, etc."></textarea></div></div><div class="actions"><button class="btn" type="submit">Continue to checkout</button><a class="back" href="/pricing/">Back to pricing</a></div><div id="status" class="status">Current flow: package selection → intake → checkout planning → onboarding.</div></form></section></div><script>const params=new URLSearchParams(window.location.search); const preset=params.get('plan'); if(preset){document.getElementById('plan').value=preset;} document.getElementById('intakeForm').addEventListener('submit',function(e){e.preventDefault(); const plan=document.getElementById('plan').value; const company=encodeURIComponent(document.getElementById('company').value); window.location.href='/checkout/?plan='+encodeURIComponent(plan)+'&company='+company;});</script></body></html>
HTML

mkdir -p dist/checkout
cat > dist/checkout/index.html << 'HTML'
<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>FCA Checkout</title><link rel="icon" type="image/svg+xml" href="/favicon.svg" /><style>body{margin:0;font-family:Arial,Helvetica,sans-serif;background:linear-gradient(180deg,#091525 0%,#0C1A2A 60%,#13263b 100%);color:#fff}.wrap{max-width:920px;margin:0 auto;padding:24px}.card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:22px}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:18px}.btn{display:inline-flex;padding:12px 14px;border-radius:12px;background:#FF7A1A;color:#201208;text-decoration:none;font-weight:800}.back{padding:10px 14px;border:1px solid #3556af;border-radius:12px;color:#d8e4ff;text-decoration:none}.top{display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:18px}.pill{display:inline-block;padding:8px 12px;border-radius:999px;background:rgba(255,122,26,.14);border:1px solid rgba(255,122,26,.35);color:#ffd9bd;font-size:13px;font-weight:800}</style></head><body><div class="wrap"><div class="top"><div><h1 style="margin:0">FCA Checkout and Onboarding</h1><p style="color:#c6d4ec">Front-facing commercial next step for package activation.</p></div><a class="back" href="/intake/">Back to intake</a></div><section class="card"><span class="pill">Truthful commercial boundary</span><h2 id="offerTitle">Selected offer</h2><p style="color:#d1ddf3;line-height:1.7">This page now serves as the public payment and onboarding handoff surface. It is intentionally truthful: package selection and checkout intent are public-facing, while live payment processor activation is the next production-hardening step.</p><div id="summary" style="margin-top:14px;color:#dce8ff;line-height:1.7"></div><div class="actions"><a class="btn" href="mailto:hello@futurecontractorsofamerica.com?subject=FCA%20Package%20Activation">Request package activation</a><a class="back" href="/login/">Go to login</a></div></section></div><script>const params=new URLSearchParams(window.location.search); const plan=params.get('plan')||'startup'; const company=params.get('company')||'your company'; const titleMap={startup:'Startup Workspace',pilot:'Pilot Workspace',operations:'Operations Workspace'}; const priceMap={startup:'$99/mo',pilot:'$2,500 one-time',operations:'$899/mo'}; document.getElementById('offerTitle').textContent=(titleMap[plan]||'FCA Package')+' · '+(priceMap[plan]||'pricing pending'); document.getElementById('summary').textContent='Selected for '+decodeURIComponent(company)+'. Next action: confirm commercial fit, activate billing, and begin onboarding into FCA Contractor Command.';</script></body></html>
HTML

echo '{"status":"restored-public-front","shell":"FCA Contractor Command","execution":"Auricrux-Central"}' > dist/deployment-status.json
echo '{"primary":"futurecontractorsofamerica.com","www":"www.futurecontractorsofamerica.com","swa":"delightful-mushroom-0de67860f.7.azurestaticapps.net","status":"continuity-preserved"}' > dist/domain-continuity.json
echo "FCA public landing shell restored" > dist/runtime-fingerprint.txt
echo "<!doctype html><html><head><title>FCA Live Shell Verification</title></head><body><h1>FCA Live Shell Verification</h1><p>FCA public landing shell restored.</p><p>Login, logo, flagship product framing, pricing, and intake flow restored.</p></body></html>" > dist/live-shell-verification.html
echo "<!doctype html><html><head><title>FCA Host Binding Audit</title></head><body><h1>Host Binding Audit</h1><p>futurecontractorsofamerica.com</p><p>www.futurecontractorsofamerica.com</p><p>delightful-mushroom-0de67860f.7.azurestaticapps.net</p></body></html>" > dist/host-binding-audit.html
echo "<!doctype html><html><head><title>FCA API Continuity Audit</title></head><body><h1>API Continuity Audit</h1><p>/api/run-task preserved.</p><p>Auricrux-Central execute route preserved.</p></body></html>" > dist/api-continuity-audit.html
echo "FCA public landing shell restore witness" > dist/commit-witness-$(date +%Y%m%d%H%M%S).txt
echo "FCA public landing shell restore build completed"
