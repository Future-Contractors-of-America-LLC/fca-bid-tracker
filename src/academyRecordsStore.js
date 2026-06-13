import { academyCatalog } from "./academyCatalog";
import { getProgramProgress, resolveLearnerKey } from "./academyProgressStore";

const STORAGE_KEY = "fca_academy_records_v1";

export const cohortCatalog = [
  {
    cohortId: "COHORT-OPS-2026-SUMMER-A",
    programKey: "ops-core",
    title: "Operations Command Cohort",
    cadence: "Tuesday / Thursday executive seminar",
    startDate: "2026-07-07",
    seatLimit: 24,
    faculty: "Auricrux Executive Faculty",
  },
  {
    cohortId: "COHORT-PRECON-2026-SUMMER-A",
    programKey: "precon-estimating",
    title: "Preconstruction Strategy Cohort",
    cadence: "Monday / Wednesday estimating studio",
    startDate: "2026-07-06",
    seatLimit: 18,
    faculty: "Auricrux Preconstruction Faculty",
  },
  {
    cohortId: "COHORT-CTRL-2026-SUMMER-A",
    programKey: "project-controls",
    title: "Project Controls Governance Cohort",
    cadence: "Wednesday governance lab",
    startDate: "2026-07-08",
    seatLimit: 20,
    faculty: "Auricrux Project Controls Faculty",
  },
  {
    cohortId: "COHORT-FIELD-2026-SUMMER-A",
    programKey: "field-readiness",
    title: "Field Mobilization Cohort",
    cadence: "Friday field-readiness clinic",
    startDate: "2026-07-10",
    seatLimit: 30,
    faculty: "Auricrux Field Readiness Faculty",
  },
];

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStore() {
  if (!canUseStorage()) return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(store) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function getLearnerRecord(session) {
  const store = readStore();
  const learnerKey = resolveLearnerKey(session);
  const learner = store[learnerKey] || {
    cohorts: {},
    credentials: {},
    updatedAt: null,
  };

  return { store, learnerKey, learner };
}

function saveLearnerRecord(session, learner) {
  const { store, learnerKey } = getLearnerRecord(session);
  store[learnerKey] = {
    ...learner,
    updatedAt: new Date().toISOString(),
  };
  writeStore(store);
  return store[learnerKey];
}

export function getProgramCohort(programKey) {
  return cohortCatalog.find((cohort) => cohort.programKey === programKey) || null;
}

export function getCohortEnrollmentStatus(session, cohortId) {
  const { learner } = getLearnerRecord(session);
  return learner.cohorts[cohortId] || null;
}

export function enrollInCohort(session, cohortId) {
  const { learner } = getLearnerRecord(session);
  const cohort = cohortCatalog.find((item) => item.cohortId === cohortId);
  if (!cohort) return null;

  return saveLearnerRecord(session, {
    ...learner,
    cohorts: {
      ...learner.cohorts,
      [cohortId]: {
        status: "enrolled",
        enrolledAt: new Date().toISOString(),
        programKey: cohort.programKey,
        cohortTitle: cohort.title,
      },
    },
  });
}

export function withdrawFromCohort(session, cohortId) {
  const { learner } = getLearnerRecord(session);
  const current = learner.cohorts[cohortId];
  if (!current) return learner;

  return saveLearnerRecord(session, {
    ...learner,
    cohorts: {
      ...learner.cohorts,
      [cohortId]: {
        ...current,
        status: "withdrawn",
        withdrawnAt: new Date().toISOString(),
      },
    },
  });
}

export function getLearnerCohortRecords(session) {
  const { learner } = getLearnerRecord(session);
  return cohortCatalog.map((cohort) => ({
    ...cohort,
    enrollment: learner.cohorts[cohort.cohortId] || null,
  }));
}

export function getIssuedCredential(session, programKey) {
  const { learner } = getLearnerRecord(session);
  return learner.credentials[programKey] || null;
}

export function issueCredential(session, programKey) {
  const program = academyCatalog.programs.find((item) => item.key === programKey);
  if (!program) return null;

  const progress = getProgramProgress(session, programKey);
  if (!progress.credentialReady) return null;

  const { learner } = getLearnerRecord(session);
  const existing = learner.credentials[programKey];
  if (existing) return existing;

  const credential = {
    credentialId: `CRED-${programKey.toUpperCase()}-${Date.now()}`,
    title: program.credential,
    issuedAt: new Date().toISOString(),
    issuer: "Auricrux Academic Control",
    honors: progress.percentComplete === 100 ? "Completed with full pathway completion" : "Completed",
    certificateRoute: `/academy/transcript#${programKey}`,
  };

  saveLearnerRecord(session, {
    ...learner,
    credentials: {
      ...learner.credentials,
      [programKey]: credential,
    },
  });

  return credential;
}

export function buildLearnerTranscript(session) {
  const cohortRecords = getLearnerCohortRecords(session);

  return academyCatalog.programs.map((program) => {
    const progress = getProgramProgress(session, program.key);
    const cohort = cohortRecords.find((item) => item.programKey === program.key) || null;
    const credential = getIssuedCredential(session, program.key);

    return {
      programKey: program.key,
      title: program.title,
      credentialTitle: program.credential,
      completedLessons: progress.completedLessons,
      totalLessons: progress.totalLessons,
      completedCourses: progress.completedCourses,
      totalCourses: progress.totalCourses,
      percentComplete: progress.percentComplete,
      credentialReady: progress.credentialReady,
      cohortTitle: cohort?.title || "No cohort assigned",
      cohortStatus: cohort?.enrollment?.status || "not-enrolled",
      startDate: cohort?.startDate || null,
      issuedCredential: credential,
    };
  });
}

export function buildCredentialLedger(session) {
  const transcript = buildLearnerTranscript(session);
  return transcript.map((entry) => ({
    programKey: entry.programKey,
    title: entry.title,
    credentialTitle: entry.credentialTitle,
    readiness: entry.credentialReady ? "Ready for issuance" : "In progress",
    issuedStatus: entry.issuedCredential ? "Issued" : "Pending",
    issuedCredential: entry.issuedCredential,
    cohortStatus: entry.cohortStatus,
    percentComplete: entry.percentComplete,
  }));
}
