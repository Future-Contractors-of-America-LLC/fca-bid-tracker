import LegalPageShell from "../../components/LegalPageShell";
import CookiesContent from "../../legal/content/CookiesContent";

export default function Cookies() {
  return (
    <LegalPageShell title="Cookie Policy" eyebrow="Legal" currentHref="/cookies">
      <CookiesContent />
    </LegalPageShell>
  );
}
