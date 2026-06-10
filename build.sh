#!/bin/bash

mkdir -p dist

cat > dist/index.html << 'HTML'
<!DOCTYPE html>
<html>
<head>
  <title>FCA Platform</title>
</head>
<body>

<h1>FCA Command Layer</h1>

<button onclick="runTask()">Run Task</button>

<pre id="output">Idle...</pre>

<script>
async function runTask() {
  const out = document.getElementById("output");
  out.textContent = "Running...";

  try {
    const res = await fetch("/api/run-task", {
      method: "POST"
    });

    const text = await res.text();

    if (!text || text.trim() === "") {
      out.textContent = "EMPTY RESPONSE (API reached but no body)";
      return;
    }

    out.textContent = text;

  } catch (err) {
    out.textContent = "ERROR: " + err.message;
  }
}
</script>

</body>
</html>
HTML

echo "{}" > dist/staticwebapp.config.json
echo "{}" > dist/deployment-status.json
echo "{}" > dist/domain-continuity.json
echo "OK" > dist/runtime-fingerprint.txt
echo "<html>live shell</html>" > dist/live-shell-verification.html
echo "<html>host binding</html>" > dist/host-binding-audit.html
echo "<html>api audit</html>" > dist/api-continuity-audit.html

touch dist/commit-witness-1.txt

echo "Build completed"
