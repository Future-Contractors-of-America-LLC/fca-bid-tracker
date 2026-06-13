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
  const [meta, setMeta] = useState({
    backingSource: "unavailable",
    persistenceState: "Academy API pending",
    lastSyncedAt: null,
    authoritativeState: false,
    warning: "Academy API has not been verified yet.",
  });
  const [loading, setLoading] = useState(true);
  const [mutationState, setMutationState] = useState({
    activeAction: null,
    lastAction: null,
    error: null,
  });

  useEffect(() => {
    let active = true;
    async function hydrate() {
      setLoading(true);
      try {
        const payload = await fetchAcademyLms();
        if (!active) return;
        setAcademyState(payload);
        setMeta({
          backingSource: payload.backingSource || "api-academy-store",
          persistenceState: "API academy LMS spine active",
          lastSyncedAt: new Date().toISOString(),
          authoritativeState: true,
          warning: null,
        });
      } catch (error) {
        if (!active) return;
        setAcademyState(buildFallbackState());
        setMeta({
          backingSource: "unavailable",
          persistenceState: "Academy API unavailable",
          lastSyncedAt: null,
          authoritativeState: false,
          warning: error?.message || "Academy API unavailable. Authoritative LMS state could not be loaded.",
        });
      } finally {
        if (active) setLoading(false);
      }
    }
    hydrate();
    return () => {
      active = false;
    };
  }, []);

  async function runMutation(actionName, body, successMeta, automationEvent, commercialEvent) {
    setMutationState({ activeAction: actionName, lastAction: mutationState.lastAction, error: null });
    try {
      const payload = await mutateAcademyLms(actionName, body);
      setAcademyState(payload);
      setMeta({
        backingSource: payload.backingSource || "api-academy-store",
        persistenceState: successMeta,
        lastSyncedAt: new Date().toISOString(),
        authoritativeState: true,
        warning: null,
      });
      if (automationEvent) appendAutomationLog(automationEvent);
      if (commercialEvent) appendCommercialLog(commercialEvent);
      setMutationState({ activeAction: null, lastAction: actionName, error: null });
      return { ok: true, payload };
    } catch (error) {
      setMutationState({ activeAction: null, lastAction: actionName, error: error?.message || `Academy action failed: ${actionName}` });
      setMeta((current) => ({
        ...current,
        authoritativeState: current.authoritativeState,
        warning: error?.message || `Academy action failed: ${actionName}`,
      }));
      return { ok: false, error: error?.message || `Academy action failed: ${actionName}` };
    }
  }

  return useMemo(() => ({
    academyState,
    meta,
    loading,
    mutationState,
    async assignProgram(learnerId, programKey, coach = "Auricrux") {
      return runMutation(
        "assign-program",
        { learnerId, programKey, coach },
        "API academy assignment active",
        { type: "academy-assignment", title: `${learnerId} assigned to ${programKey}`, detail: `Auricrux assigned ${learnerId} into ${programKey} and preserved workforce continuity.`, route: "/academy" },
        { type: "academy-assignment", title: `${learnerId} assignment activated`, detail: `Academy assignment now supports project readiness and customer delivery continuity.`, route: "/academy" }
      );
    },
    async advanceProgress(enrollmentId, progressDelta = 20, nextLesson = "Advance next module") {
      return runMutation(
        "advance-progress",
        { enrollmentId, progressDelta, nextLesson },
        "API academy progress active",
        { type: "academy-progress", title: `${enrollmentId} progressed`, detail: `Auricrux advanced academy progress for ${enrollmentId}.`, route: "/academy" },
        { type: "academy-progress", title: `${enrollmentId} learner progress advanced`, detail: `Learner progress now supports mobilization and readiness continuity.`, route: "/academy" }
      );
    },
    async withdrawEnrollment(enrollmentId) {
      return runMutation(
        "withdraw-enrollment",
        { enrollmentId },
        "API academy withdrawal active",
        { type: "academy-withdrawal", title: `${enrollmentId} withdrawn`, detail: `Auricrux withdrew the enrollment and preserved audit continuity.`, route: "/academy/transcript" },
        { type: "academy-withdrawal", title: `${enrollmentId} withdrawn from pathway`, detail: `Enrollment withdrawal was preserved through the Academy API so customer readiness state remains truthful.`, route: "/academy/transcript" }
      );
    },
    async issueCertificate(enrollmentId) {
      return runMutation(
        "issue-certificate",
        { enrollmentId },
        "API academy certificate issuance active",
        { type: "academy-certificate", title: `${enrollmentId} certificate issued`, detail: `Auricrux issued the completion credential for ${enrollmentId}.`, route: "/academy" },
        { type: "academy-certificate", title: `${enrollmentId} credential issued`, detail: `Credential issuance now reinforces customer trust and workforce readiness continuity.`, route: "/academy" }
      );
    },
    async startLesson(enrollmentId, programKey, courseKey, lessonKey) {
      return runMutation(
        "start-lesson",
        { enrollmentId, programKey, courseKey, lessonKey },
        "API lesson progression active",
        { type: "academy-lesson-start", title: `${lessonKey} started`, detail: `Auricrux recorded lesson-start state for ${courseKey}/${lessonKey}.`, route: "/academy" },
        null,
      );
    },
    async completeLesson(enrollmentId, programKey, courseKey, lessonKey, derivedPercent = 0) {
      return runMutation(
        "complete-lesson",
        { enrollmentId, programKey, courseKey, lessonKey, derivedPercent },
        "API lesson completion active",
        { type: "academy-lesson-complete", title: `${lessonKey} completed`, detail: `Auricrux recorded lesson completion for ${courseKey}/${lessonKey}.`, route: "/academy" },
        null,
      );
    },
  }), [academyState, meta, loading, mutationState]);
}
