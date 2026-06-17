function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatError(error) {
  if (!error) return "Unknown startup error";
  if (typeof error === "string") return error;

  const parts = [];

  if (error.name) parts.push(error.name);
  if (error.message) parts.push(error.message);

  return parts.join(": ") || "Unknown startup error";
}

function normalizeRuntimeError(candidate) {
  if (!candidate) return null;
  if (typeof candidate === "string") return candidate;
  if (candidate instanceof Error) return candidate;

  if (typeof candidate === "object") {
    if (typeof candidate.reason === "string" || candidate.reason instanceof Error) {
      return candidate.reason;
    }
    if (typeof candidate.message === "string") {
      return candidate.message;
    }
  }

  return null;
}

let recoveryRendered = false;

function renderStartupRecovery(error) {
  if (recoveryRendered) return;

  const root = document.getElementById("root");
  if (!root) return;

  recoveryRendered = true;

  const message = formatError(error);
  const stack = error?.stack ? escapeHtml(error.stack) : "";
  const standalone = typeof window !== "undefined" && window.matchMedia?.("(display-mode: standalone)")?.matches;

  root.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,sans-serif;">
      <div style="width:min(760px,100%);background:#fff;border:1px solid #dbe3ef;border-radius:20px;box-shadow:0 20px 50px rgba(15,23,42,.08);padding:24px;">
        <div style="font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#2563eb;">FCA startup recovery</div>
        <h1 style="margin:12px 0;font-size:28px;line-height:1.2;">The Static Web App hit a startup fault before React finished loading.</h1>
        <p style="margin:0;color:#475569;line-height:1.6;">The shell recovered with a visible diagnostics panel instead of staying on a blank white screen.${standalone ? " Because this is running in installed-app mode, fully close the app and reopen it after the deploy finishes. If the old shell persists, remove and reinstall the app shortcut." : ""}</p>
        <div style="margin-top:16px;border:1px solid #dbe3ef;border-radius:14px;padding:14px;background:#f8fafc;font-family:monospace;font-size:12px;white-space:pre-wrap;word-break:break-word;">${escapeHtml(message)}</div>
        ${stack ? `<details style="margin-top:16px;"><summary style="cursor:pointer;font-weight:700;color:#1d4ed8;">Startup stack trace</summary><div style="margin-top:10px;border:1px solid #dbe3ef;border-radius:14px;padding:14px;background:#f8fafc;font-family:monospace;font-size:11px;white-space:pre-wrap;word-break:break-word;">${stack}</div></details>` : ""}
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px;">
          <a href="/" style="text-decoration:none;background:#2563eb;color:#fff;border-radius:12px;padding:10px 14px;font-weight:700;">Reload home</a>
          <a href="/platform" style="text-decoration:none;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:12px;padding:10px 14px;font-weight:700;">Open platform</a>
          <a href="/login" style="text-decoration:none;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:12px;padding:10px 14px;font-weight:700;">Open login</a>
        </div>
      </div>
    </div>
  `;
}

window.addEventListener("error", (event) => {
  const error = normalizeRuntimeError(event?.error || event);
  if (!error) return;
  renderStartupRecovery(error);
});

window.addEventListener("unhandledrejection", (event) => {
  const error = normalizeRuntimeError(event?.reason || event);
  if (!error) return;
  renderStartupRecovery(error);
});

import("./main.jsx").catch((error) => {
  console.error("FCA startup bootstrap failure", error);
  renderStartupRecovery(error);
});
