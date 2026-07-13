import { useEffect, useState } from "react";
import PortalShell from "../../components/PortalShell";
import PortalSliceAuricrux from "../../components/portal/PortalSliceAuricrux";
import CustomerProductLaunchpad from "../../components/CustomerProductLaunchpad";
import CustomerCommsLaunchpad from "../../components/CustomerCommsLaunchpad";
import useCustomerSession from "../../hooks/useCustomerSession";
import useCustomerAuthState from "../../hooks/useCustomerAuthState";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import { routeStateOverlays } from "../../systemState";
import { pricingPlanOptions } from "../../pricingPlans";
import { isDemoAccountSource } from "../../config/authSources";
import { ACCOUNT_ACTS } from "../../capabilityCatalog";
import { openAuricruxAssistant } from "../../auricruxAssistant";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const accessCardStyle = {
  ...cardStyle,
  display: "grid",
  gap: 12,
};

const toggleButtonStyle = {
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
  background: "#f8fafc",
  color: "#0f172a",
};

const formInputStyle = {
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "10px 12px",
  font: "inherit",
  color: "#0f172a",
  background: "#fff",
};

const planButtonStyle = (active) => ({
  border: active ? "1px solid #1d4ed8" : "1px solid #cbd5e1",
  borderRadius: 12,
  padding: 14,
  background: active ? "#eff6ff" : "#fff",
  color: "#0f172a",
  cursor: "pointer",
  textAlign: "left",
  font: "inherit",
});

const commsCards = [
  { key: "chat", title: "Chat", description: "Text-first coordination across customer, project, and operator lanes.", href: "/portal/messages#chat", ctaLabel: "Open Chat Lane" },
  { key: "sms", title: "SMS", description: "Short-form field escalation and rapid customer recovery.", href: "/portal/messages#sms", ctaLabel: "Open SMS Lane" },
  { key: "phone", title: "Phone", description: "Urgent live coordination and issue resolution.", href: "/portal/messages#phone", ctaLabel: "Open Phone Lane" },
  { key: "email", title: "Email", description: "Commercial, billing, and document continuity.", href: "/portal/messages#email", ctaLabel: "Open Email Lane" },
  { key: "teams", title: "Teams", description: "Structured collaboration across internal and external operations.", href: "/portal/messages#teams", ctaLabel: "Open Teams Lane" },
  { key: "conference", title: "Conference", description: "Executive and project multi-party review sessions.", href: "/portal/messages#conference", ctaLabel: "Open Conference Lane" },
  { key: "lecture", title: "Lecture", description: "Academy-led instruction and rollout delivery.", href: "/portal/messages#lecture", ctaLabel: "Open Lecture Lane" },
];

function resolveAccountSecurityLabel(accountSource, authBoundary) {
  if (authBoundary?.activeMode === "managed-server-session") return "Enterprise sign-in active";
  if (accountSource === "api" || accountSource === "server-session") return "Signed in securely";
  if (isDemoAccountSource(accountSource)) return "Demo workspace";
  return "Signed in";
}

function resolveVerificationLabel(authBoundary) {
  if (authBoundary?.activeMode === "managed-server-session") return "Password plus verification for sensitive actions";
  return "Password sign-in; verification required for banking and billing";
}

