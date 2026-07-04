/**
 * Live Academy learner workflow simulation (Observe phase 2).
 * Exercises login, catalog, authenticated LMS, progress PATCH, lane probes, commerce intake.
 */
import { ACADEMY_CATALOG_EXPECTED_TOTAL } from "../src/academyDesignSystem.js";
import { requestJson } from "./lib/workflowSimHttp.mjs";
import { resolveSimCredentials } from "./lib/workflowSimCredentials.mjs";

const EXPECTED_LANES = {
  apprenticeship: 207,
  certification: 88,
  degree: 803,
  licensure: 82,
  professional: 23,
  "fca-how-to": 9,
};

/**
 * @param {string} apiBase
 * @param {{ log?: boolean }} [options]
 */
export async function runAcademyLearnerWorkflow(apiBase, options = {}) {
  const log = options.log !== false;
  const steps = [];
  let sessionCookie = "";

  const say = (status, name, detail = "") => {
    steps.push({ name, status, detail, phase: "learner-workflow" });
    if (!log) return;
    if (status === "pass") console.log(`PASS: ${name}${detail ? ` - ${detail}` : ""}`);
    else if (status === "skip") console.log(`SKIP: ${name}${detail ? ` - ${detail}` : ""}`);
    else console.error(`FAIL: ${name}${detail ? ` - ${detail}` : ""}`);
  };

  // --- 1. API health (redundant but explicit for learner phase) ---
  try {
    const health = await requestJson(apiBase, "/api/health");
    if (health.response.ok) say("pass", "Academy API health", apiBase);
    else say("fail", "Academy API health", `HTTP ${health.response.status}`);
  } catch (error) {
    say("fail", "Academy API health", error.message);
  }

  // --- 2. Customer login ---
  const credentials = resolveSimCredentials();
  if (!credentials) {
    say(
      "skip",
      "Academy customer login",
      "Set FCA_SIM_LOGIN_EMAIL/FCA_SIM_LOGIN_PASSWORD or FCA_SIM_ACCOUNTS_FILE (see docs/FOUNDER_PRODUCT_TEST_ACCESS.md)",
    );
  } else {
    try {
      const login = await requestJson(apiBase, "/api/customer-login", {
        method: "POST",
        body: { email: credentials.email, password: credentials.password },
      });

      if (login.response.ok && login.payload?.ok && login.payload?.session?.customer?.email) {
        sessionCookie = login.cookie || sessionCookie;
        const lmsAccess = login.payload?.session?.customer?.productAccess?.lms;
        if (lmsAccess === false) {
          say("fail", "Academy customer login", "account lacks LMS entitlement (lms: false)");
        } else {
          say("pass", "Academy customer login", credentials.email);
        }
      } else if (login.payload?.requiresVerification && login.payload?.challengeId && login.payload?.devVerificationHint) {
        const verify = await requestJson(apiBase, "/api/customer-verify", {
          method: "POST",
          body: { challengeId: login.payload.challengeId, code: login.payload.devVerificationHint },
        });
        if (verify.response.ok && verify.payload?.ok) {
          sessionCookie = verify.cookie || sessionCookie;
          say("pass", "Academy customer login", `${credentials.email} (2FA)`);
        } else {
          say("fail", "Academy customer verify", verify.payload?.error || `HTTP ${verify.response.status}`);
        }
      } else {
        say("fail", "Academy customer login", login.payload?.error || `HTTP ${login.response.status}`);
      }
    } catch (error) {
      say("fail", "Academy customer login", error.message);
    }
  }

  // --- 3. Catalog summary ---
  try {
    const summary = await requestJson(apiBase, "/api/academy-lms?view=summary", { cookie: sessionCookie });
    const total = summary.payload?.catalog?.totalPrograms ?? summary.payload?.catalog?.programs?.length ?? 0;
    const laneCounts = summary.payload?.catalogIntegrity?.laneProgramCounts || summary.payload?.summary?.laneProgramCounts || {};

    if (summary.response.ok && summary.payload?.ok) {
      say("pass", "Academy catalog summary", `${total} programs`);
      if (total !== ACADEMY_CATALOG_EXPECTED_TOTAL) {
        say("fail", "Academy catalog total", `${total} != expected ${ACADEMY_CATALOG_EXPECTED_TOTAL}`);
      } else {
        say("pass", "Academy catalog total", String(total));
      }
      if (summary.payload?.catalogIntegrity?.aligned === false) {
        say("fail", "Academy catalog integrity", "catalogIntegrity.aligned is false");
      } else {
        say("pass", "Academy catalog integrity", "aligned");
      }
      for (const [lane, expected] of Object.entries(EXPECTED_LANES)) {
        const actual = laneCounts[lane];
        if (actual !== expected) {
          say("fail", `Academy lane ${lane}`, `${actual} != expected ${expected}`);
        } else {
          say("pass", `Academy lane ${lane}`, String(actual));
        }
      }
    } else {
      say("fail", "Academy catalog summary", `HTTP ${summary.response.status}`);
    }
  } catch (error) {
    say("fail", "Academy catalog summary", error.message);
  }

  // --- 4. Authenticated LMS snapshot ---
  try {
    const lms = await requestJson(apiBase, "/api/academy-lms", { cookie: sessionCookie });
    if (lms.response.ok && lms.payload?.ok !== false) {
      const learners = lms.payload?.learners?.length ?? 0;
      const enrollments = lms.payload?.enrollments?.length ?? 0;
      say("pass", "Academy LMS snapshot", `${learners} learners, ${enrollments} enrollments`);
    } else if (lms.response.status === 403) {
      say("fail", "Academy LMS snapshot", "HTTP 403 � LMS entitlement missing");
    } else {
      say("fail", "Academy LMS snapshot", `HTTP ${lms.response.status}`);
    }
  } catch (error) {
    say("fail", "Academy LMS snapshot", error.message);
  }

  // --- 5. PATCH advance-progress ---
  try {
    const before = await requestJson(apiBase, "/api/academy-lms", { cookie: sessionCookie });
    const enrollment = before.payload?.enrollments?.find((item) => item.enrollmentId) || before.payload?.enrollments?.[0];
    if (!enrollment?.enrollmentId) {
      say("fail", "Academy progress PATCH", "no enrollment available for mutation test");
    } else {
      const patch = await requestJson(apiBase, "/api/academy-lms", {
        method: "PATCH",
        cookie: sessionCookie,
        body: {
          action: "advance-progress",
          enrollmentId: enrollment.enrollmentId,
          progressDelta: 1,
        },
      });
      if (patch.response.ok && patch.payload?.ok) {
        say("pass", "Academy progress PATCH", enrollment.enrollmentId);
      } else {
        say("fail", "Academy progress PATCH", patch.payload?.error || `HTTP ${patch.response.status}`);
      }
    }
  } catch (error) {
    say("fail", "Academy progress PATCH", error.message);
  }

  // --- 6. Lane-filtered catalog probe ---
  try {
    const laneProbe = await requestJson(apiBase, "/api/academy-lms?view=summary&lane=apprenticeship&limit=1", {
      cookie: sessionCookie,
    });
    const program = laneProbe.payload?.catalog?.programs?.[0];
    if (laneProbe.response.ok && program?.key) {
      say("pass", "Academy lane catalog probe", program.key);
    } else {
      say("fail", "Academy lane catalog probe", "no apprenticeship sample program");
    }
  } catch (error) {
    say("fail", "Academy lane catalog probe", error.message);
  }

  // --- 7. Academy commerce intake ---
  try {
    const intake = await requestJson(apiBase, "/api/fca-payments/intake", {
      method: "POST",
      body: {
        offerKind: "academy-course",
        programKey: "electrical-apprenticeship-level-1",
        email: "lms-sim@futurecontractorsofamerica.com",
        company: "FCA LMS Sim",
      },
    });
    const intakeId = intake.payload?.data?.intake?.intakeId || intake.payload?.intake?.intakeId;
    if (intake.response.ok && intakeId) {
      say("pass", "Academy commerce intake", intakeId);
    } else {
      say("fail", "Academy commerce intake", intake.payload?.error || `HTTP ${intake.response.status}`);
    }
  } catch (error) {
    say("fail", "Academy commerce intake", error.message);
  }

  return { steps, sessionCookie };
}
