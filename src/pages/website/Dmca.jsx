import LegalPageShell from "../../components/LegalPageShell";
import DmcaContent from "../../legal/content/DmcaContent";

export default function Dmca() {
  return (
    <LegalPageShell title="DMCA Copyright Policy" eyebrow="Legal" currentHref="/dmca">
      <DmcaContent />
    </LegalPageShell>
  );
}
