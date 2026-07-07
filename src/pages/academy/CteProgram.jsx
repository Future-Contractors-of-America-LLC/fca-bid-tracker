import RouteExperienceShell from "../../components/RouteExperienceShell";

export default function CteProgram() {
  return (
    <RouteExperienceShell
      eyebrow="CTE Program Redirect"
      title="CTE Program has moved to a single portal route"
      lead="Use the CTE Program Portal as the single CTE entrypoint. Role-based teacher, administrator, substitute, and student logins now live there."
      primaryCta={{ href: "/cte/portal", label: "Open CTE Program Portal" }}
      proofPoints={[
        { value: "Single route", label: "CTE now starts at /cte/portal" },
        { value: "Role-based", label: "Teacher/admin/substitute/student login lanes" },
      ]}
    />
  );
}
