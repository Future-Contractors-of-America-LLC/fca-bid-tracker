import { academyCatalog } from "./_lib/academyCatalog.js";

const STORE_KEY = "__FCA_ACADEMY_LMS_STORE__";
const DEFAULT_TENANT_ID = "TEN-FCA-001";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function seedLearners() {
  return [
    {
      learnerId: "LRN-001",
      fullName: "Jordan Mercer",
      role: "Project Coordinator",
      assignedProjectId: "A-117",
      assignedProgramKey: "project-controls",
      status: "Active",
      progressPercent: 42,
      certificateStatus: "In Progress",
      lastActivityAt: nowIso(),
    },
    {
      learnerId: "LRN-002",
      fullName: "Sofia Bennett",
      role: "Estimator",
      assignedProjectId: "A-117",
      assignedProgramKey: "precon-estimating",
      status: "Active",
      progressPercent: 67,
      certificateStatus: "In Progress",
      lastActivityAt: nowIso(),
    },
    {
      learnerId: "LRN-003",
      fullName: "Marcus Hale",
      role: "Field Operations",
      assignedProjectId: "B-204",
      assignedProgramKey: "field-readiness",
      status: "Ready for Assignment",
      progressPercent: 0,
      certificateStatus: "Not Started",
      lastActivityAt: null,
    },
  ];
}

function seedEnrollments() {
  return [
    {
      enrollmentId: "ENR-001",
      learnerId: "LRN-001",
      programKey: "project-controls",
      programTitle: "Project Controls and Document Governance",
      status: "Active",
      progressPercent: 42,
      completedModules: 2,
      totalModules: 5,
      nextLesson: "RFI and submittal simulation",
      coach: "Auricrux",
      assignedAt: nowIso(),
      completedAt: null,
      credentialTitle: "Project Controls Certificate",
    },
    {
      enrollmentId: "ENR-002",
      learnerId: "LRN-002",
      programKey: "precon-estimating",
      programTitle: "Estimating and Preconstruction Readiness",
      status: "Active",
      progressPercent: 67,
      completedModules: 4,
      totalModules: 6,
      nextLesson: "Vendor leveling drill",
      coach: "Auricrux",
      assignedAt: nowIso(),
      completedAt: null,
      credentialTitle: "Preconstruction Readiness Certificate",
    },
    {
      enrollmentId: "ENR-003",
      learnerId: "LRN-003",
      programKey: "field-readiness",
      programTitle: "Field Safety and Mobilization Readiness",
      status: "Assigned",
      progressPercent: 0,
      completedModules: 0,
      totalModules: 3,
      nextLesson: "Mobilization and safety kickoff",
      coach: "Auricrux",
      assignedAt: nowIso(),
      completedAt: null,
      credentialTitle: "Field Readiness Badge",
    },
  ];
}

function seedCertificates() {
  return [];
}

function getProgram(programKey) {
  return academyCatalog.programs.find((program) => program.key === programKey) || null;
}

function getCredential(programKey) {
  const program = getProgram(programKey);
  if (!program) return null;
  return academyCatalog.credentials.find((credential) => credential.title === program.credential) || null;
}

function getStore() {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = {
      tenants: {
        [DEFAULT_TENANT_ID]: {
          learners: seedLearners(),
          enrollments: seedEnrollments(),
          certificates: seedCertificates(),
          updatedAt: nowIso(),
        },
      },
    };
  }
  return globalThis[STORE_KEY];
}

function getTenantStore(tenantId = DEFAULT_TENANT_ID) {
  const store = getStore();
  const key = tenantId || DEFAULT_TENANT_ID;
  if (!store.tenants[key]) {
    store.tenants[key] = {
      learners: seedLearners(),
      enrollments: seedEnrollments(),
      certificates: seedCertificates(),
      updatedAt: nowIso(),
    };
  }
  return store.tenants[key];
}

function refreshLearnerSnapshot(tenantStore, learnerId) {
  const learner = tenantStore.learners.find((item) => item.learnerId === learnerId);
  if (!learner) return;
  const enrollment = tenantStore.enrollments.find((item) => item.learnerId === learnerId);
  if (!enrollment) return;
  learner.assignedProgramKey = enrollment.programKey;
  learner.progressPercent = enrollment.progressPercent;
  learner.status = enrollment.status === "Completed" ? "Completed" : enrollment.status;
  learner.certificateStatus = tenantStore.certificates.some((item) => item.learnerId === learnerId && item.programKey === enrollment.programKey && item.status === "Issued") ? "Issued" : enrollment.status === "Completed" ? "Ready to Issue" : "In Progress";
  learner.lastActivityAt = nowIso();
}

