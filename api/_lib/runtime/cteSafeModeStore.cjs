const STORE_KEY = "__FCA_CTE_SAFE_MODE_STORE__";

const VDOE_COURSE_REGISTRY = [
  { code: "8515", title: "Building Trades I", credentialTarget: "OSHA 10-Hour Card" },
  { code: "8516", title: "Building Trades II", credentialTarget: "Workplace Readiness Skills" },
  { code: "8437", title: "Architectural Drafting I", credentialTarget: "Drafting Software Certification" },
  { code: "8533", title: "Electricity I", credentialTarget: "Core Construction Credential" },
  { code: "8542", title: "HVACR I", credentialTarget: "EPA Section 608" },
];

const SCENARIOS = [
  {
    trigger: /fall protection|osha|safety|scaffold|ladder/i,
    contextKey: "Osha_Scaffold_Violation",
    response:
      "Access Locked: VDOE safety policy requires a verified 100 percent safety pass for this category before laboratory activation.",
  },
  {
    trigger: /rfi|question|spec|drawing/i,
    contextKey: "Rfi_Deterministic_Response",
    response:
      "Deterministic RFI Guidance: Review the approved competency module and submit evidence for instructor review.",
  },
  {
    trigger: /electrical|ohm|amp|current|conduit/i,
    contextKey: "Electrical_Ohm_Calculation_Fault",
    response:
      "Auricrux Notice: Circuit assumptions are outside allowed limits. Recheck resistance values against your local code reference.",
  },
  {
    trigger: /framing|stud|layout|carpentry|measure/i,
    contextKey: "Carpentry_Framing_Layout_Mismatch",
    response:
      "Auricrux Notice: Framing layout does not meet spacing requirements. Verify center spacing and recalculate before resubmission.",
  },
  {
    trigger: /hvac|refrigerant|pressure|evacuation/i,
    contextKey: "Hvac_Pressure_Test_Fail",
    response:
      "Auricrux Alert: Pressure test conditions are outside deterministic tolerance. Re-run isolation checks with instructor witness.",
  },
  {
    trigger: /draft|scale|title block|viewport|cad/i,
    contextKey: "Drafting_Scale_Mismatch",
    response:
      "Auricrux Alert: Drawing metadata does not match required scale and title block constraints. Correct and re-upload to the plan room.",
  },
];

function isSafeModeEnabled() {
  const forceLive = String(process.env.FCA_FORCE_LIVE_MODE || "").toLowerCase();
  if (forceLive === "1" || forceLive === "true" || forceLive === "yes") return false;
  const raw = String(process.env.CHHS_SANDBOX || process.env.FCA_SAFE_MODE || "").toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

function getStore() {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = {
      reviewQueue: [],
      actionHistory: [],
      profile: {
        schoolId: process.env.CHS_SCHOOL_ID || "CHHS",
        courseCode: process.env.CHS_COURSE_CODE || "8515",
        instructorId: process.env.CHS_INSTRUCTOR_ID || "sandbox-instructor",
      },
    };
  }
  return globalThis[STORE_KEY];
}

function resolveCourse(code) {
  return VDOE_COURSE_REGISTRY.find((item) => item.code === code) || VDOE_COURSE_REGISTRY[0];
}

function resolveDeterministicReply(message = "", courseCode = "8515") {
  const course = resolveCourse(courseCode);
  const match = SCENARIOS.find((row) => row.trigger.test(String(message || "")));
  if (match) {
    return {
      contextKey: match.contextKey,
      reply: `${match.response} Course ${course.code} - ${course.title}.`,
      course,
    };
  }

  return {
    contextKey: "General_Cte_Guidance",
    reply:
      `Deterministic Guidance: Continue the assigned competency objective for ${course.title}. Submit evidence and wait for instructor approval before final status changes.`,
    course,
  };
}

function listStaticActions() {
  const store = getStore();
  return [
    {
      id: "cte-static-recommend-1",
      mode: "recommend",
      targetObjectType: "LearningObjective",
      targetObjectId: "8515.002",
      rationale: "Review fall-protection competency evidence and submit instructor-ready checklist.",
      sourceRoute: "/portal/auricrux",
      createdAt: new Date().toISOString(),
    },
    ...store.actionHistory.slice(0, 40),
  ];
}

