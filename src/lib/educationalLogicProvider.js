import { readCteSafeProfile } from "./cteSafeModeConfig";

export const VDOE_COURSE_REGISTRY = [
  {
    code: "8515",
    title: "Building Trades I",
    pathway: "Construction",
    credentialTarget: "OSHA 10-Hour Card",
  },
  {
    code: "8516",
    title: "Building Trades II",
    pathway: "Construction",
    credentialTarget: "Workplace Readiness Skills",
  },
  {
    code: "8437",
    title: "Architectural Drafting I",
    pathway: "DesignPreConstruction",
    credentialTarget: "Drafting Software Certification",
  },
  {
    code: "8533",
    title: "Electricity I",
    pathway: "Construction",
    credentialTarget: "Core Construction Credential",
  },
  {
    code: "8542",
    title: "HVACR I",
    pathway: "MaintenanceOperations",
    credentialTarget: "EPA Section 608",
  },
];

const scenarioRows = [
  {
    trigger: /fall protection|osha|safety|scaffold|ladder/i,
    contextKey: "Osha_Scaffold_Violation",
    response:
      "Access Locked: VDOE safety policy requires a verified 100 percent safety pass for this equipment category before field laboratory activation.",
  },
  {
    trigger: /rfi|question|spec|drawing/i,
    contextKey: "Rfi_Deterministic_Response",
    response:
      "Deterministic RFI Guidance: Review the approved VDOE competency module for code interpretation and submit your evidence package for instructor review.",
  },
  {
    trigger: /electrical|ohm|amp|current|conduit/i,
    contextKey: "Electrical_Ohm_Calculation_Fault",
    response:
      "Auricrux Notice: Circuit assumptions are outside allowed limits for a standard branch circuit. Recheck resistance values against your local curriculum code reference.",
  },
  {
    trigger: /framing|stud|layout|carpentry|measure/i,
    contextKey: "Carpentry_Framing_Layout_Mismatch",
    response:
      "Auricrux Notice: Framing layout does not meet spacing requirements. Verify center spacing and recalculate your cut list before resubmission.",
  },
  {
    trigger: /hvac|refrigerant|pressure|evacuation/i,
    contextKey: "Hvac_Pressure_Test_Fail",
    response:
      "Auricrux Alert: Pressure test conditions are outside the deterministic tolerance profile. Re-run system isolation checks and record instructor-observed evidence.",
  },
  {
    trigger: /draft|scale|title block|viewport|cad/i,
    contextKey: "Drafting_Scale_Mismatch",
    response:
      "Auricrux Alert: Submitted drawing metadata does not match required scale and title block constraints. Correct your sheet profile and re-upload to the plan room.",
  },
];

function resolveCourse(courseCode) {
  return VDOE_COURSE_REGISTRY.find((row) => row.code === courseCode) || VDOE_COURSE_REGISTRY[0];
}

export function resolveDeterministicReply(message = "", context = {}) {
  const text = String(message || "");
  const profile = readCteSafeProfile();
  const courseCode = context.courseCode || profile.courseCode || "8515";
  const course = resolveCourse(courseCode);

  const matched = scenarioRows.find((row) => row.trigger.test(text));
  if (matched) {
    return {
      contextKey: matched.contextKey,
      reply: `${matched.response} Course ${course.code} - ${course.title}.`,
      courseCode: course.code,
      credentialTarget: course.credentialTarget,
    };
  }

  return {
    contextKey: "General_Cte_Guidance",
    reply:
      `Deterministic Guidance: Continue the assigned competency objective for ${course.title}. Submit evidence and wait for instructor approval before final status changes.`,
    courseCode: course.code,
    credentialTarget: course.credentialTarget,
  };
}

export function buildStaticAuricruxMessagePayload({ message, route, context }) {
  const match = resolveDeterministicReply(message, context);
  return {
    ok: true,
    deterministic: true,
    mode: "educational-static-logic",
    poweredByLlm: false,
    operational: false,
    route: route || "/portal/platform",
    reply: match.reply,
    curriculumContext: {
      contextKey: match.contextKey,
      courseCode: match.courseCode,
      credentialTarget: match.credentialTarget,
    },
  };
}

export function buildStaticActionPayload(input = {}) {
  const rationale = input.rationale || "";
  const match = resolveDeterministicReply(rationale, input);
  return {
    ok: true,
    deterministic: true,
    guidance: {
      reply: match.reply,
      contextKey: match.contextKey,
      courseCode: match.courseCode,
    },
    item: {
      id: `cte-static-${Date.now()}`,
      mode: input.mode || "recommend",
      targetObjectType: input.targetObjectType || "LearningObjective",
      targetObjectId: input.targetObjectId || "",
      rationale: input.rationale || "",
      sourceRoute: input.sourceRoute || "/portal/platform",
      createdAt: new Date().toISOString(),
    },
  };
}

export function buildStaticTrainingStatus() {
  const profile = readCteSafeProfile();
  const course = resolveCourse(profile.courseCode || "8515");
  return {
    mode: "educational-static-logic",
    provider: "StaticAuricruxProvider",
    aiInferenceEnabled: false,
    curriculumSource: "local-vdoe-verified-library",
    activeCourse: {
      code: course.code,
      title: course.title,
      credentialTarget: course.credentialTarget,
    },
  };
}
