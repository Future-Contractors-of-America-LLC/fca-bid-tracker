import LegalPageShell from "../../components/LegalPageShell";
import AiPolicyContent from "../../legal/content/AiPolicyContent";

export default function AiPolicy() {
  return (
    <LegalPageShell title="AI Data Use Policy" eyebrow="Trust" currentHref="/ai-policy">
      <AiPolicyContent />
    </LegalPageShell>
  );
}
