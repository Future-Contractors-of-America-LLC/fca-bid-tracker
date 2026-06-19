import LegalPageShell from "../../components/LegalPageShell";
import AcceptableUseContent from "../../legal/content/AcceptableUseContent";

export default function AcceptableUse() {
  return (
    <LegalPageShell title="Acceptable Use Policy" eyebrow="Legal" currentHref="/acceptable-use">
      <AcceptableUseContent />
    </LegalPageShell>
  );
}
