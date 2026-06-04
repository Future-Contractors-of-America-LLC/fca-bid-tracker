import { readCustomerSession } from "../customerSession";
import { publicActionCatalog } from "../websiteShell";

const navShellStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 16,
  background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
  padding: "12px 14px",
  marginBottom: 18,
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const dropdownStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 12,
  background: "#fff",
  minWidth: 180,
  padding: 0,
};

const summaryStyle = {
  listStyle: "none",
  cursor: "pointer",
  padding: "10px 12px",
  fontWeight: 700,
  color: "#111827",
};

const menuLinkStyle = {
  display: "block",
  textDecoration: "none",
  color: "#334155",
  padding: "8px 12px",
  borderTop: "1px solid #eef2f7",
  fontSize: 14,
  lineHeight: 1.5,
};

const actionButtonStyle = {
  textDecoration: "none",
  background: "#111827",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 700,
};

const profileIconStyle = {
  width: 40,
  height: 40,
  borderRadius: 999,
  border: "1px solid #cbd5e1",
  background: "#eff6ff",
  color: "#1d4ed8",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  textDecoration: "none",
};

const navGroups = [
  {
    label: "Explore",
    items: [
      publicActionCatalog.platformOverview,
      publicActionCatalog.auricrux,
      publicActionCatalog.pricing,
    ],
  },
  {
    label: "Workspace",
    items: [
      publicActionCatalog.workspace,
      publicActionCatalog.portal,
      publicActionCatalog.academy,
      publicActionCatalog.platform,
    ],
  },
  {
    label: "Company",
    items: [
      publicActionCatalog.contact,
      publicActionCatalog.walkthrough,
      publicActionCatalog.bidEntry,
      publicActionCatalog.bidStatus,
    ],
  },
];

export default function PublicTopNav() {
  const session = readCustomerSession();
  const profileHref = session?.authenticated ? session.nextHref || "/portal" : "/login";
  const profileLabel = session?.authenticated ? session.company : "Profile";
  const profileInitial = session?.authenticated ? session.company.charAt(0).toUpperCase() : "↗";

  return (
    <div style={navShellStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          {navGroups.map((group) => (
            <details key={group.label} style={dropdownStyle}>
              <summary style={summaryStyle}>{group.label}</summary>
              <div>
                {group.items.map((item) => (
                  <a key={item.href} href={item.href} style={menuLinkStyle}>{item.label}</a>
                ))}
              </div>
            </details>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <a href="/login" style={actionButtonStyle}>{session?.authenticated ? "Switch Workspace" : "Login"}</a>
          <a href={profileHref} style={profileIconStyle} title={profileLabel} aria-label={profileLabel}>{profileInitial}</a>
        </div>
      </div>
    </div>
  );
}
