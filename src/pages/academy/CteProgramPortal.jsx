import RouteExperienceShell from "../../components/RouteExperienceShell";

export default function CteProgramPortal() {
  return (
    <RouteExperienceShell
      eyebrow="CTE Program Portal"
      title="CTE program portal with role-based access"
      lead="This is the single CTE route. Teachers, administrators, substitutes, and students all enter from this portal with role-specific login paths and isolated CTE program operations."
      primaryCta={{ href: "/login?role=cte-teacher&next=/cte/portal#teacher-login", label: "Enter CTE Portal" }}
      proofPoints={[
        { value: "4 roles", label: "Teacher, administrator, substitute, and student login lanes" },
        { value: "1 route", label: "Single CTE portal entrypoint for all roles" },
        { value: "Isolated", label: "CTE experience separated from live production flows" },
      ]}
      cards={[
        {
          title: "Teacher login",
          detail: "Open /login?role=cte-teacher&next=/cte/portal#teacher-login for instructional delivery and evidence review.",
        },
        {
          title: "Administrator login",
          detail: "Open /login?role=cte-admin&next=/cte/portal#administrator-login for governance, compliance, and program controls.",
        },
        {
          title: "Substitute login",
          detail: "Open /login?role=cte-substitute&next=/cte/portal#substitute-login for continuity coverage and class handoff support.",
        },
        {
          title: "Student login",
          detail: "Open /login?role=cte-student&next=/cte/portal#student-login for pathway progression and coursework completion.",
        },
      ]}
    />
  );
}
