import RouteExperienceShell from "../../components/RouteExperienceShell";

export default function AcademyStudentPortal() {
  return (
    <RouteExperienceShell
      eyebrow="FCA Academy Student Portal"
      title="Student portal for FCA Academy classrooms"
      lead="Use this portal for learner access to FCA Academy pathways, classroom assignments, progress tracking, and credential milestones."
      primaryCta={{ href: "/login?next=/portal/academy", label: "Student Login" }}
      secondaryCta={{ href: "/academy/catalog", label: "View Course Catalog" }}
      proofPoints={[
        { value: "Learner-first", label: "Student access lane for Academy classes" },
        { value: "Role aware", label: "Separate from the CTE role-specific portal" },
        { value: "Connected", label: "Aligned to FCA workspace continuity" },
      ]}
      cards={[
        {
          title: "Classroom entry",
          detail: "Students can access assigned classes, labs, and checkpoints through one consistent portal lane.",
        },
        {
          title: "Progress visibility",
          detail: "Completion status, learning sequence, and credential readiness remain visible throughout the pathway.",
        },
      ]}
    />
  );
}