export function getAcademySnapshot(tenantId) {
  const tenantStore = getTenantStore(tenantId);
  return clone({
    learners: tenantStore.learners,
    enrollments: tenantStore.enrollments,
    certificates: tenantStore.certificates,
    catalog: academyCatalog,
    summary: {
      learnerCount: tenantStore.learners.length,
      activeEnrollmentCount: tenantStore.enrollments.filter((item) => item.status === "Active" || item.status === "Assigned").length,
      completedEnrollmentCount: tenantStore.enrollments.filter((item) => item.status === "Completed").length,
      issuedCertificateCount: tenantStore.certificates.filter((item) => item.status === "Issued").length,
      updatedAt: tenantStore.updatedAt,
    },
  });
}

export function mutateAcademy(tenantId, action, payload = {}) {
  const tenantStore = getTenantStore(tenantId);

  switch (action) {
    case "assign-program": {
      const learner = tenantStore.learners.find((item) => item.learnerId === payload.learnerId);
      const program = getProgram(payload.programKey);
      if (!learner) throw new Error(`Learner not found: ${payload.learnerId}`);
      if (!program) throw new Error(`Program not found: ${payload.programKey}`);
      const existing = tenantStore.enrollments.find((item) => item.learnerId === learner.learnerId && item.programKey === program.key);
      if (existing) {
        existing.status = existing.progressPercent > 0 ? "Active" : "Assigned";
        existing.coach = payload.coach || existing.coach || "Auricrux";
        existing.assignedAt = nowIso();
      } else {
        tenantStore.enrollments.unshift({
          enrollmentId: `ENR-${Date.now()}`,
          learnerId: learner.learnerId,
          programKey: program.key,
          programTitle: program.title,
          status: "Assigned",
          progressPercent: 0,
          completedModules: 0,
          totalModules: Number.parseInt(program.duration, 10) || program.classrooms?.length || 4,
          nextLesson: `Begin ${program.title}`,
          coach: payload.coach || "Auricrux",
          assignedAt: nowIso(),
          completedAt: null,
          credentialTitle: program.credential,
        });
      }
      refreshLearnerSnapshot(tenantStore, learner.learnerId);
      tenantStore.updatedAt = nowIso();
      return getAcademySnapshot(tenantId);
    }
    case "advance-progress": {
      const enrollment = tenantStore.enrollments.find((item) => item.enrollmentId === payload.enrollmentId);
      if (!enrollment) throw new Error(`Enrollment not found: ${payload.enrollmentId}`);
      const nextPercent = typeof payload.progressPercent === "number"
        ? payload.progressPercent
        : Math.min(100, Math.max(0, enrollment.progressPercent + (payload.progressDelta || 15)));
      enrollment.progressPercent = nextPercent;
      enrollment.status = nextPercent >= 100 ? "Completed" : "Active";
      enrollment.completedModules = Math.min(enrollment.totalModules, Math.max(enrollment.completedModules, Math.round((nextPercent / 100) * enrollment.totalModules)));
      enrollment.completedAt = nextPercent >= 100 ? nowIso() : null;
      enrollment.nextLesson = nextPercent >= 100 ? "Completion review" : payload.nextLesson || enrollment.nextLesson;
      refreshLearnerSnapshot(tenantStore, enrollment.learnerId);
      tenantStore.updatedAt = nowIso();
      return getAcademySnapshot(tenantId);
    }
    case "issue-certificate": {
      const enrollment = tenantStore.enrollments.find((item) => item.enrollmentId === payload.enrollmentId);
      if (!enrollment) throw new Error(`Enrollment not found: ${payload.enrollmentId}`);
      enrollment.status = "Completed";
      enrollment.progressPercent = 100;
      enrollment.completedModules = enrollment.totalModules;
      enrollment.completedAt = enrollment.completedAt || nowIso();
      const credential = getCredential(enrollment.programKey);
      const existing = tenantStore.certificates.find((item) => item.learnerId === enrollment.learnerId && item.programKey === enrollment.programKey);
      if (existing) {
        existing.status = "Issued";
        existing.issuedAt = nowIso();
      } else {
        tenantStore.certificates.unshift({
          certificateId: `CERT-${Date.now()}`,
          learnerId: enrollment.learnerId,
          programKey: enrollment.programKey,
          title: enrollment.credentialTitle,
          status: "Issued",
          issuedAt: nowIso(),
          renewal: credential?.renewal || "Annual renewal",
        });
      }
      refreshLearnerSnapshot(tenantStore, enrollment.learnerId);
      tenantStore.updatedAt = nowIso();
      return getAcademySnapshot(tenantId);
    }
    default:
      throw new Error(`Unsupported academy action: ${action}`);
  }
}
