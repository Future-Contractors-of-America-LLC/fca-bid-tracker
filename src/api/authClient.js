import { centralFetch } from "./backendBase";

async function readJsonSafe(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function unavailableError(status) {
  return new Error(
    `Authentication service is temporarily unavailable (HTTP ${status}). ` +
    "Please try again in a moment or use your saved workspace credentials."
  );
}

export async function fetchCustomerAuthState() {
  const response = await centralFetch("/api/customer-auth-state", { method: "GET" });
  if (response.status === 503 || response.status === 502) throw unavailableError(response.status);
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    const statusSuffix = response.status ? ` (status ${response.status})` : "";
    throw new Error(payload?.error || `Unable to load customer auth state${statusSuffix}.`);
  }
  return payload;
}

export async function verifyCustomerLogin({ challengeId, code }) {
  const response = await centralFetch("/api/customer-verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challengeId, code }),
  });
  if (response.status === 503 || response.status === 502) throw unavailableError(response.status);
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Invalid or expired verification code.");
  }
  return payload;
}
