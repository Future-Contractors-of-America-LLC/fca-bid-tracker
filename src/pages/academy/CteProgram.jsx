import RouteExperienceShell from "../../components/RouteExperienceShell";

export default function CteProgram() {
  return (
    <RouteExperienceShell
      eyebrow="CTE Program"
      title="CTE route now consolidates to one portal"
      lead="CTE uses a single-entry portal model. Continue to the CTE Program Portal and choose your role-specific login there."
      primaryCta={{ href: "/cte/portal", label: "Continue to CTE Program Portal" }}
      secondaryCta={{ href: "/contact?topic=cte", label: "Contact CTE Team" }}
      proofPoints={[
        { value: "Single entry", label: "CTE starts at /cte/portal" },
        { value: "4 roles", label: "Teacher, administrator, substitute, and student access lanes" },
        { value: "Aligned", label: "Program + portal + contact routes are now consistent" },
      ]}
      sections={[
        {
          title: "Where to go next",
          items: [
            { label: "Open CTE Program Portal", href: "/cte/portal" },
            { label: "Open FCA Academy Student Portal", href: "/academy/student-portal" },
            { label: "Contact CTE Team", href: "/contact?topic=cte" },
          ],
        },
      ]}
      cards={[
        {
          title: "CTE model",
          detail: "One portal route, role-based login inside the portal, and no separate legacy CTE destination.",
        },
      ]}
    />
  );
}
