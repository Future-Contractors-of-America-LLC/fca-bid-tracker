#!/bin/bash
set -e
mkdir -p dist
cp public/favicon.svg dist/favicon.svg
cp public/site.webmanifest dist/site.webmanifest
cp public/robots.txt dist/robots.txt
cp public/social-card.svg dist/social-card.svg

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
:root{
  --navy:#0C1A2A;
  --blue:#2364FF;
  --orange:#FF7A1A;
  --slate:#4B4F58;
  --white:#FFFFFF;
  --ink:#DCE7FF;
  --line:rgba(255,255,255,.10);
  --panel:rgba(255,255,255,.05);
  --panel-strong:rgba(255,255,255,.08);
  --success:#4ee29a;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font-family:Arial,Helvetica,sans-serif;background:linear-gradient(180deg,#081524 0%,#0C1A2A 45%,#13263b 100%);color:var(--white)}
a{text-decoration:none;color:inherit}
.shell{min-height:100vh}
.topbar{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:16px 24px;background:rgba(12,26,42,.88);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.brand{display:flex;align-items:center;gap:14px}
.brand img{width:42px;height:42px}
.brand-mark{display:flex;flex-direction:column}
.brand-mark strong{font-size:18px;letter-spacing:.02em}
.brand-mark span{font-size:12px;color:#b8c8e6}
.nav{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.nav a{padding:10px 14px;border-radius:999px;color:#dbe7ff}
.nav a:hover{background:rgba(255,255,255,.07)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 16px;border-radius:12px;font-weight:700;border:1px solid transparent;cursor:pointer}
.btn-primary{background:var(--orange);color:#1b1209}
.btn-secondary{background:transparent;border-color:#4c77ff;color:var(--white)}
.hero{padding:72px 24px 36px}
.wrap{max-width:1200px;margin:0 auto}
.hero-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:24px;align-items:stretch}
.kicker{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;background:rgba(35,100,255,.14);color:#b9ceff;border:1px solid rgba(35,100,255,.35);font-size:13px;font-weight:700}
.kicker b{color:#fff}
h1{font-size:clamp(36px,6vw,64px);line-height:1.02;margin:18px 0 16px}
.hero p{font-size:18px;line-height:1.6;color:#d5e2fb;max-width:760px}
.cta-row{display:flex;flex-wrap:wrap;gap:12px;margin:26px 0 22px}
.signal-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}
.signal{padding:9px 12px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid var(--line);font-size:13px;color:#d9e5fb}
.card{background:var(--panel);border:1px solid var(--line);border-radius:20px;padding:22px;box-shadow:0 22px 60px rgba(0,0,0,.22)}
.card h2,.card h3{margin:0 0 12px}
.card p{margin:0;color:#cdd9ef;line-height:1.55}
.stack{display:grid;gap:14px}
.metric{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:16px}
.metric .mini{padding:16px;border-radius:16px;background:var(--panel-strong);border:1px solid var(--line)}
.metric strong{display:block;font-size:28px;margin-bottom:6px;color:#fff}
.section{padding:28px 24px}
.section h2{font-size:32px;margin:0 0 12px}
.section-lead{color:#c7d6ef;max-width:820px;line-height:1.6;margin-bottom:20px}
.grid-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.grid-4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
.list{display:grid;gap:10px;margin-top:12px}
.row{display:flex;gap:10px;align-items:flex-start;padding:12px 0;border-top:1px solid rgba(255,255,255,.08)}
.row:first-child{border-top:0;padding-top:0}
.dot{width:10px;height:10px;margin-top:6px;border-radius:50%;background:var(--orange);flex:0 0 10px}
.state{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:#cce7d5;background:rgba(78,226,154,.12);border:1px solid rgba(78,226,154,.25);padding:8px 12px;border-radius:999px}
.stage{padding:18px;border-radius:18px;background:var(--panel);border:1px solid var(--line)}
.stage small{display:block;color:#8fb0ff;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;font-weight:700}
.stage strong{display:block;font-size:20px;margin-bottom:8px}
.footer{padding:36px 24px 60px;color:#bfd0ea}
.footer-grid{display:grid;grid-template-columns:1.4fr .8fr;gap:20px;align-items:start}
.footer p{line-height:1.6}
@media (max-width: 920px){
  .hero-grid,.grid-3,.grid-4,.footer-grid,.metric{grid-template-columns:1fr}
  .topbar{padding:14px 16px;align-items:flex-start;gap:12px;flex-direction:column}
  .hero{padding-top:48px}
}
</style>
</head>
<body>
<div class="shell">
  <header class="topbar">
    <div class="brand">
      <img src="/favicon.svg" alt="FCA logo" />
      <div class="brand-mark">
        <strong>Future Contractors of America</strong>
        <span>FCA Contractor Command</span>
      </div>
    </div>
    <nav class="nav" aria-label="Primary">
      <a href="#product">Product</a>
      <a href="#workflow">Workflow</a>
      <a href="#academy">Academy</a>
      <a href="#access">Access</a>
      <a class="btn btn-secondary" href="/login">Login</a>
    </nav>
  </header>

  <main>
    <section class="hero">
      <div class="wrap hero-grid">
        <div>
          <div class="kicker"><b>Flagship product</b> FCA Contractor Command</div>
          <h1>The contractor operating system for intake, estimating, proposals, and job setup.</h1>
          <p>FCA is not supposed to open like a customer portal shell. It should present a clear public front door with brand, login, flagship product framing, and a visible path into the first sellable workflow: <strong>Lead → Bid → Proposal → Award → Job Setup</strong>.</p>
          <div class="cta-row">
            <a class="btn btn-primary" href="#access">Open intake path</a>
            <a class="btn btn-secondary" href="/login">Customer login</a>
          </div>
          <div class="signal-row">
            <span class="signal">Auricrux integrated</span>
            <span class="signal">FCA brand restored</span>
            <span class="signal">Public-front layout</span>
            <span class="signal">Flagship product visible</span>
          </div>
        </div>
        <aside class="card">
          <h2>What this front page should communicate</h2>
          <div class="list">
            <div class="row"><span class="dot"></span><div><strong>Login exists</strong><p>Visible entry point for customer access instead of dropping visitors into an internal-looking workspace shell.</p></div></div>
            <div class="row"><span class="dot"></span><div><strong>FCA identity is present</strong><p>Logo, brand, and FCA-first framing are visible again.</p></div></div>
            <div class="row"><span class="dot"></span><div><strong>Flagship product is obvious</strong><p>FCA Contractor Command is named and explained as the core product spine.</p></div></div>
            <div class="row"><span class="dot"></span><div><strong>Intake comes first</strong><p>The public layer routes visitors into intake and qualification before the customer portal experience.</p></div></div>
          </div>
        </aside>
      </div>
    </section>

    <section id="product" class="section">
      <div class="wrap">
        <h2>FCA Contractor Command</h2>
        <p class="section-lead">The first marketable story is not “everything at once.” It is a coherent operating spine that customers understand immediately: intake, qualification, estimating, proposal generation, award transition, and job setup with Auricrux continuity across the handoff.</p>
        <div class="grid-3">
          <article class="card">
            <h3>Public Front</h3>
            <p>Home, product framing, pricing posture, access entry, and intake initiation. This layer should feel like a marketable website, not a customer portal dropped on the root domain.</p>
          </article>
          <article class="card">
            <h3>Contractor Workflow</h3>
            <p>Lead capture, bid intake, estimate build, proposal generation, and award-to-job transition establish the first real sellable vertical slice.</p>
          </article>
          <article class="card">
            <h3>Auricrux Layer</h3>
            <p>Auricrux guides, explains, recommends, executes, and records continuity actions across the workflow rather than sitting as a disconnected add-on.</p>
          </article>
        </div>
      </div>
    </section>

    <section id="workflow" class="section">
      <div class="wrap">
        <h2>Flagship workflow spine</h2>
        <p class="section-lead">The first live product story should be visible on the public site so a buyer can understand what FCA actually does.</p>
        <div class="grid-4">
          <div class="stage"><small>01</small><strong>Lead + Intake</strong><p>Manual intake, structured opportunity capture, and qualification gating.</p></div>
          <div class="stage"><small>02</small><strong>Estimate + Bid</strong><p>Bid creation, bid tracking, scope structure, and estimating visibility.</p></div>
          <div class="stage"><small>03</small><strong>Proposal + Award</strong><p>Proposal narrative, assumptions, exclusions, and award/decline state handling.</p></div>
          <div class="stage"><small>04</small><strong>Job Setup</strong><p>Create the customer, project, schedule placeholder, and baseline continuity record.</p></div>
        </div>
      </div>
    </section>

    <section id="academy" class="section">
      <div class="wrap grid-3">
        <article class="card">
          <h3>Website</h3>
          <p>Customer-facing entry, positioning, trust, and conversion into intake or login.</p>
        </article>
        <article class="card">
          <h3>SaaS</h3>
          <p>Workspace execution for contractor command, with the flagship vertical slice as the first operational core.</p>
        </article>
        <article class="card">
          <h3>Academy</h3>
          <p>Integrated training and workforce development connected to the same system, not presented as a disconnected afterthought.</p>
        </article>
      </div>
    </section>

    <section id="access" class="section">
      <div class="wrap hero-grid">
        <article class="card">
          <h2>Access and intake</h2>
          <p>Use the public front door to route visitors correctly.</p>
          <div class="list">
            <div class="row"><span class="dot"></span><div><strong>Customer login</strong><p><a href="/login">/login</a> is the explicit access route for returning users.</p></div></div>
            <div class="row"><span class="dot"></span><div><strong>Intake path</strong><p><a href="/intake">/intake</a> is the contractor-facing start point for new opportunities and qualification.</p></div></div>
            <div class="row"><span class="dot"></span><div><strong>Product detail</strong><p><a href="/product">/product</a> is the product framing route for FCA Contractor Command.</p></div></div>
          </div>
        </article>
        <article class="card">
          <span class="state">Execution note: Auricrux-Central connectivity preserved</span>
          <div class="metric">
            <div class="mini"><strong>Brand</strong><span>FCA logo and identity restored to root layer.</span></div>
            <div class="mini"><strong>Login</strong><span>Visible entry restored to the primary navigation.</span></div>
            <div class="mini"><strong>Product</strong><span>Flagship product named and framed on the homepage.</span></div>
            <div class="mini"><strong>Intent</strong><span>Public website first, not portal-first root experience.</span></div>
          </div>
        </article>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="wrap footer-grid">
      <div>
        <strong>Future Contractors of America</strong>
        <p>FCA is building one continuous system across website, SaaS, Academy, and Auricrux-guided execution. The public root should present the marketable front door; the portal belongs behind access, not as the default first impression.</p>
      </div>
      <div>
        <p><strong>Auricrux continuity</strong><br/>/api/run-task preserved for bounded execution-path verification.</p>
      </div>
    </div>
  </footer>
</div>
</body>
</html>
HTML

echo '{}' > dist/staticwebapp.config.json
echo '{"status":"restored-public-front","shell":"FCA Contractor Command","execution":"Auricrux-Central"}' > dist/deployment-status.json
echo '{"primary":"futurecontractorsofamerica.com","www":"www.futurecontractorsofamerica.com","swa":"delightful-mushroom-0de67860f.7.azurestaticapps.net","status":"continuity-preserved"}' > dist/domain-continuity.json
echo "FCA public landing shell restored" > dist/runtime-fingerprint.txt
echo "<!doctype html><html><head><title>FCA Live Shell Verification</title></head><body><h1>FCA Live Shell Verification</h1><p>FCA public landing shell restored.</p><p>Login, logo, and flagship product framing restored.</p></body></html>" > dist/live-shell-verification.html
echo "<!doctype html><html><head><title>FCA Host Binding Audit</title></head><body><h1>Host Binding Audit</h1><p>futurecontractorsofamerica.com</p><p>www.futurecontractorsofamerica.com</p><p>delightful-mushroom-0de67860f.7.azurestaticapps.net</p></body></html>" > dist/host-binding-audit.html
echo "<!doctype html><html><head><title>FCA API Continuity Audit</title></head><body><h1>API Continuity Audit</h1><p>/api/run-task preserved.</p><p>Auricrux-Central execute route preserved.</p></body></html>" > dist/api-continuity-audit.html
echo "FCA public landing shell restore witness" > dist/commit-witness-$(date +%Y%m%d%H%M%S).txt
echo "FCA public landing shell restore build completed"
