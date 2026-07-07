import RouteExperienceShell from "../../components/RouteExperienceShell";

export default function CteProgramPortal() {
  return (
    <RouteExperienceShell
      eyebrow="CTE Program Portal"
      title="CTE program operations portal"
      lead="CTE Program Portal provides role-based entry for teachers, administrators, substitutes, and students with a shared evidence and pathway framework."
      primaryCta={{ href: "/cte/program", label: "Open CTE Program" }}
      secondaryCta={{ href: "/contact?topic=cte", label: "Contact CTE Team" }}
      proofPoints={[
        { value: "4 roles", label: "Teacher, administrator, substitute, and student login lanes" },
        { value: "1 hub", label: "Unified CTE pathway and evidence operations surface" },
        { value: "Direct", label: "No legacy certification-institute detours" },
      ]}
      cards={[
        {
          title: "Teacher and substitute operations",
          detail: "Manage classroom delivery and continuity coverage while tracking student progress and readiness signals.",
        },
        {
          title: "Administrator controls",
          detail: "Oversee implementation, governance, and cohort posture with route-level continuity insight.",
        },
        {
          title: "Student pathway lane",
          detail: "Students receive direct access into active pathway assignments and completion checkpoints.",
        },
      ]}
    />
  );
}
