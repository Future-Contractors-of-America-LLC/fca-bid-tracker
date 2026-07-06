import { centralFetch } from "./backendBase";
import { isCteSafeModeEnabled } from "../lib/cteSafeModeConfig";
import { buildStaticActionPayload } from "../lib/educationalLogicProvider";
import { enqueueInstructorReview, listInstructorReviewQueue } from "../lib/instructorReviewQueue";

async function readJsonSafe(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function formatApiError(response, payload, fallbackMessage) {
  const statusSuffix = response.status ? ` (status ${response.status})` : "";
  return payload?.error || `${fallbackMessage}${statusSuffix}.`;
}

export async function fetchAuricruxActions() {
  if (isCteSafeModeEnabled()) {
    const queuedItems = await listInstructorReviewQueue({ limit: 30 });
    const queued = queuedItems.slice(0, 30).map((row) => ({
      id: row.id,
      mode: "review",
      targetObjectType: row.targetObjectType || "LearningObjective",
      targetObjectId: row.targetObjectId || "",
      rationale: row.summary || "Pending instructor review",
      sourceRoute: row.sourceRoute || "/portal/auricrux",
      createdAt: row.createdAt,
    }));

    return {
      ok: true,
      deterministic: true,
      items: [
        {
          id: "cte-safe-mode-1",
          mode: "recommend",
          targetObjectType: "LearningObjective",
          targetObjectId: "8515.002",
          rationale: "Complete safety competency evidence and submit for instructor verification.",
          sourceRoute: "/portal/auricrux",
          createdAt: new Date().toISOString(),
        },
        ...queued,
      ],
    };
  }

  const response = await centralFetch("/api/auricrux/actions", { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to load Auricrux actions"));
  }
  return payload;
}

export async function submitAuricruxAction({
  mode,
  targetObjectType,
  targetObjectId,
  capabilityId,
  rationale,
  sourceRoute,
  beforeSnapshotJson,
  afterSnapshotJson,
}) {
  if (isCteSafeModeEnabled()) {
    const payload = buildStaticActionPayload({
      mode,
      targetObjectType,
      targetObjectId,
      rationale,
      sourceRoute,
      courseCode: "8515",
    });

    if (mode === "execute" || mode === "teach") {
      const reviewItem = await enqueueInstructorReview({
        actionType: "auricrux-action",
        sourceRoute,
        targetObjectType,
        targetObjectId,
        summary: `Instructor review required for ${mode} action: ${rationale || capabilityId || targetObjectType}`,
        feedbackPayload: payload?.guidance?.reply || "",
        payload: {
          mode,
          capabilityId,
          beforeSnapshotJson,
          afterSnapshotJson,
        },
      });

      return {
        ...payload,
        pendingReview: true,
        reviewItem,
      };
    }

    return payload;
  }

  const response = await centralFetch("/api/auricrux/actions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode,
      targetObjectType,
      targetObjectId,
      capabilityId,
      rationale,
      sourceRoute,
      beforeSnapshotJson,
      afterSnapshotJson,
    }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to submit Auricrux action"));
  }
  return payload;
}

export async function runBidDoTeachWorkflow({ bidId, sourceRoute, rationale }) {
  const response = await centralFetch("/api/bid-doteach-workflow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bidId,
      sourceRoute: sourceRoute || "/portal/bids",
      executeRationale: rationale,
    }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to run bid Do→Teach workflow"));
  }
  return payload;
}

const campaignExecutionBlueprint = [
  {
    step: "segment-offer-lock",
    mode: "recommend",
    capabilityId: "campaign-segment-offer-lock",
    targetObjectType: "CommercialPipeline",
    rationale: "Define ICP segments and map one concrete offer stack per segment before outbound launch.",
  },
  {
    step: "conversion-spine",
    mode: "execute",
    capabilityId: "campaign-conversion-spine",
    targetObjectType: "CommercialPipeline",
    rationale: "Enforce one conversion spine from campaign source into intake, contact, and checkout continuity.",
  },
  {
    step: "funnel-instrumentation",
    mode: "execute",
    capabilityId: "campaign-funnel-instrumentation",
    targetObjectType: "CommercialPipeline",
    rationale: "Instrument acquisition, conversion, and revenue continuity events for weekly channel decisions.",
  },
  {
    step: "channel-pilot-launch",
    mode: "execute",
    capabilityId: "campaign-pilot-launch",
    targetObjectType: "CommercialPipeline",
    rationale: "Launch paired outbound and inbound campaign lanes with matched message framing.",
  },
  {
    step: "sales-sla-playbook",
    mode: "teach",
    capabilityId: "campaign-sales-sla-playbook",
    targetObjectType: "CommercialPipeline",
    rationale: "Apply first-response SLA, discovery script, and objection handling playbook to live pipeline intake.",
  },
  {
    step: "optimization-loop",
    mode: "recommend",
    capabilityId: "campaign-optimization-loop",
    targetObjectType: "CommercialPipeline",
    rationale: "Publish weekly optimization recommendations based on segment and source performance.",
  },
];

export async function runAuricruxCampaignSequence({
  campaignName = "Auricrux Sales and Marketing Launch",
  sourceRoute = "/portal/auricrux",
  targetObjectId = "campaign-launch",
  segmentKeys = ["electrical", "gc", "specialty"],
} = {}) {
  const results = [];

  for (const blueprintStep of campaignExecutionBlueprint) {
    const response = await submitAuricruxAction({
      mode: blueprintStep.mode,
      capabilityId: blueprintStep.capabilityId,
      targetObjectType: blueprintStep.targetObjectType,
      targetObjectId,
      rationale: `${blueprintStep.rationale} Campaign: ${campaignName}. Segments: ${segmentKeys.join(", ")}.`,
      sourceRoute,
      beforeSnapshotJson: JSON.stringify({
        campaignName,
        segmentKeys,
        step: blueprintStep.step,
        stage: "before",
      }),
      afterSnapshotJson: JSON.stringify({
        campaignName,
        segmentKeys,
        step: blueprintStep.step,
        stage: "after",
      }),
    });

    results.push({
      step: blueprintStep.step,
      mode: blueprintStep.mode,
      capabilityId: blueprintStep.capabilityId,
      ok: Boolean(response?.ok),
      guidance: response?.guidance?.reply || response?.guidance || "",
      response,
    });
  }

  return {
    ok: results.every((item) => item.ok),
    campaignName,
    segmentKeys,
    completedAt: new Date().toISOString(),
    results,
  };
}
