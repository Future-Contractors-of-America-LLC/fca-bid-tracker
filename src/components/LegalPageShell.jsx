import ShellHeader from "./ShellHeader";
import ShellFooter from "./ShellFooter";
import { shellJourney } from "../websiteShell";
import { pageShellStyle, cardStyle } from "../publicShellStyles";

export default function LegalPageShell({ title, eyebrow, children }) {
  return (
    <div style={pageShellStyle}>
      <ShellHeader
        eyebrow={eyebrow}
        title={title}
        subtitle="Future Contractors of America — legal and billing policies"
        primaryHref="/pricing"
        primaryLabel="View Plans"
        secondaryHref="/contact"
        secondaryLabel="Contact"
        journey={shellJourney}
        currentJourney="conversion"
      />
      <div style={{ ...cardStyle, marginTop: 24, lineHeight: 1.8, color: "#334155" }}>{children}</div>
      <ShellFooter />
    </div>
  );
}
