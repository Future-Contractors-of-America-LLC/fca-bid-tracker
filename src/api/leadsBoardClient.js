import { centralFetch } from "./backendBase";

const DEMO_JOBS = [
  {
    id: "JOB-2401",
    title: "Commercial electrical fit-out — Riverside Medical",
    trade: "Electrical",
    location: "Austin, TX",
    value: 420000,
    status: "bidding",
    postedAt: "2026-06-18T12:00:00Z",
    owner: "Riverside Health Partners",
  },
  {
    id: "JOB-2402",
    title: "Tenant improvement — Union Market Hall",
    trade: "General Contractor",
    location: "Dallas, TX",
    value: 1800000,
    status: "pre-bid",
    postedAt: "2026-06-17T15:30:00Z",
    owner: "Union Market Group",
  },
  {
    id: "JOB-2403",
    title: "Service upgrade — Westlake campus lighting",
    trade: "Electrical",
    location: "Houston, TX",
    value: 96000,
    status: "invited",
    postedAt: "2026-06-16T09:00:00Z",
    owner: "Westlake Properties",
  },
];

const DEMO_CONTRACTORS = [
  {
    id: "CTR-101",
    name: "Lone Star Electric Cooperative",
    trades: ["Electrical", "Low voltage"],
    region: "Central Texas",
    rating: "Preferred",
    openTo: "Prime and sub work",
  },
  {
    id: "CTR-102",
    name: "Summit GC Partners",
    trades: ["General Contractor"],
    region: "DFW",
    rating: "Verified",
    openTo: "Design-build and TI",
  },
  {
    id: "CTR-103",
    name: "Bayou Mechanical Services",
    trades: ["HVAC", "Plumbing"],
    region: "Gulf Coast",
    rating: "Growing",
    openTo: "Subcontract opportunities",
  },
];

function normalizeJobs(payload) {
  const rows = Array.isArray(payload) ? payload : payload?.items || payload?.leads || payload?.bids || [];
  if (!rows.length) return DEMO_JOBS;
  return rows.slice(0, 24).map((row, index) => ({
    id: row.id || row.leadId || row.bidId || `JOB-${index + 1}`,
    title: row.projectName || row.title || row.company || "Untitled opportunity",
    trade: row.trade || row.discipline || row.category || "General",
    location: row.location || row.city || row.market || "United States",
    value: Number(row.value || row.estimatedValue || 0),
    status: row.status || row.stage || "new",
    postedAt: row.createdAt || row.postedAt || new Date().toISOString(),
    owner: row.company || row.contactName || row.owner || "FCA network",
  }));
}

export async function fetchJobBoardJobs() {
  try {
    const response = await centralFetch("/api/leads");
    if (!response.ok) {
      const bidsResponse = await centralFetch("/api/bids");
      if (!bidsResponse.ok) return DEMO_JOBS;
      const bidsPayload = await bidsResponse.json().catch(() => ({}));
      return normalizeJobs(bidsPayload);
    }
    const payload = await response.json().catch(() => ({}));
    return normalizeJobs(payload);
  } catch {
    return DEMO_JOBS;
  }
}

export async function fetchJobBoardContractors() {
  return DEMO_CONTRACTORS;
}
