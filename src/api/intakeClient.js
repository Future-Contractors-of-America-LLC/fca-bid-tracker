import { centralFetch } from "./backendBase";

function planValue(plan) {
  if (plan === "pilot") return 2500;
  if (plan === "startup") return 99;
  return 249;
}

export function checkoutUrlForPlan(plan, clientReferenceId) {
  const backend = typeof window !== "undefined" ? window.FCA_BACKEND : null;
  const pilot = backend?.pilotCheckout || "https://buy.stripe.com/bJe14o0fQ5Pn8Tt7Bw5gc01";
  const startup = backend?.startupCheckout || "";
  const ref = encodeURIComponent(clientReferenceId || "");
  const joiner = (url) => (url.includes("?") ? "&" : "?") + `client_reference_id=${ref}`;

  if (plan === "pilot") return `${pilot}${joiner(pilot)}`;
  if (plan === "startup" && startup) return `${startup}${joiner(startup)}`;
  return null;
}

export async function submitIntakeBid(record) {
  const response = await centralFetch("/api/bids", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      company: record.company,
      projectName: `${record.company} - ${record.plan}`,
      contactName: record.name,
      contactEmail: record.email,
      value: planValue(record.plan),
      status: "new",
      intakeId: record.intakeId,
      source: "fca-web-intake",
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to save intake to backend.");
  }
  return payload;
}

export function saveCustomerRecord(record) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("fca_customer_record", JSON.stringify(record));
    const payload = encodeURIComponent(JSON.stringify(record));
    const base = `fca_customer_record=${payload}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = base;
    if ((window.location.hostname || "").includes("futurecontractorsofamerica.com")) {
      document.cookie = `${base}; domain=.futurecontractorsofamerica.com`;
    }
  } catch {
    // best effort only
  }
}

export function readCustomerRecord() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("fca_customer_record");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
