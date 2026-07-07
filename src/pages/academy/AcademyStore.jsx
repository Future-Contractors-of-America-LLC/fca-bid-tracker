import RouteExperienceShell from "../../components/RouteExperienceShell";
import { academyCatalog } from "../../academyCatalog";

const pricedPrograms = academyCatalog.programs.filter((program) => program.pricingMode !== "contact");
const ctePrograms = academyCatalog.programs.filter((program) => program.pricingMode === "contact");

export default function AcademyStore() {
  return (
    <RouteExperienceShell
      eyebrow="FCA Academy Store"
      title="Academy Store for all priced FCA pathways"
      lead="Academy Store includes commercial pricing for non-CTE pathways. CTE programs are enrollment-managed and require direct contact with FCA for teacher and administrator coordination."
      primaryCta={{ href: "/academy/catalog", label: "Open Course Catalog" }}
      secondaryCta={{ href: "/contact?topic=cte", label: "Contact Us for CTE" }}
      proofPoints={[
        { value: `${pricedPrograms.length}`, label: "Priced non-CTE pathways listed" },
        { value: `${ctePrograms.length}`, label: "CTE pathways marked contact-only" },
        { value: "100%", label: "Pathways aligned to catalog and portals" },
      ]}
      cards={[
        ...pricedPrograms.map((program) => ({
          title: `${program.title} · ${program.price || "See details"}`,
          detail: `${program.credential} | ${program.duration} | ${program.format}`,
        })),
        ...ctePrograms.map((program) => ({
          title: `${program.title} · Contact us`,
          detail: "CTE pricing is handled through teacher and administrator rollout planning. Use the CTE contact route for implementation support.",
        })),
      ]}
      sections={[
        {
          title: "Store policy",
          items: [
            "Store pricing is shown for non-CTE pathways only.",
            "CTE pathways route to contact and implementation planning.",
            "All pathways remain available in the Course Catalog without pricing."
          ],
        },
      ]}
    />
  );
}
