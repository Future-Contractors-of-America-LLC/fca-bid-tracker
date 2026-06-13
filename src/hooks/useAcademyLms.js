import { useEffect, useMemo, useState } from "react";
import { fetchAcademyLms, mutateAcademyLms } from "../api/academyClient";
import { appendAutomationLog } from "../sessionAutomationLog";
import { appendCommercialLog } from "../sessionCommercialLog";

function buildFallbackState() {
  return {
    learners: [],
    enrollments: [],
    certificates: [],
    lessonProgress: [],
    summary: {
      learnerCount: 0,
      activeEnrollmentCount: 0,
      completedEnrollmentCount: 0,
      issuedCertificateCount: 0,
      startedLessonCount: 0,
      completedLessonCount: 0,
      updatedAt: null,
    },
    backingSource: "unavailable",
  };
}

export default function useAcademyLms() {
  const [academyState, setAcademyState] = useState(buildFallbackState);
  const [meta, setMeta] = useState({ backingSource: "unavailable", persistenceState: "Academy API pending", lastSyncedAt: null });

  useEffect(() => {
    let active = true;
    async function hydrate() {
      try {
        const payload = await fetchAcademyLms();
        if (!active) return;
        setAcademyState(payload);
        setMeta({ backingSource: payload.backingSource || "api-academy-store", persistenceState: "API academy LMS spine active", lastSyncedAt: new Date().toISOString() });
      } catch {
        if (!active) return;
        setAcademyState(buildFallbackState());
        setMeta({ backingSource: "unavailable", persistenceState: "Academy API unavailable", lastSyncedAt: null });
      }
    }
    hydrate();
    return () => { active = false; };
  }, []);

  return useMemo(() => ({
    academyState,
    meta,
    async assignProgram(learnerId, programKey, coach = "Auricrux") {
      const payload = await mutateAcademyLms("assign-program", { learnerId, programKey, coach });
      setAcademyState(payload);
      setMeta({ backingSource: payload.backingSource || "api-academy-store", persistenceState: "API academy assignment active", lastSyncedAt: new Date().toISOString() });
      appendAutomationLog({ type: "academy-assignment", title: `${learnerId} assigned to ${programKey}`, detail: `Auricrux assigned ${learnerId} into ${programKey} and preserved workforce continuity.`, route: "/academy" });
      appendCommercialLog({ type: "academy-assignment", title: `${learnerId} assignment activated`, detail: `Academy assignment now supports project readiness and customer delivery continuity.`, route: "/academy" });
      return payload;
    },
    async advanceProgress(enrollmentId, progressDelta = 20, nextLesson = "Advance next module") {
      const payload = await mutateAcademyLms("advance-progress", { enrollmentId, progressDelta, nextLesson });
      setAcademyState(payload);
      setMeta({ backingSource: payload.backingSource || "api-academy-store", persistenceState: "API academy progress active", lastSyncedAt: new Date().toISOString() });
      appendAutomationLog({ type: "academy-progress", title: `${enrollmentId} progressed`, detail: `Auricrux advanced academy progress for ${enrollmentId}.`, route: "/academy" });
      appendCommercialLog({ type: "academy-progress", title: `${enrollmentId} learner progress advanced`, detail: `Learner progress now supports mobilization and readiness continuity.`, route: "/academy" });
      return payload;
    },
    async withdrawEnrollment(enrollmentId) {
      const payload = await mutateAcademyLms("withdraw-enrollment", { enrollmentId });
      setAcademyState(payload);
      setMeta({ backingSource: payload.backingSource || "api-academy-store", persistenceState: "API academy withdrawal active", lastSyncedAt: new Date().toISOString() });
      appendAutomationLog({ type: "academy-withdrawal", title: `${enrollmentId} withdrawn`, detail: `Auricrux withdrew the enrollment and preserved audit continuity.`, route: "/academy/transcript" });
      appendCommercialLog({ type: "academy-withdrawal", title: `${enrollmentId} withdrawn from pathway`, detail: `Enrollment withdrawal was preserved through the Academy API so customer readiness state remains truthful.`, route: "/academy/transcript" });
      return payload;
    },
    async issueCertificate(enrollmentId) {
      const payload = await mutateAcademyLms("issue-certificate", { enrollmentId });
      setAcademyState(payload);
      setMeta({ backingSource: payload.backingSource || "api-academy-store", persistenceState: "API academy certificate issuance active", lastSyncedAt: new Date().toISOString() });
      appendAutomationLog({ type: "academy-certificate", title: `${enrollmentId} certificate issued`, detail: `Auricrux issued the completion credential for ${enrollmentId}.`, route: "/academy" });
      appendCommercialLog({ type: "academy-certificate", title: `${enrollmentId} credential issued`, detail: `Credential issuance now reinforces customer trust and workforce readiness continuity.`, route: "/academy" });
      return payload;
    },
    async startLesson(enrollmentId, programKey, courseKey, lessonKey) {
      const payload = await mutateAcademyLms("start-lesson", { enrollmentId, programKey, courseKey, lessonKey });
      setAcademyState(payload);
      setMeta({ backingSource: payload.backingSource || "api-academy-store", persistenceState: "API lesson progression active", lastSyncedAt: new Date().toISOString() });
      appendAutomationLog({ type: "academy-lesson-start", title: `${lessonKey} started`, detail: `Auricrux recorded lesson-start state for ${courseKey}/${lessonKey}.`, route: "/academy" });
      return payload;
    },
    async completeLesson(enrollmentId, programKey, courseKey, lessonKey, derivedPercent = 0) {
      const payload = await mutateAcademyLms("complete-lesson", { enrollmentId, programKey, courseKey, lessonKey, derivedPercent });
      setAcademyState(payload);
      setMeta({ backingSource: payload.backingSource || "api-academy-store", persistenceState: "API lesson completion active", lastSyncedAt: new Date().toISOString() });
      appendAutomationLog({ type: "academy-lesson-complete", title: `${lessonKey} completed`, detail: `Auricrux recorded lesson completion for ${courseKey}/${lessonKey}.`, route: "/academy" });
      return payload;
    },
  }), [academyState, meta]);
}
