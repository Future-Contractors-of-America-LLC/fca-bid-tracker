import useCustomerSession from "../hooks/useCustomerSession";
import { workspaceContext } from "../systemState";
import { portalCardStyle, portalEyebrowStyle, portalTokens } from "../portalDesignTokens";

const linkStyle = {
  textDecoration: "none",
  background: portalTokens.ink,
  color: "#fff",
  padding: "8px 12px",
  borderRadius: portalTokens.radiusSm,
  fontWeight: 700,
  fontSize: 13,
};

/**
 * Compact signed-in context only. Sign out / Ask Auricrux live in PublicTopNav + Auricrux dock
 * to avoid stacked header redundancy.
 */
export default function CustomerSessionBar({ compact = false }) {
  const { session, isAuthenticated } = useCustomerSession();

  if (!isAuthenticated || !session) return null;

  return (
    <div
      style={{
        ...portalCardStyle,
        marginBottom: compact ? 14 : 18,
        padding: compact ? "10px 14px" : undefined,
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ ...portalEyebrowStyle, marginBottom: compact ? 2 : 6 }}>
          {compact ? session.company : "Signed in"}
        </div>
        {!compact ? (
          <h3 style={{ marginTop: 0, marginBottom: 6, fontSize: "1.125rem" }}>
            {session.workspaceLabel || session.company}
          </h3>
        ) : null}
        <div style={{ color: portalTokens.body, fontSize: 13, lineHeight: 1.45 }}>
          {workspaceContext.currentNextAction}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <a href="/portal/capabilities" style={linkStyle}>All capabilities</a>
        <a href="/portal/profile" style={{
          ...linkStyle,
          background: portalTokens.panel,
          color: portalTokens.ink,
          border: `1px solid ${portalTokens.borderStrong}`,
        }}>How account acts</a>
        <a
          href="/portal/platform"
          style={{
            ...linkStyle,
            background: portalTokens.panel,
            color: portalTokens.ink,
            border: `1px solid ${portalTokens.borderStrong}`,
          }}
        >
          Workspace hub
        </a>
      </div>
    </div>
  );
}
