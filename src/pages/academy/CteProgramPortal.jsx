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
        },
        {
          title: "Administrator login",
          detail: "Open governance controls, implementation posture, and cohort oversight.",
        },
        {
          title: "Substitute login",
          detail: "Access continuity tools and handoff context for active classroom coverage.",
        },
        {
          title: "Student login",
          detail: "Continue assigned pathway steps, coursework, and completion checkpoints.",
        },
      ]}
      sections={[
        {
          title: "Role-based login routes",
          items: [
            { label: "Teacher login", href: "/login?role=cte-teacher&next=/cte/portal#teacher-login" },
            { label: "Administrator login", href: "/login?role=cte-admin&next=/cte/portal#administrator-login" },
            { label: "Substitute login", href: "/login?role=cte-substitute&next=/cte/portal#substitute-login" },
            { label: "Student login", href: "/login?role=cte-student&next=/cte/portal#student-login" },
          ],
        },
      ]}
    />
  );
}
