import LegalPageShell from "../../components/LegalPageShell";
import SecurityContent from "../../legal/content/SecurityContent";

export default function Security() {
  return (
    <LegalPageShell title="Security" eyebrow="Trust" currentHref="/security">
      <SecurityContent />
    </LegalPageShell>
  );
}
