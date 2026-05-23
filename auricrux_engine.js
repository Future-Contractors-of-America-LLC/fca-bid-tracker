import fs from "fs";
import path from "path";

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function getCommandFromIssueEvent() {
  try {
    const eventPath = process.env.GITHUB_EVENT_PATH;
    const eventName = process.env.GITHUB_EVENT_NAME;
    if (!eventPath || !fs.existsSync(eventPath)) return "";
    const payload = readJson(eventPath);

    if (eventName === "issues" && payload.issue) {
      const title = String(payload.issue.title || "");
      const body = String(payload.issue.body || "");
      // Accept either title "AURICRUX: <command>" or body starting with "AURICRUX:"
      const combined = `${title}\n${body}`.trim();
      const m = combined.match(/AURICRUX:\s*(.+)/i);
      return m ? m[1].trim() : "";
    }
    return "";
  } catch {
    return "";
  }
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return false;
  ensureDir(dest);
  fs.cpSync(src, dest, { recursive: true });
  return true;
}

function publishLegacyPages() {
  // Copy legacy UI folders into /public so Vite includes them in dist/ and SWA serves them again.
  const pairs = [
    ["tyler-entry", "public/tyler-entry"],
    ["tyler-status", "public/tyler-status"],
    ["fca-customer-entry", "public/fca-customer-entry"],
    ["fca-customer-status", "public/fca-customer-status"]
  ];

  let copied = 0;
  for (const [src, dest] of pairs) {
    if (copyDir(src, dest)) copied++;
  }

  // Add obvious links on the Home page so you can reach the product UI immediately
  const homePath = "src/pages/website/Home.jsx";
  if (fs.existsSync(homePath)) {
    const home = fs.readFileSync(homePath, "utf-8");
    if (!home.includes("/tyler-entry/")) {
      const injected = home.replace(
        "</p>",
        `</p>
      <div style={{ marginTop: "20px" }}>
        <a href="/tyler-entry/">Open Bid Entry (Product UI)</a>
      </div>
      <div style={{ marginTop: "10px" }}>
        <a href="/tyler-status/">Open Bid Status (Product UI)</a>
      </div>`
      );
      fs.writeFileSync(homePath, injected, "utf-8");
    }
  }

  return { copiedFolders: copied };
}

function writeDigest(lines) {
  ensureDir("auricrux/outputs/digests");
  const stamp = new Date().toISOString().slice(0, 10);
  const file = `auricrux/outputs/digests/daily-${stamp}.md`;
  fs.writeFileSync(file, lines.join("\n") + "\n", "utf-8");
  return file;
}

async function main() {
  const cmd = (process.env.AURICRUX_COMMAND || "").trim() || getCommandFromIssueEvent();
  const digest = [];
  digest.push("# Auricrux Daily Execution Digest");
  digest.push("");
  digest.push(`- Command: ${cmd || "(none)"}`);
  digest.push("");

  // Minimal command set to stop wasting time and restore product immediately
  if (/publish legacy pages|restore ui|restore product ui/i.test(cmd)) {
    const result = publishLegacyPages();
    digest.push("## Execution");
    digest.push(`- Restored legacy product UI into /public (folders copied: ${result.copiedFolders})`);
    digest.push(`- Home links added to /tyler-entry/ and /tyler-status/ (if Home.jsx exists)`);
  } else {
    digest.push("## Execution");
    digest.push("- No build command matched. Use: `AURICRUX: publish legacy pages`");
  }

  const file = writeDigest(digest);
  console.log("AURICRUX_EXEC_COMPLETE");
  console.log("DIGEST_FILE:", file);
}

main().catch((e) => {
  console.error("AURICRUX_EXEC_FAILURE");
  console.error(e);
  process.exit(1);
});
