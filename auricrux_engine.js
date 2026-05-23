import fs from "fs";

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function getCommand() {
  // 1) workflow_dispatch input
  const direct = (process.env.AURICRUX_COMMAND || "").trim();
  if (direct) return direct;

  // 2) GitHub Issues: title/body "AURICRUX: <command>"
  try {
    if (process.env.GITHUB_EVENT_NAME !== "issues") return "";
    const payload = readJson(process.env.GITHUB_EVENT_PATH);
    const title = String(payload.issue?.title || "");
    const body = String(payload.issue?.body || "");
    const combined = `${title}\n${body}`;
    const m = combined.match(/AURICRUX:\s*(.+)/i);
    return m ? m[1].trim() : "";
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

function writeDigest(command, lines) {
  ensureDir("auricrux/outputs/digests");
  const stamp = new Date().toISOString().slice(0, 10);
  const file = `auricrux/outputs/digests/daily-${stamp}.md`;

  const out = [
    "# Auricrux Daily Execution Digest",
    "",
    `- Command: ${command || "(none)"}`,
    "",
    ...lines
  ].join("\n") + "\n";

  fs.writeFileSync(file, out, "utf-8");
  return file;
}

function addHomeLinks() {
  const home = "src/pages/website/Home.jsx";
  if (!fs.existsSync(home)) return false;

  const src = fs.readFileSync(home, "utf-8");
  if (src.includes("/tyler-entry/") || src.includes("/tyler-status/")) return true;

  // Inject links right after the first paragraph (safe, deterministic)
  const injected = src.replace(
    "</p>",
    `</p>

      <div style={{ marginTop: "20px" }}>
        /tyler-entry/Open Bid Entry (Product UI)</a>
      </div>
      <div style={{ marginTop: "10px" }}>
        /tyler-status/Open Bid Status (Product UI)</a>
      </div>`
  );

  fs.writeFileSync(home, injected, "utf-8");
  return true;
}

function publishLegacyPages() {
  // These are the folders you built earlier that looked like a product,
  // but Vite stopped deploying them because they are not under /public.
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

  const linked = addHomeLinks();
  return { copied, linked };
}

async function main() {
  const command = getCommand();

  const notes = [];
  if (/publish legacy pages|restore ui|restore product ui/i.test(command)) {
    const r = publishLegacyPages();
    notes.push("## Execution");
    notes.push(`- Restored legacy product UI into /public (folders copied: ${r.copied})`);
    notes.push(`- Added navigation links on Home.jsx: ${r.linked ? "yes" : "no"}`);
    notes.push("");
    notes.push("## Expected Result");
    notes.push("- You can reach the product UI at:");
    notes.push("  - /tyler-entry/");
    notes.push("  - /tyler-status/");
  } else {
    notes.push("## Execution");
    notes.push("- No matching build command.");
    notes.push("- Use one of these exact commands:");
    notes.push("  - AURICRUX: publish legacy pages");
  }

  const digestFile = writeDigest(command, notes);
  console.log("AURICRUX_EXEC_COMPLETE");
  console.log("DIGEST_FILE:", digestFile);
}

main().catch((e) => {
  console.error("AURICRUX_EXEC_FAILURE");
  console.error(e);
  process.exit(1);
});
