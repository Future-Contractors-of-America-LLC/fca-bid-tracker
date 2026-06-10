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
function runTask() {
  document.getElementById("output").textContent = "CLICK REGISTERED";
}
</script>

</body>
</html>
HTML

echo "{}" > dist/staticwebapp.config.json
touch dist/commit-witness-1.txt

echo "Build completed"
