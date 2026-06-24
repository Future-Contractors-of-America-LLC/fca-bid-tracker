import { centralFetch } from "./backendBase";
import { checkoutPathForTier } from "../commercialOffers.js";

function planValue(plan) {
  if (plan === "pilot") return 2500;
  if (plan === "startup") return 99;
  return 249;
}

export function checkoutUrlForPlan(plan, clientReferenceId, email) {
  return checkoutPathForTier(plan, { ref: clientReferenceId, email });
}

export async function submitIntakeBid(record) {
  const bidPayload = {
    company: record.company,
    projectName: `${record.company} - ${record.plan}`,
    contactName: record.name,
    contactEmail: record.email,
    value: planValue(record.plan),
    status: "new",
    intakeId: record.intakeId,
    source: "fca-web-intake",
  };

  const response = await centralFetch("/api/bids", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bidPayload),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to save intake to backend.");
  }

  const leadId = record.intakeId ? `lead_${record.intakeId}` : undefined;
  try {
    const leadResponse = await centralFetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId,
        sourceChannel: "fca-web-intake",
        sourceBidId: record.intakeId,
        serviceLine: "general-construction",
        projectIntent: record.plan || "commercial",
        sourceRoute: "/intake",
        createdBy: "fca-web-intake",
        client: {
          name: record.company,
          contactName: record.name,
          contactEmail: record.email,
        },
        site: {
          name: `${record.company} - ${record.plan}`,
          estimatedValue: planValue(record.plan),
        },
        notes: `Web intake plan: ${record.plan}`,
      }),
    });
    const leadPayload = await leadResponse.json().catch(() => ({}));
    if (!leadResponse.ok || leadPayload?.ok === false) {
      throw new Error(leadPayload?.error || "Lead mirror failed after bid intake saved.");
    }
  } catch (leadError) {
    throw new Error(
      leadError?.message || "Bid saved but governed lead mirror failed. Review Lead Intelligence.",
    );
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