function enqueueInstructorReview(event = {}) {
  const store = getStore();
  const now = new Date().toISOString();
  const item = {
    id: `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: "Pending Review",
    createdAt: now,
    updatedAt: now,
    schoolId: store.profile.schoolId,
    courseCode: event.courseCode || store.profile.courseCode,
    studentId: event.studentId || "cte-student",
    instructorId: store.profile.instructorId,
    actionType: event.actionType || "auricrux-action",
    sourceRoute: event.sourceRoute || "/portal/platform",
    targetObjectType: event.targetObjectType || "Operation",
    targetObjectId: event.targetObjectId || "",
    summary: event.summary || "Student action requires instructor review.",
    feedbackPayload: event.feedbackPayload || "",
    payload: event.payload || {},
    resolution: null,
  };
  store.reviewQueue.unshift(item);
  store.reviewQueue = store.reviewQueue.slice(0, 500);
  return item;
}

function normalizeReviewStatus(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return "";
  if (normalized.includes("pending")) return "Pending Review";
  if (normalized.includes("approved") || normalized.includes("approve")) return "Approved";
  if (normalized.includes("reject") || normalized.includes("denied")) return "Rejected";
  if (normalized.includes("override")) return "Overridden";
  return "";
}

function listInstructorReviewQueue({ limit = 200, status = "" } = {}) {
  const store = getStore();
  const normalizedStatus = normalizeReviewStatus(status);
  const items = normalizedStatus
    ? store.reviewQueue.filter((item) => normalizeReviewStatus(item.status) === normalizedStatus)
    : store.reviewQueue;
  return items.slice(0, Math.max(1, Math.min(Number(limit) || 200, 500)));
}

function resolveInstructorReviewItem(id, resolution = {}) {
  if (!id) {
    return { ok: false, error: "Review item id is required." };
  }

  const store = getStore();
  const index = store.reviewQueue.findIndex((item) => item.id === id);
  if (index < 0) {
    return { ok: false, error: `Review item ${id} was not found.` };
  }

  const decision = normalizeReviewStatus(resolution?.decision || resolution?.status || "");
  if (!decision || decision === "Pending Review") {
    return { ok: false, error: "Resolution decision must be Approved, Rejected, or Overridden." };
  }

  const now = new Date().toISOString();
  const current = store.reviewQueue[index];
  const updated = {
    ...current,
    status: decision,
    updatedAt: now,
    resolution: {
      decision,
      reason: String(resolution?.reason || resolution?.rationale || "").trim(),
      actorId: resolution?.actorId || resolution?.instructorId || current.instructorId || "instructor",
      actorType: resolution?.actorType || "instructor",
      resolvedAt: now,
    },
  };

  store.reviewQueue[index] = updated;
  return { ok: true, item: updated };
}

function buildStaticAuricruxPayload({ message = "", route = "/portal/platform", context = {} } = {}) {
  const store = getStore();
  const match = resolveDeterministicReply(message, context.courseCode || store.profile.courseCode);
  return {
    ok: true,
    deterministic: true,
    poweredByLlm: false,
    mode: "educational-static-logic",
    operational: false,
    route,
    reply: match.reply,
    curriculumContext: {
      contextKey: match.contextKey,
      courseCode: match.course.code,
      credentialTarget: match.course.credentialTarget,
    },
  };
}

function buildStaticAuricruxActionPayload(body = {}) {
  const store = getStore();
  const match = resolveDeterministicReply(body.rationale || "", store.profile.courseCode);

  const item = {
    id: `cte-action-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    mode: body.mode || "recommend",
    targetObjectType: body.targetObjectType || "LearningObjective",
    targetObjectId: body.targetObjectId || "",
    rationale: body.rationale || "",
    sourceRoute: body.sourceRoute || "/portal/auricrux",
    createdAt: new Date().toISOString(),
  };

  store.actionHistory.unshift(item);
  store.actionHistory = store.actionHistory.slice(0, 200);

  const pendingReview = body.mode === "execute" || body.mode === "teach";
  const reviewItem = pendingReview
    ? enqueueInstructorReview({
      actionType: "auricrux-action",
      summary: `Action ${item.mode} queued for instructor approval: ${item.rationale || item.targetObjectType}`,
      payload: item,
    })
    : null;

  return {
    ok: true,
    deterministic: true,
    pendingReview,
    reviewItem,
    guidance: {
      reply: pendingReview
        ? `${match.reply} Instructor approval is required before this action can be finalized.`
        : match.reply,
      contextKey: match.contextKey,
      courseCode: match.course.code,
    },
    item,
  };
}

function buildStaticTrainingPayload() {
  const store = getStore();
  const course = resolveCourse(store.profile.courseCode);
  return {
    ok: true,
    training: {
      mode: "educational-static-logic",
      provider: "StaticAuricruxProvider",
      aiInferenceEnabled: false,
      curriculumSource: "local-vdoe-verified-library",
      activeCourse: {
        code: course.code,
        title: course.title,
        credentialTarget: course.credentialTarget,
      },
    },
  };
}

module.exports = {
  isSafeModeEnabled,
  buildStaticAuricruxPayload,
  buildStaticAuricruxActionPayload,
  buildStaticTrainingPayload,
  listStaticActions,
  enqueueInstructorReview,
  listInstructorReviewQueue,
  resolveInstructorReviewItem,
};