export default function PortalProfile() {
  const { session, isAuthenticated, setProductAccess, setCommsAccess, applyPlanPreset, updateSession } = useCustomerSession();
  const { state, refreshSyncStamp } = useWorkspaceState();
  const { state: authState } = useCustomerAuthState();

  useEffect(() => {
    refreshSyncStamp("Persisted customer profile state active");
  }, [refreshSyncStamp]);

  const sessionCompany = session?.company || state.tenant.name;
  const sessionEmail = session?.email || state.meta.customerSessionEmail || "workspace@futurecontractorsofamerica.com";
  const sessionWorkspace = session?.workspaceLabel || state.meta.customerWorkspaceLabel || `${sessionCompany} Workspace`;
  const sessionLogin = session?.lastLoginAt || state.meta.lastSyncedAt || "Pending first authenticated entry";
  const workspaceRole = session?.role || "Owner / Admin";
  const enabledProducts = session?.enabledProducts || { saas: true, lms: true, auricrux: true };
  const enabledComms = session?.enabledComms || { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: true };
  const customerId = session?.customerId || "CUST-FCA-LIVE-001";
  const selectedPlan = session?.selectedPlan || "startup";
  const accountSource = session?.accountSource || "workspace-shell";
  const securityStatus = resolveAccountSecurityLabel(accountSource, authState.authBoundary);
  const verificationStatus = resolveVerificationLabel(authState.authBoundary);
  const profile = session?.profile || {};
  const companySettings = session?.companySettings || {};
  const brandSkin = session?.brandSkin || {};
  const [profileDraft, setProfileDraft] = useState({
    fullName: "",
    title: "",
    phone: "",
    companyName: "",
    workspaceLabel: "",
    supportEmail: "",
    supportPhone: "",
    website: "",
    brandCompanyName: "",
    welcomeMessage: "",
    accent: "#1d4ed8",
    surface: "#eff6ff",
    primaryColor: "#1d4ed8",
    secondaryColor: "#eff6ff",
    dashboardLayout: "balanced",
  });
  const [profileMessage, setProfileMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setProfileDraft({
      fullName: profile.fullName || "",
      title: profile.title || workspaceRole,
      phone: profile.phone || "",
      companyName: sessionCompany,
      workspaceLabel: sessionWorkspace,
      supportEmail: companySettings.supportEmail || sessionEmail,
      supportPhone: companySettings.phone || "",
      website: companySettings.website || "",
      brandCompanyName: brandSkin.companyName || sessionCompany,
      welcomeMessage: brandSkin.welcomeMessage || "Welcome to your FCA workspace.",
      accent: brandSkin.accent || "#1d4ed8",
      surface: brandSkin.surface || "#eff6ff",
      primaryColor: brandSkin.primaryColor || brandSkin.accent || "#1d4ed8",
      secondaryColor: brandSkin.secondaryColor || brandSkin.surface || "#eff6ff",
      dashboardLayout: brandSkin.dashboardLayout || "balanced",
    });
  }, [
    profile.fullName,
    profile.title,
    profile.phone,
    workspaceRole,
    sessionCompany,
    sessionWorkspace,
    companySettings.supportEmail,
    companySettings.phone,
    companySettings.website,
    sessionEmail,
    brandSkin.companyName,
    brandSkin.welcomeMessage,
    brandSkin.accent,
    brandSkin.surface,
    brandSkin.primaryColor,
    brandSkin.secondaryColor,
    brandSkin.dashboardLayout,
  ]);

  function toggleProduct(productKey, enabled) {
    setProductAccess(productKey, !enabled);
  }

  function toggleComms(channelKey, enabled) {
    setCommsAccess(channelKey, !enabled);
  }

  function handlePlanPreset(planKey) {
    applyPlanPreset(planKey);
  }

  function handleProfileFieldChange(event) {
    const { name, value } = event.target;
    setProfileDraft((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleProfileSave(event) {
    event.preventDefault();
    setSaving(true);
    const normalizedCompanyName = profileDraft.companyName.trim() || sessionCompany;
    const brandPayload = {
      companyName: profileDraft.brandCompanyName.trim() || normalizedCompanyName,
      welcomeMessage: profileDraft.welcomeMessage.trim() || "Welcome to your FCA workspace.",
      accent: profileDraft.accent.trim() || "#1d4ed8",
      surface: profileDraft.surface.trim() || "#eff6ff",
      primaryColor: profileDraft.primaryColor.trim() || profileDraft.accent.trim() || "#1d4ed8",
      secondaryColor: profileDraft.secondaryColor.trim() || profileDraft.surface.trim() || "#eff6ff",
      dashboardLayout: profileDraft.dashboardLayout.trim() || "balanced",
    };

    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("fca_customer_brand_skin_v1", JSON.stringify(brandPayload));
      }
    } catch {
      // best-effort brand skin mirror for pages that still read the legacy key
    }

    const result = await updateSession({
      company: normalizedCompanyName,
      workspaceLabel: profileDraft.workspaceLabel.trim() || `${normalizedCompanyName} Workspace`,
      role: profileDraft.title.trim() || workspaceRole,
      profile: {
        fullName: profileDraft.fullName.trim(),
        title: profileDraft.title.trim(),
        phone: profileDraft.phone.trim(),
      },
      companySettings: {
        supportEmail: profileDraft.supportEmail.trim().toLowerCase(),
        phone: profileDraft.supportPhone.trim(),
        website: profileDraft.website.trim(),
      },
      brandSkin: brandPayload,
    });

    if (!result.ok) {
      setProfileMessage(result.error || "Unable to save profile settings.");
    } else if (result.warning) {
      setProfileMessage(`Saved on this device. ${result.warning}`);
    } else {
      setProfileMessage(`Profile, company, and look settings saved (${result.backingSource || "server"}).`);
    }
    setSaving(false);
  }

  const productCards = [
    {
      key: "saas",
      title: "SaaS access",
      description: "Portal workspace, platform dashboard, bids, files, messages, billing, support, and admin.",
      href: "/portal/platform",
      ctaLabel: "Open SaaS Workspace",
      enabled: enabledProducts.saas,
    },
    {
      key: "lms",
      title: "LMS access",
      description: "Academy continuity, onboarding tracks, safety readiness, and workforce coaching.",
      href: "/academy",
      ctaLabel: "Open Academy / LMS",
      enabled: enabledProducts.lms,
    },
    {
      key: "auricrux",
      title: "Auricrux access",
      description: "Guided next actions, blocker visibility, and continuity across all customer-facing routes.",
      href: "/portal/auricrux",
      ctaLabel: "Open Auricrux",
      enabled: enabledProducts.auricrux,
    },
  ];

  return (
    <PortalShell
      title="How your account acts"
      subtitle="Identity, branding, product entitlements, communications, and security — this profile is how FCA behaves for your company."
      activeHref="/portal/profile"
      currentJourney="lead"
      routeOverlay={routeStateOverlays.overview}
      primaryHref="/portal/capabilities"
      primaryLabel="All capabilities"
    >
      <PortalSliceAuricrux
        title="Auricrux Profile Intelligence"
        targetObjectType="User"
        targetObjectId={session?.email || state?.project?.id || "PROFILE"}
        sourceRoute="/portal/profile"
        rationale="Account identity and entitlements must align with governed workspace posture. Auricrux teaches and automates customization here."
        nextAction="Confirm branding, product access, and communications match how this account should act."
        actionHref="/portal/capabilities"
        actionLabel="Open capability map"
      />

      <div style={{ ...cardStyle, marginBottom: 16, borderLeft: "4px solid #1d4ed8", background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)" }}>
        <div style={{ color: "#1d4ed8", fontWeight: 700, marginBottom: 8 }}>How this account acts</div>
        <p style={{ color: "#475569", lineHeight: 1.65, marginTop: 0 }}>
          Everything below controls how FCA looks, what products open, how you communicate, and which construction capabilities Auricrux can teach and automate for you.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 12 }}>
          {ACCOUNT_ACTS.map((act) => (
            <a key={act.title} href={act.href} style={{ ...cardStyle, marginBottom: 0, textDecoration: "none", color: "inherit", padding: 14 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>{act.title}</div>
              <div style={{ color: "#64748b", fontSize: 13, lineHeight: 1.5 }}>{act.detail}</div>
            </a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a href="/portal/capabilities" style={{ ...toggleButtonStyle, background: "#1d4ed8", color: "#fff", borderColor: "#1d4ed8", textDecoration: "none" }}>
            Open full capability directory
          </a>
          <button
            type="button"
            onClick={() => openAuricruxAssistant("Explain how my account acts — branding, entitlements, communications — then teach me how to customize and automate it.")}
            style={{ ...toggleButtonStyle, cursor: "pointer" }}
          >
            Ask Auricrux to guide customization
          </button>
        </div>
      </div>

      <CustomerProductLaunchpad session={session} title="Product access" />
      <CustomerCommsLaunchpad session={session} title="Communications access" />

      <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)", border: "1px solid #e5d3a1" }}>
        <div style={{ color: "#8a6a14", fontWeight: 700, marginBottom: 8 }}>Account security</div>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Sign-in status:</strong> {securityStatus}</div>
          <div><strong>Verification:</strong> {verificationStatus}</div>
          <div><strong>Session:</strong> {isAuthenticated ? "Active on this device" : "Not signed in"}</div>
        </div>
        <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6, marginBottom: 0, marginTop: 12 }}>
          Web auth is tab-scoped (sessionStorage + httpOnly cookie). Closing the browser clears client auth. Sign out from shared devices using Sign out on the login page. Enterprise SSO is available on request for multi-user teams.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 16 }}>
        <div style={cardStyle}>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Authenticated customer profile</div>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>{sessionWorkspace}</h2>
          <div style={{ color: "#475569", lineHeight: 1.8 }}>
            <div><strong>Customer company:</strong> {sessionCompany}</div>
            <div><strong>Customer ID:</strong> {customerId}</div>
            <div><strong>Customer email:</strong> {sessionEmail}</div>
            <div><strong>Workspace role:</strong> {workspaceRole}</div>
            <div><strong>Profile name:</strong> {profile.fullName || "Not set"}</div>
            <div><strong>Profile phone:</strong> {profile.phone || "Not set"}</div>
            <div><strong>Support contact:</strong> {companySettings.supportEmail || sessionEmail}</div>
            <div><strong>Company phone:</strong> {companySettings.phone || "Not set"}</div>
            <div><strong>Company website:</strong> {companySettings.website || "Not set"}</div>
            <div><strong>Selected plan:</strong> {selectedPlan}</div>
            <div><strong>Account status:</strong> {securityStatus}</div>
            <div><strong>Session status:</strong> {isAuthenticated ? "Signed in" : "Not signed in"}</div>
            <div><strong>Last login:</strong> {sessionLogin}</div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ color: "#8a6a14", fontWeight: 700, marginBottom: 8 }}>Auricrux continuity signal</div>
          <div style={{ color: "#475569", lineHeight: 1.8 }}>
            <div><strong>Next action:</strong> {state.workspace.currentNextAction}</div>
            <div><strong>Current blocker:</strong> {state.auricrux.currentBlocker}</div>
            <div><strong>Recommended move:</strong> {state.auricrux.nextRecommendedAction}</div>
            <div><strong>Project spine:</strong> {state.project.id} · {state.project.stage}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)" }}>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Profile, company, and page look</div>
          <div style={{ color: "#475569", lineHeight: 1.8, marginBottom: 14 }}>
            Update identity and brand look. Saves to the live customer preference store when your session token is present; otherwise this device keeps a local copy.
            {!session?.sessionToken ? " Sign out and sign in again once to enable server-backed preference sync." : ""}
          </div>
          <form onSubmit={handleProfileSave} style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ color: "#334155", fontWeight: 600 }}>Profile name</span>
                <input name="fullName" value={profileDraft.fullName} onChange={handleProfileFieldChange} style={formInputStyle} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ color: "#334155", fontWeight: 600 }}>Profile title / role</span>
                <input name="title" value={profileDraft.title} onChange={handleProfileFieldChange} style={formInputStyle} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ color: "#334155", fontWeight: 600 }}>Profile phone</span>
                <input name="phone" value={profileDraft.phone} onChange={handleProfileFieldChange} style={formInputStyle} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ color: "#334155", fontWeight: 600 }}>Company name</span>
                <input name="companyName" value={profileDraft.companyName} onChange={handleProfileFieldChange} style={formInputStyle} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ color: "#334155", fontWeight: 600 }}>Workspace label</span>
                <input name="workspaceLabel" value={profileDraft.workspaceLabel} onChange={handleProfileFieldChange} style={formInputStyle} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ color: "#334155", fontWeight: 600 }}>Support email</span>
                <input name="supportEmail" type="email" value={profileDraft.supportEmail} onChange={handleProfileFieldChange} style={formInputStyle} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ color: "#334155", fontWeight: 600 }}>Company phone</span>
                <input name="supportPhone" value={profileDraft.supportPhone} onChange={handleProfileFieldChange} style={formInputStyle} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ color: "#334155", fontWeight: 600 }}>Company website</span>
                <input name="website" value={profileDraft.website} onChange={handleProfileFieldChange} style={formInputStyle} />
              </label>
            </div>

            <div style={{ marginTop: 4, padding: 14, borderRadius: 12, border: "1px solid #cbd5e1", background: profileDraft.surface || "#eff6ff" }}>
              <div style={{ color: profileDraft.accent || "#1d4ed8", fontWeight: 700, marginBottom: 8 }}>Workspace look</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ color: "#334155", fontWeight: 600 }}>Brand name</span>
                  <input name="brandCompanyName" value={profileDraft.brandCompanyName} onChange={handleProfileFieldChange} style={formInputStyle} />
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ color: "#334155", fontWeight: 600 }}>Welcome message</span>
                  <input name="welcomeMessage" value={profileDraft.welcomeMessage} onChange={handleProfileFieldChange} style={formInputStyle} />
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ color: "#334155", fontWeight: 600 }}>Accent color</span>
                  <input name="accent" value={profileDraft.accent} onChange={handleProfileFieldChange} style={formInputStyle} placeholder="#1d4ed8" />
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ color: "#334155", fontWeight: 600 }}>Surface color</span>
                  <input name="surface" value={profileDraft.surface} onChange={handleProfileFieldChange} style={formInputStyle} placeholder="#eff6ff" />
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ color: "#334155", fontWeight: 600 }}>Primary color</span>
                  <input name="primaryColor" value={profileDraft.primaryColor} onChange={handleProfileFieldChange} style={formInputStyle} placeholder="#1d4ed8" />
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ color: "#334155", fontWeight: 600 }}>Secondary color</span>
                  <input name="secondaryColor" value={profileDraft.secondaryColor} onChange={handleProfileFieldChange} style={formInputStyle} placeholder="#eff6ff" />
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ color: "#334155", fontWeight: 600 }}>Dashboard layout</span>
                  <select name="dashboardLayout" value={profileDraft.dashboardLayout} onChange={handleProfileFieldChange} style={formInputStyle}>
                    <option value="balanced">Balanced</option>
                    <option value="compact">Compact</option>
                    <option value="dense">Dense</option>
                  </select>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <button type="submit" disabled={saving} style={{ ...toggleButtonStyle, background: "#2563eb", borderColor: "#1d4ed8", color: "#fff", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving..." : "Save profile and look"}
              </button>
              <span style={{ color: "#475569", fontSize: 14 }}>{profileMessage}</span>
            </div>
          </form>
        </div>

        <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)" }}>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Plan-aware customer activation</div>
          <div style={{ color: "#475569", lineHeight: 1.8, marginBottom: 14 }}>
            Apply a plan preset here to enforce commercial-to-product continuity. Plan selection now changes the authenticated customer's default products and communication lanes instead of remaining a website-only promise.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {pricingPlanOptions.map((plan) => (
              <button key={plan.key} type="button" onClick={() => handlePlanPreset(plan.key)} style={planButtonStyle(selectedPlan === plan.key)}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{plan.name}</div>
                <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 6 }}>{plan.price}</div>
                <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700 }}>{plan.billingModel}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)" }}>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Product access</div>
          <div style={{ color: "#475569", lineHeight: 1.8 }}>
            Choose which products and channels are on for your team — workspace, Academy, Auricrux guidance, and messages. Changes apply to your signed-in session immediately.
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 16 }}>
          {productCards.map((product) => (
            <div key={product.key} style={accessCardStyle}>
              <div>
                <div style={{ color: "#6b7280" }}>{product.title}</div>
                <div style={{ fontSize: 22, fontWeight: 700, margin: "6px 0" }}>{product.enabled ? "Enabled" : "Pending"}</div>
                <div style={{ color: "#475569", lineHeight: 1.7 }}>{product.description}</div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a
                  href={product.enabled ? product.href : "/portal/profile"}
                  style={{
                    textDecoration: "none",
                    background: product.enabled ? "#111827" : "#cbd5e1",
                    color: product.enabled ? "#fff" : "#475569",
                    padding: "10px 14px",
                    borderRadius: 10,
                    fontWeight: 700,
                  }}
                >
                  {product.enabled ? product.ctaLabel : `${product.ctaLabel} Unavailable`}
                </a>
                <button type="button" onClick={() => toggleProduct(product.key, product.enabled)} style={toggleButtonStyle}>
                  {product.enabled ? "Disable Access" : "Enable Access"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {commsCards.map((channel) => {
            const enabled = enabledComms[channel.key] !== false;
            return (
              <div key={channel.key} style={accessCardStyle}>
                <div>
                  <div style={{ color: "#6b7280" }}>{channel.title}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, margin: "6px 0" }}>{enabled ? "Enabled" : "Pending"}</div>
                  <div style={{ color: "#475569", lineHeight: 1.7 }}>{channel.description}</div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a
                    href={enabled ? channel.href : "/portal/profile"}
                    style={{
                      textDecoration: "none",
                      background: enabled ? "#0f766e" : "#cbd5e1",
                      color: enabled ? "#fff" : "#475569",
                      padding: "10px 14px",
                      borderRadius: 10,
                      fontWeight: 700,
                    }}
                  >
                    {enabled ? channel.ctaLabel : `${channel.ctaLabel} Unavailable`}
                  </a>
                  <button type="button" onClick={() => toggleComms(channel.key, enabled)} style={toggleButtonStyle}>
                    {enabled ? "Disable Lane" : "Enable Lane"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PortalShell>
  );
}
