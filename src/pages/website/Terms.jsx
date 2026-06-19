import LegalPageShell from "../../components/LegalPageShell";
import TermsContent from "../../legal/content/TermsContent";

export default function Terms() {
  return (
    <LegalPageShell title="Terms of Service" eyebrow="Legal" currentHref="/terms">
      <TermsContent />
    </LegalPageShell>
  );
}
