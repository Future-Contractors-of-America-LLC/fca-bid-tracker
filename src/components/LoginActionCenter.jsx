import { resolvePlanPreset } from "../pricingPlans";
import { resolveWorkspaceEntryHref } from "../customerSession";
import { navigateTo } from "../navigation";

const shellStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 16,
  padding: 18,
  background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const cardStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 12,
  padding: 14,
  background: "#fff",
};

const actionButtonStyle = (tone = "primary") => ({
  border: tone === "primary" ? "1px solid #1d4ed8" : "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
  background: tone === "primary" ? "#1d4ed8" : "#fff",
  color: tone === "primary" ? "#fff" : "#0f172a",
  font: "inherit",
});

const launchProfiles = [
  { key: "startup", title: "Launch Startup Customer", role: "Owner / Admin", nextHref: "/portal/platform" },
  { key: "pilot", title: "Launch Pilot Customer", role: "Project Coordinator", nextHref: "/portal" },
  { key: "operations", title: "Launch Operations Customer", role: "Owner / Admin", nextHref: "/portal/messages" },
  { key: "enterprise", title: "Launch Enterprise Customer", role: "Owner / Admin", nextHref: "/portal/admin" },
];

export default function LoginActionCenter({ session, login, requestedPath = "/portal/platform" }) {
  const activePlan = resolvePlanPreset(session?.selectedPlan || "startup");

  function launchProfile(planKey, role, nextHref) {
    const planPreset = resolvePlanPreset(planKey);
    const company = `FCA ${planPreset.name} Login Workspace`;
    const result = login({
      email: `${planKey}-login@futurecontractorsofamerica.com`,
      company,
      role,
      nextHref,
      selectedPlan: planPreset.key,
      enabledProducts: planPreset.enabledProducts,
      enabledComms: planPreset.enabledComms,
    });

    if (!result.ok) return;
    navigateTo(resolveWorkspaceEntryHref(result.session, requestedPath || nextHref));
  }

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Live login action center</div>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Activate a real authenticated workspace from login without filling every field manually</h2>
          <div style={{ color: "#475569", lineHeight: 1.7, maxWidth: 920 }}>
            These controls perform real session activation from the login route using plan-matched product and communications defaults. This reduces friction between conversion, authentication, portal entry, academy continuity, Auricrux access, and revenue-capable workspace activation.
          </div>
        </div>
        <div style={{ ...cardStyle, minWidth: 240 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Active login posture</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{activePlan.name}</div>
          <div style={{ color: "#475569", lineHeight: 1.6 }}>{activePlan.price} · {activePlan.billingModel}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        {launchProfiles.map((profile) => {
          const preset = resolvePlanPreset(profile.key);
          return (
            <div key={profile.key} style={cardStyle}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{preset.name}</div>
              <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>{preset.price}</div>
              <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
                Launch a real authenticated session with plan-default products and comms, then route directly into the best live workspace surface for this profile.
              </div>
              <button type="button" onClick={() => launchProfile(profile.key, profile.role, profile.nextHref)} style={actionButtonStyle(profile.key === "enterprise" ? "secondary" : "primary")}>
                {profile.title}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
