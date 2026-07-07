import RouteExperienceShell from "../../components/RouteExperienceShell";

export default function CteProgramPortal() {
  return (
    <RouteExperienceShell
      eyebrow="CTE Program Portal"
      title="CTE portal with role-based login"
      lead="Use this single portal as the CTE entry point, then continue through dedicated teacher, administrator, substitute, and student sign-in lanes."
      primaryCta={{ href: "/login?role=cte-teacher&next=/cte/portal#teacher", label: "Teacher Login" }}
      secondaryCta={{ href: "/contact?topic=cte", label: "Contact CTE Team" }}
      proofPoints={[
        { value: "1 portal", label: "Single CTE entry route for all roles" },
        { value: "4 roles", label: "Teacher, administrator, substitute, and student login lanes" },
        { value: "Direct", label: "No legacy certification institute detours" },
      ]}
      cards={[
        {
          title: "Teacher login",
          detail: "Manage curriculum delivery, grading evidence, and classroom progression.",
          ctaHref: "/login?role=cte-teacher&next=/cte/portal#teacher",
          ctaLabel: "Open Teacher Login",
        },
        {
          title: "Administrator login",
          detail: "Control program governance, cohorts, and implementation posture.",
          ctaHref: "/login?role=cte-admin&next=/cte/portal#administrator",
          ctaLabel: "Open Administrator Login",
        },
        {
          title: "Substitute login",
          detail: "Access continuity classroom handoff context and substitute coverage tools.",
          ctaHref: "/login?role=cte-substitute&next=/cte/portal#substitute",
          ctaLabel: "Open Substitute Login",
        },
        {
          title: "Student login",
          detail: "Continue assigned pathway work, coursework checkpoints, and progress completion.",
          ctaHref: "/login?role=cte-student&next=/cte/portal#student",
          ctaLabel: "Open Student Login",
        },
      ]}
      sections={[
        {
          title: "CTE route map",
          lead: "This keeps CTE in one portal entry and separates role access only at login.",
          items: [
            { label: "CTE Program Portal (single entry)", href: "/cte/portal" },
            { label: "CTE contact for teachers and administrators", href: "/contact?topic=cte" },
            { label: "FCA Academy Student Portal", href: "/academy/student-portal" },
          ],
        },
      ]}
    />
  );
}
