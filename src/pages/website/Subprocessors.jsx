import LegalPageShell from "../../components/LegalPageShell";
import SubprocessorsContent from "../../legal/content/SubprocessorsContent";

export default function Subprocessors() {
  return (
    <LegalPageShell title="Subprocessor List" eyebrow="Trust" currentHref="/subprocessors">
      <SubprocessorsContent />
    </LegalPageShell>
  );
}
