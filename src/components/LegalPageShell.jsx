import ShellHeader from "./ShellHeader";
import ShellFooter from "./ShellFooter";
import LegalRelatedNav from "./LegalRelatedNav";
import { shellJourney } from "../websiteShell";
import { pageShellStyle, cardStyle } from "../publicShellStyles";

export default function LegalPageShell({ title, eyebrow, currentHref, children }) {
  return (
    <div style={pageShellStyle}>
      <ShellHeader
        eyebrow={eyebrow}
        title={title}
        subtitle="Future Contractors of America — legal, privacy, and trust policies"
        primaryHref="/pricing"
        primaryLabel="View Plans"
        secondaryHref="/legal"
        secondaryLabel="Legal Center"
        journey={shellJourney}
        currentJourney="conversion"
      />
      <div style={{ ...cardStyle, marginTop: 24, lineHeight: 1.8, color: "#334155" }}>
        {children}
        {currentHref ? <LegalRelatedNav currentHref={currentHref} /> : null}
      </div>
      <ShellFooter />
    </div>
  );
}
