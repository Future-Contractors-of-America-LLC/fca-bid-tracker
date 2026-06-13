import { academyCatalog, getCourseByKey, getProgramByKey } from "./academyCatalog";

const STORAGE_KEY = "fca_academy_progress_v1";

// Quarantined fallback only.
// Packet 048W moves surfaced lesson progression to the Academy API-backed LMS spine.
// This file is retained only as an emergency fallback utility and should not be treated as
// the authoritative product path for transcript, cohort, credential, or surfaced lesson truth.

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

export function resolveLearnerKey(session) {
  return session?.customerId || session?.tenantId || session?.email || "TEN-FCA-001";
}

function getLearnerEntry(session) {
  const store = readStore();
  const learnerKey = resolveLearnerKey(session);
  const learner = store[learnerKey] || { lessons: {}, updatedAt: null };
  return { store, learnerKey, learner };
}

function saveLearnerEntry(session, learner) {
  const { store, learnerKey } = getLearnerEntry(session);
  store[learnerKey] = { ...learner, updatedAt: new Date().toISOString() };
  writeStore(store);
  return store[learnerKey];
}

export function markLessonStarted(session, programKey, courseKey, lessonKey) {
  const { learner } = getLearnerEntry(session);
  const lessonId = `${programKey}:${courseKey}:${lessonKey}`;
  const current = learner.lessons[lessonId] || {};
  return saveLearnerEntry(session, {
    ...learner,
    lessons: {
      ...learner.lessons,
      [lessonId]: { status: current.status === "completed" ? "completed" : "started", startedAt: current.startedAt || new Date().toISOString(), completedAt: current.completedAt || null },
    },
  });
}

export function markLessonCompleted(session, programKey, courseKey, lessonKey) {
  const { learner } = getLearnerEntry(session);
  const lessonId = `${programKey}:${courseKey}:${lessonKey}`;
  const current = learner.lessons[lessonId] || {};
  return saveLearnerEntry(session, {
    ...learner,
    lessons: {
      ...learner.lessons,
      [lessonId]: { status: "completed", startedAt: current.startedAt || new Date().toISOString(), completedAt: new Date().toISOString() },
    },
  });
}

export function getLessonStatus(session, programKey, courseKey, lessonKey) {
  const { learner } = getLearnerEntry(session);
  return learner.lessons[`${programKey}:${courseKey}:${lessonKey}`] || { status: "not-started", startedAt: null, completedAt: null };
}

export function getProgramProgress(session, programKey) {
  const program = getProgramByKey(programKey);
  if (!program) return { completedLessons: 0, totalLessons: 0, completedCourses: 0, totalCourses: 0, percentComplete: 0, credentialReady: false };

  let totalLessons = 0;
  let completedLessons = 0;
  let completedCourses = 0;

  program.courses.forEach((course) => {
    let completedCourseLessons = 0;
    course.lessonsData.forEach((lesson) => {
      totalLessons += 1;
      const status = getLessonStatus(session, programKey, course.key, lesson.key);
      if (status.status === "completed") {
        completedLessons += 1;
        completedCourseLessons += 1;
      }
    });
    if (completedCourseLessons === course.lessonsData.length) completedCourses += 1;
  });

  const percentComplete = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
  return { completedLessons, totalLessons, completedCourses, totalCourses: program.courses.length, percentComplete, credentialReady: completedLessons === totalLessons && totalLessons > 0 };
}

export function getCourseProgress(session, programKey, courseKey) {
  const course = getCourseByKey(programKey, courseKey);
  if (!course) return { completedLessons: 0, totalLessons: 0, percentComplete: 0, completed: false };

  const totalLessons = course.lessonsData.length;
  const completedLessons = course.lessonsData.filter((lesson) => getLessonStatus(session, programKey, courseKey, lesson.key).status === "completed").length;
  return { completedLessons, totalLessons, percentComplete: totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0, completed: completedLessons === totalLessons && totalLessons > 0 };
}

export function resolveTrainingReadinessSnapshot(session, activeProject) {
  const programSnapshots = academyCatalog.programs.map((program) => ({ key: program.key, title: program.title, credential: program.credential, ...getProgramProgress(session, program.key) }));
  const completionAverage = programSnapshots.length ? Math.round(programSnapshots.reduce((sum, item) => sum + item.percentComplete, 0) / programSnapshots.length) : 0;

  let readinessLabel = "Training not started";
  if (completionAverage >= 80) readinessLabel = "Operationally ready";
  else if (completionAverage >= 40) readinessLabel = "Partially ready";
  else if (completionAverage > 0) readinessLabel = "In progress";

  return { tenantLabel: session?.company || session?.workspaceLabel || "FCA Workspace", projectLabel: activeProject?.name || activeProject?.id || "No active project", readinessLabel, completionAverage, programSnapshots };
}
