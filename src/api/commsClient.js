import { centralFetch } from "./backendBase";

export async function fetchCommsStatus() {
  const response = await centralFetch("/api/auricrux-comms");
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to load communications status.");
  }
  return payload;
}

export async function enqueueTransactionalEmail(message = {}) {
  const response = await centralFetch("/api/auricrux-comms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "enqueue",
      channel: "email",
      subject: message.subject || "FCA workspace update",
      body: message.body || "",
      recipientEmail: message.recipientEmail,
      recipientName: message.recipientName,
      sourceRoute: message.sourceRoute || "/portal/messages",
      metadata: message.metadata || {},
    }),
  });
  const payload = await response.json();
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to queue transactional email.");
  }
  return payload;
}

export async function drainCommsQueue() {
  const response = await centralFetch("/api/auricrux-comms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "drain" }),
  });
  const payload = await response.json();
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to drain communications queue.");
  }
  return payload;
}
