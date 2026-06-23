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
];

function normalizeJobs(rows) {
  return (rows || []).slice(0, 24).map((row, index) => ({
    id: row.id || row.leadId || row.bidId || `JOB-${index + 1}`,
    title: row.title || row.jobBoardTitle || row.projectName || row.company || "Untitled opportunity",
    trade: row.trade || row.jobBoardTrade || row.discipline || row.serviceLine || "General",
    location: row.location || row.jobBoardLocation || row.city || row.market || "United States",
    value: Number(row.value || row.estimatedValue || 0),
    status: row.status || row.jobBoardStatus || row.stage || "new",
    postedAt: row.postedAt || row.createdAt || new Date().toISOString(),
    owner: row.owner || row.company || row.contactName || "FCA network",
  }));
}

function normalizeContractors(rows) {
  return (rows || []).slice(0, 24).map((row, index) => ({
    id: row.id || row.leadId || `CTR-${index + 1}`,
    name: row.name || row.companyName || row.contactName || "FCA contractor",
    trades: Array.isArray(row.trades) ? row.trades : String(row.trades || row.trade || row.jobBoardTrade || "General").split(",").map((part) => part.trim()).filter(Boolean),
    region: row.region || row.location || row.jobBoardLocation || "United States",
    rating: row.rating || row.jobBoardStatus || "Verified",
    openTo: row.openTo || row.notes || "Prime and sub work",
  }));
}

function isProductionHost() {
  if (typeof window === "undefined") return true;
  const host = window.location.hostname || "";
  return !host.includes("localhost") && !host.includes("127.0.0.1");
}

export async function fetchJobBoardJobs() {
  try {
    const response = await centralFetch("/api/leads?view=job-board");
    const payload = await response.json().catch(() => ({}));
    if (response.ok && Array.isArray(payload?.items)) {
      const jobs = normalizeJobs(payload.items);
      return {
        jobs,
        source: jobs.length ? "live" : "empty",
        error: jobs.length ? "" : "No published jobs yet. Post the first opportunity to seed the board.",
      };
    }
    if (isProductionHost()) {
      return { jobs: [], source: "error", error: payload?.error || "Unable to load live job board data." };
    }
    return { jobs: DEMO_JOBS, source: "demo", error: "" };
  } catch (error) {
    if (isProductionHost()) {
      return { jobs: [], source: "error", error: error?.message || "Unable to load live job board data." };
    }
    return { jobs: DEMO_JOBS, source: "demo", error: "" };
  }
}

export async function fetchJobBoardContractors() {
  try {
    const response = await centralFetch("/api/leads?view=contractors");
    const payload = await response.json().catch(() => ({}));
    if (response.ok && Array.isArray(payload?.items)) {
      const contractors = normalizeContractors(payload.items);
      return {
        contractors,
        source: contractors.length ? "live" : "empty",
        error: contractors.length ? "" : "No contractor profiles published yet.",
      };
    }
    if (isProductionHost()) {
      return { contractors: [], source: "error", error: payload?.error || "Unable to load contractor network." };
    }
    return { contractors: DEMO_CONTRACTORS, source: "demo", error: "" };
  } catch (error) {
    if (isProductionHost()) {
      return { contractors: [], source: "error", error: error?.message || "Unable to load contractor network." };
    }
    return { contractors: DEMO_CONTRACTORS, source: "demo", error: "" };
  }
}

export async function postJobBoardOpportunity(body) {
  const response = await centralFetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sourceChannel: "job-board",
      publishToJobBoard: true,
      jobBoardTitle: body.title,
      jobBoardTrade: body.trade,
      jobBoardLocation: body.location,
      estimatedValue: Number(body.value || 0),
      jobBoardStatus: "bidding",
      notes: body.notes || "",
      client: {
        companyName: body.company || body.owner || "FCA network member",
        contactName: body.contactName || body.owner || "FCA network member",
      },
      site: {
        name: body.title,
        city: body.location,
      },
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to publish opportunity.");
  }
  return payload.item;
}
