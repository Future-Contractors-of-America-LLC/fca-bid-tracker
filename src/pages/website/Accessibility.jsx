import LegalPageShell from "../../components/LegalPageShell";
import AccessibilityContent from "../../legal/content/AccessibilityContent";

export default function Accessibility() {
  return (
    <LegalPageShell title="Accessibility Statement" eyebrow="Legal" currentHref="/accessibility">
      <AccessibilityContent />
    </LegalPageShell>
  );
}
