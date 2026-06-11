#!/bin/bash
set -e
mkdir -p dist

cat > dist/index.html << 'HTML'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>FCA Platform</title>
<style>
:root{--bg:#07111f;--panel:#111c2e;--text:#eef5ff;--muted:#a9bdd6;--accent:#35d0ff;--ok:#57e389;--warn:#ffd166}
*{box-sizing:border-box}
body{margin:0;font-family:Arial,Helvetica,sans-serif;background:linear-gradient(135deg,#07111f,#0b1728 50%,#101827);color:var(--text)}
header{padding:28px 22px;border-bottom:1px solid #20324e;background:rgba(0,0,0,.25)}
h1{margin:0;color:var(--accent);font-size:34px}
h2{margin:0 0 10px;color:#fff}
p{color:var(--muted);line-height:1.45}
.wrap{max-width:1180px;margin:0 auto;padding:22px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px}
.card{background:var(--panel);border:1px solid #263a5c;border-radius:14px;padding:18px;box-shadow:0 8px 28px rgba(0,0,0,.25)}
.pill{display:inline-block;padding:6px 10px;border-radius:999px;background:#0d2c3d;color:var(--accent);font-size:12px;font-weight:bold;margin:4px 6px 4px 0}
.ok{color:var(--ok)}.warn{color:var(--warn)}
button{background:var(--accent);color:#001522;border:0;border-radius:10px;padding:12px 16px;font-weight:bold;cursor:pointer}
pre{white-space:pre-wrap;background:#03080f;border:1px solid #223653;border-radius:12px;padding:14px;min-height:120px;overflow:auto;color:#d8ecff}
</style>
</head>
<body>
<header>
<div class="wrap">
<h1>FCA Command Layer</h1>
<p>Future Contractors of America platform shell restored on the stable Auricrux execution path.</p>
<span class="pill">Auricrux-Central Live</span>
<span class="pill">SWA Connected</span>
<span class="pill">Foundry Ready</span>
<span class="pill">GitHub Ready</span>
<span class="pill">Graph Ready</span>
</div>
</header>

<main class="wrap">
<section class="card">
<h2>Auricrux Execution</h2>
<p>This button calls the Static Web App API path and verifies the live Auricrux-Central execute route.</p>
<button onclick="runTask()">Run Task</button>
<pre id="output">Idle. Execution path is ready for verification.</pre>
</section>

<section class="grid" style="margin-top:16px">
<div class="card"><h2>Core OS</h2><p>Plans, estimating, proposal, build, finance, legal, warranty, and closeout workflows.</p></div>
<div class="card"><h2>Estimating</h2><p>Bid structure, scope capture, pricing logic, and proposal support.</p></div>
<div class="card"><h2>Operations</h2><p>Project scheduling, task execution, field reporting, and production oversight.</p></div>
<div class="card"><h2>FCA Academy</h2><p>Embedded training path for contractor workflows and system adoption.</p></div>
<div class="card"><h2>Finance</h2><p>Invoices, expenses, profitability tracking, and operating visibility.</p></div>
<div class="card"><h2>Compliance</h2><p>Contracts, permits, licensing, governance, and closeout documentation.</p></div>
</section>

<section class="card" style="margin-top:16px">
<h2>Integration Spine</h2>
<p><span class="ok">Connected:</span> FCA public site to Static Web App API to Auricrux-Central. <span class="warn">Next controlled phase:</span> restore full historical product UI modules without destabilizing the execution path.</p>
</section>
</main>

<script>
async function runTask(){
  const out=document.getElementById("output");
  out.textContent="Running Auricrux execution check...";
  try{
    const res=await fetch("/api/run-task",{method:"POST"});
    const text=await res.text();
    out.textContent=text&&text.trim()?text:"EMPTY RESPONSE";
  }catch(e){
    out.textContent="ERROR: "+e.message;
  }
}
</script>
</body>
</html>
HTML

echo "{}" > dist/staticwebapp.config.json
echo "OK" > dist/runtime-fingerprint.txt
echo "FCA UI restore build completed"
