import RouteExperienceShell from "../../components/RouteExperienceShell";

export default function CteProgramPortal() {
  return (
    <RouteExperienceShell
      eyebrow="CTE Program Portal"
      title="Single-entry CTE portal with role-based login"
      lead="Use one CTE entry point, then route to teacher, administrator, substitute, or student login without duplicate CTE CTAs."
      primaryCta={{ href: "/login?role=cte-teacher&next=/cte/portal#teacher-login", label: "Teacher Login" }}
      secondaryCta={{ href: "/contact?topic=cte", label: "Contact CTE Team" }}
      proofPoints={[
        { value: "1 entry", label: "Single CTE portal route for all roles" },
        { value: "4 roles", label: "Teacher, administrator, substitute, and student login lanes" },
        { value: "Direct", label: "No legacy certification-institute detours" },
      ]}
      cards={[
        {
          title: "Teacher login",
          detail: "Launch curriculum delivery, evidence review, and classroom progression controls.",
          ctaHref: "/login?role=cte-teacher&next=/cte/portal#teacher-login",
          ctaLabel: "Open Teacher Login",
        },
        {
          title: "Administrator login",
          detail: "Open governance controls, implementation posture, and cohort oversight.",
          ctaHref: "/login?role=cte-admin&next=/cte/portal#administrator-login",
          ctaLabel: "Open Administrator Login",
        },
        {
          title: "Substitute login",
          detail: "Access continuity tools and handoff context for active classroom coverage.",
          ctaHref: "/login?role=cte-substitute&next=/cte/portal#substitute-login",
          ctaLabel: "Open Substitute Login",
        },
        {
          title: "Student login",
          detail: "Continue assigned pathway steps, coursework, and completion checkpoints.",
          ctaHref: "/login?role=cte-student&next=/cte/portal#student-login",
          ctaLabel: "Open Student Login",
        },
      ]}
      sections={[
        {
          title: "CTE role and support routes",
          items: [
            { label: "Teacher login", href: "/login?role=cte-teacher&next=/cte/portal#teacher-login" },
            { label: "Administrator login", href: "/login?role=cte-admin&next=/cte/portal#administrator-login" },
            { label: "Substitute login", href: "/login?role=cte-substitute&next=/cte/portal#substitute-login" },
            { label: "Student login", href: "/login?role=cte-student&next=/cte/portal#student-login" },
            { label: "CTE contact for teachers and administrators", href: "/contact?topic=cte" },
            { label: "FCA Academy Student Portal", href: "/academy/student-portal" },
          ],
        },
      ]}
    />
  );
}
