import RouteExperienceShell from "../../components/RouteExperienceShell";

export default function CteProgram() {
  return (
    <RouteExperienceShell
      eyebrow="CTE Pathway"
      title="CTE Program with role-based login routes"
      lead="This CTE pathway replaces legacy single-topic/single-course routing and opens dedicated entry points for teacher, administrator, substitute, and student roles."
      primaryCta={{ href: "/cte/portal", label: "Open CTE Program Portal" }}
      secondaryCta={{ href: "/contact?topic=cte", label: "Contact CTE Team" }}
      proofPoints={[
        { value: "Teacher", label: "Instruction and evidence management login" },
        { value: "Administrator", label: "Program governance and oversight login" },
        { value: "Substitute", label: "Continuity classroom coverage login" },
        { value: "Student", label: "Pathway progression and learning login" },
      ]}
      sections={[
        {
          title: "Role-specific CTE logins",
          items: [
            "Teacher login: /login?role=cte-teacher&next=/cte/program#teacher-login",
            "Administrator login: /login?role=cte-admin&next=/cte/program#administrator-login",
            "Substitute login: /login?role=cte-substitute&next=/cte/program#substitute-login",
            "Student login: /login?role=cte-student&next=/cte/program#student-login"
          ],
        },
      ]}
      cards={[
        {
          title: "Teacher login",
          detail: "Launch curriculum delivery, evidence review, and classroom progression controls.",
        },
        {
          title: "Administrator login",
          detail: "Open governance controls, pathway approvals, and implementation posture review.",
        },
        {
          title: "Substitute login",
          detail: "Access substitute continuity resources and active classroom handoff context.",
        },
        {
          title: "Student login",
          detail: "Continue assigned pathway steps, coursework, and completion checkpoints.",
        },
      ]}
    />
  );
}
