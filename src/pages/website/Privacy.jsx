import LegalPageShell from "../../components/LegalPageShell";
import PrivacyContent from "../../legal/content/PrivacyContent";

export default function Privacy() {
  return (
    <LegalPageShell title="Privacy Policy" eyebrow="Legal" currentHref="/privacy">
      <PrivacyContent />
    </LegalPageShell>
  );
}
