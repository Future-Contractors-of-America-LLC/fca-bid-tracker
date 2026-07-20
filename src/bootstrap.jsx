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

function errorText(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  return `${error.name || ""} ${error.message || ""} ${error.stack || ""}`;
}

function isChunkLoadError(error) {
  const text = errorText(error).toLowerCase();
  return (
    text.includes("failed to fetch dynamically imported module") ||
    text.includes("error loading dynamically imported module") ||
    text.includes("importing a module script failed") ||
    text.includes("loading chunk") ||
    text.includes("loading css chunk") ||
    /chunkloaderror/i.test(String(error?.name || ""))
  );
}

function isBenignRuntimeNoise(error) {
  const text = errorText(error).toLowerCase();
  // Network/API noise must never replace the public marketing shell.
  if (
    text.includes("failed to fetch") ||
    text.includes("networkerror") ||
    text.includes("load failed") ||
    text.includes("net::err_") ||
    text.includes("aborterror") ||
    text.includes("the user aborted a request") ||
    text.includes("resizeobserver loop") ||
    text.includes("script error.")
  ) {
    return true;
  }
  return false;
}

const CHUNK_RELOAD_KEY = "fca_chunk_reload_v1";

function tryReloadOnceForStaleChunks(error) {
  if (!isChunkLoadError(error) || typeof window === "undefined") {
    return false;
  }

  try {
    if (window.sessionStorage.getItem(CHUNK_RELOAD_KEY) === "1") {
      return false;
    }
    window.sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
  } catch {
    // sessionStorage may be blocked; still attempt a one-shot reload via URL marker.
    if (/(?:^|[?&])fca_chunk_reload=1(?:&|$)/.test(window.location.search || "")) {
      return false;
    }
    const url = new URL(window.location.href);
    url.searchParams.set("fca_chunk_reload", "1");
    window.location.replace(url.toString());
    return true;
  }

  window.location.reload();
  return true;
}

let recoveryRendered = false;
let appBootstrapped = false;

function renderStartupRecovery(error) {
  if (recoveryRendered) return;
  if (tryReloadOnceForStaleChunks(error)) return;

  const root = document.getElementById("root");
  if (!root) return;

  recoveryRendered = true;

  const message = formatError(error);
  const stack = error?.stack ? escapeHtml(error.stack) : "";
  const standalone = typeof window !== "undefined" && window.matchMedia?.("(display-mode: standalone)")?.matches;

  root.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,sans-serif;">
      <div style="width:min(760px,100%);background:#fff;border:1px solid #dbe3ef;border-radius:20px;box-shadow:0 20px 50px rgba(15,23,42,.08);padding:24px;">
        <div style="font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#2563eb;">Future Contractors of America</div>
        <h1 style="margin:12px 0;font-size:28px;line-height:1.2;">This workspace page needs a refresh.</h1>
        <p style="margin:0;color:#475569;line-height:1.6;">
          FCA is an AI-native contractor platform for construction — bids, projects, billing, Academy training, and Auricrux guidance in one live workspace.
          ${standalone ? " If you use the installed app, close it fully and reopen after updates finish." : ""}
        </p>
        <div style="margin-top:16px;border:1px solid #dbe3ef;border-radius:14px;padding:14px;background:#f8fafc;font-family:monospace;font-size:12px;white-space:pre-wrap;word-break:break-word;">${escapeHtml(message)}</div>
        ${stack ? `<details style="margin-top:16px;"><summary style="cursor:pointer;font-weight:700;color:#1d4ed8;">Technical details</summary><div style="margin-top:10px;border:1px solid #dbe3ef;border-radius:14px;padding:14px;background:#f8fafc;font-family:monospace;font-size:11px;white-space:pre-wrap;word-break:break-word;">${stack}</div></details>` : ""}
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px;">
          <a href="/" style="text-decoration:none;background:#2563eb;color:#fff;border-radius:12px;padding:10px 14px;font-weight:700;">Company homepage</a>
          <a href="/platform" style="text-decoration:none;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:12px;padding:10px 14px;font-weight:700;">Platform</a>
          <a href="/pricing" style="text-decoration:none;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:12px;padding:10px 14px;font-weight:700;">Pricing</a>
          <a href="/contact" style="text-decoration:none;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:12px;padding:10px 14px;font-weight:700;">Contact</a>
        </div>
      </div>
    </div>
  `;
}

function handleFatalStartupError(error) {
  const normalized = normalizeRuntimeError(error);
  if (!normalized) return;
  if (isBenignRuntimeNoise(normalized) && !isChunkLoadError(normalized)) {
    console.warn("FCA ignored non-fatal runtime noise", normalized);
    return;
  }
  // After the app has mounted, leave React error boundaries in charge.
  if (appBootstrapped && !isChunkLoadError(normalized)) {
    console.error("FCA post-bootstrap runtime error", normalized);
    return;
  }
  renderStartupRecovery(normalized);
}

window.addEventListener("error", (event) => {
  handleFatalStartupError(event?.error || event);
});

window.addEventListener("unhandledrejection", (event) => {
  handleFatalStartupError(event?.reason || event);
});

import("./main.jsx")
  .then(() => {
    appBootstrapped = true;
    try {
      window.sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    } catch {
      // ignore
    }
  })
  .catch((error) => {
    console.error("FCA startup bootstrap failure", error);
    renderStartupRecovery(error);
  });
