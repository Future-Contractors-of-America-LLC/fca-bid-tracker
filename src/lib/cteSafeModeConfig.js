import { VIRGINIA_AC_CTE_COURSES as SOURCE_VIRGINIA_AC_CTE_COURSES } from "../virginiaCteCourses.js";

const SAFE_MODE_STORAGE_KEY = "fca_cte_safe_mode_v1";
const SAFE_MODE_PROFILE_KEY = "fca_cte_profile_v1";

/**
 * Virginia CTE Architecture & Construction course registry.
 * Source: VDOE CTE Resource Center + FCA proposed Building Trades III track.
 * vdoeCourseCode values: confirmed official codes only; null = pending lookup.
 */
export const VIRGINIA_AC_CTE_COURSES = SOURCE_VIRGINIA_AC_CTE_COURSES;

/** Confirmed VDOE course code → FCA course key mapping (only codes we have verified). */
export const VDOE_COURSE_CODE_MAP = Object.fromEntries(
  VIRGINIA_AC_CTE_COURSES.filter((c) => c.vdoeCourseCode).map((c) => [c.vdoeCourseCode, c.key])
);

/** Resolve a course record by VDOE course code or FCA course key. */
export function resolveVirginiaCteCourse(codeOrKey) {
  return (
    VIRGINIA_AC_CTE_COURSES.find((c) => c.key === codeOrKey || c.vdoeCourseCode === codeOrKey) || null
  );
}

function readFlagFromWindow() {
  if (typeof window === "undefined") return false;
  if (window.FCA_CTE_SAFE_MODE === true) return true;
  try {
    return window.localStorage.getItem(SAFE_MODE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function isCteSafeModeEnabled() {
  const forceLive = String(import.meta?.env?.VITE_FCA_FORCE_LIVE_MODE || "").toLowerCase();
  if (forceLive === "1" || forceLive === "true" || forceLive === "yes") return false;
  const envEnabled = String(import.meta?.env?.VITE_CHHS_SANDBOX || "").toLowerCase();
  if (envEnabled === "1" || envEnabled === "true" || envEnabled === "yes") return true;
  return readFlagFromWindow();
}

export function auricruxCampaignLiveReady({ liveEnabled = false } = {}) {
  return liveEnabled && !isCteSafeModeEnabled();
}

export function setCteSafeModeEnabled(enabled) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SAFE_MODE_STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    // best effort only
  }
}

export function readCteSafeProfile() {
  if (typeof window === "undefined") {
    return {
      schoolId: "CHHS",
      courseCode: "8515",
      studentId: "sandbox-student",
      instructorId: "sandbox-instructor",
    };
  }

  try {
    const raw = window.localStorage.getItem(SAFE_MODE_PROFILE_KEY);
    if (!raw) {
      return {
        schoolId: "CHHS",
        courseCode: "8515",
        studentId: "sandbox-student",
        instructorId: "sandbox-instructor",
      };
    }
    const parsed = JSON.parse(raw);
    return {
      schoolId: parsed.schoolId || "CHHS",
      courseCode: parsed.courseCode || "8515",
      studentId: parsed.studentId || "sandbox-student",
      instructorId: parsed.instructorId || "sandbox-instructor",
    };
  } catch {
    return {
      schoolId: "CHHS",
      courseCode: "8515",
      studentId: "sandbox-student",
      instructorId: "sandbox-instructor",
    };
  }
}

export function writeCteSafeProfile(profile = {}) {
  if (typeof window === "undefined") return;
  const current = readCteSafeProfile();
  const next = {
    schoolId: profile.schoolId || current.schoolId,
    courseCode: profile.courseCode || current.courseCode,
    studentId: profile.studentId || current.studentId,
    instructorId: profile.instructorId || current.instructorId,
  };
  try {
    window.localStorage.setItem(SAFE_MODE_PROFILE_KEY, JSON.stringify(next));
  } catch {
    // best effort only
  }
}
