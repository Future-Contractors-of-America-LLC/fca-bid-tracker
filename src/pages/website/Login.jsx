import { useState } from "react";
import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import FounderJourneyStrip from "../../components/FounderJourneyStrip";
import PublicActionRail from "../../components/PublicActionRail";
import PublicCtaRow from "../../components/PublicCtaRow";
import PublicOperationsStrip from "../../components/PublicOperationsStrip";
import CustomerSessionBar from "../../components/CustomerSessionBar";
import { resolveWorkspaceEntryHref } from "../../customerSession";
import { navigateTo } from "../../navigation";
import useCustomerSession from "../../hooks/useCustomerSession";
import { founderJourneyCtaSets, publicBodyCtaSets, shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import { cardStyle, heroCardStyle, pageShellStyle, responsiveGrid, twoColumnGridStyle } from "../../publicShellStyles";

const fieldStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  marginTop: 8,
  marginBottom: 16,
  boxSizing: "border-box",
};

const moduleStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 14,
  background: "#f8fafc",
};

const submitButtonStyle = {
  textDecoration: "none",
  background: "#111827",
  color: "#fff",
  padding: "12px 16px",
  borderRadius: 10,
  fontWeight: 700,
  border: "none",
  cursor: "pointer",
};

const loginContinuityItems = [
  {
    label: "Entry flow",
    value: "Login now inherits shell continuity",
    detail: "Workspace entry now carries the same operating strip used across the public shell so the handoff into product state feels deliberate.",
  },
  {
    label: "Post-login path",
    value: "Portal, platform, and academy remain visible",
    detail: "The route now keeps downstream workspace destinations obvious before entry rather than hiding the next move behind a generic form feel.",
  },
  {
    label: "Conversion posture",
    value: "Operational walkthrough remains active",
    detail: "This route still supports workspace entry while keeping live dashboard review and rollout guidance accessible.",
  },
];

export default function Login({ requestedPath = "/portal/profile", accessMode = "direct" }) {
  const { session, isAuthenticated, login, logout } = useCustomerSession();
  const [form, setForm] = useState({
    email: session?.email || "workspace@futurecontractorsofamerica.com",
    company: session?.company || "Future Contractors of America Pilot Workspace",
  });
  const [error, setError] = useState("");

  const requestedWorkspaceHref = accessMode === "protected" ? requestedPath : session?.nextHref || "/portal/profile";
  const nextHref = requestedWorkspaceHref?.startsWith("/portal") ? requestedWorkspaceHref : "/portal/profile";
  const liveEntryDetail = accessMode === "protected"
    ? `Customer login is now required to enter ${requestedPath}. Auricrux is preserving continuity so the user lands inside the requested live workspace surface after authentication.`
    : "This route carries the same visual rhythm as the rest of the public shell while keeping the clearest next step focused on entering the FCA workspace and unified platform dashboard.";

  function handleSubmit(event) {
    event.preventDefault();
    const result = login({
      email: form.email,
      company: form.company,
      nextHref,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError("");
    navigateTo(resolveWorkspaceEntryHref(result.session, nextHref));
  }

  function handleResetSession() {
    logout();
    navigateTo("/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Arial", padding: 24 }}>
      <div style={pageShellStyle}>
        <ShellHeader
          eyebrow="Auricrux Guided Entry"
          title="Access FCA Workspace"
          subtitle="This workspace entry routes customers into the unified FCA shell for portal operations, lifecycle visibility, academy continuity, and guided next steps."
          primaryHref={shellHeaderCtaSets.workspace.primaryHref}
          primaryLabel={shellHeaderCtaSets.workspace.primaryLabel}
          secondaryHref={shellHeaderCtaSets.workspace.secondaryHref}
          secondaryLabel={shellHeaderCtaSets.workspace.secondaryLabel}
          journey={shellJourney}
          currentJourney="workspace"
        />

        <CustomerSessionBar requestedPath={nextHref} mode="login" />

        <div style={{ ...heroCardStyle, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Workspace continuity</div>
              <h2 style={{ marginTop: 0, marginBottom: 10 }}>Entry now feels like part of the product experience</h2>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              <FcaBrandMark compact />
              <AuricruxBrandMark compact />
            </div>
          </div>
          <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 0 }}>
            {liveEntryDetail}
          </p>
          <PublicCtaRow actions={publicBodyCtaSets.loginWorkspace} />
        </div>

        <FounderJourneyStrip
          currentJourney="workspace"
          title="Workspace login is part of one connected customer journey"
          detail="Login is not a dead-end form. It is the bridge from public entry into portal continuity, academy readiness, and rollout planning."
          ctaHref={founderJourneyCtaSets.workspace.href}
          ctaLabel={founderJourneyCtaSets.workspace.label}
        />

        <div style={{ marginBottom: 24 }}>
          <PublicOperationsStrip
            eyebrow="Workspace continuity strip"
            title="Login now behaves like a guided handoff into the working shell"
            detail="The entry route now shares the same continuity strip used across the public conversion shell so customers can see the operating path before entering FCA."
            statusLabel="Entry posture"
            statusValue="Workspace handoff active"
            items={loginContinuityItems}
            primaryHref={isAuthenticated ? nextHref : "/login"}
            primaryLabel={isAuthenticated ? "Open Active Workspace" : "Open Login Portal"}
            secondaryHref="/portal/platform"
            secondaryLabel="Open Platform Dashboard"
          />
        </div>

        <div style={twoColumnGridStyle}>
          <form style={cardStyle} onSubmit={handleSubmit}>
            <label>Work Email</label>
            <input
              style={fieldStyle}
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />

            <label>Company</label>
            <input
              style={fieldStyle}
              value={form.company}
              onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
            />

            <div style={{ color: "#475569", lineHeight: 1.6, marginBottom: 12 }}>
              This live customer session preserves Auricrux continuity and routes directly into {nextHref} after entry.
            </div>

            {error ? <div style={{ color: "#b91c1c", marginBottom: 12, fontWeight: 700 }}>{error}</div> : null}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <button type="submit" style={submitButtonStyle}>Open Live Customer Workspace</button>
              {isAuthenticated ? (
                <>
                  <a href={nextHref} style={{ ...submitButtonStyle, textDecoration: "none" }}>Open Active Workspace</a>
                  <button type="button" onClick={handleResetSession} style={{ ...submitButtonStyle, background: "#f8fafc", color: "#111827", border: "1px solid #cbd5e1" }}>
                    Reset Session
                  </button>
                </>
              ) : null}
            </div>

            <PublicCtaRow actions={publicBodyCtaSets.loginWorkspace} style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }} />
          </form>

          <div style={{ display: "grid", gap: 16 }}>
            <WorkspaceSnapshotCard
              title="Workspace continuity before login"
              detail="Customers can see that tenant, project, and Auricrux state already exist before entering the portal, reinforcing one continuous operating shell."
              ctaHref="/login"
              ctaLabel="Open Login Portal"
            />

            <div style={{ ...cardStyle, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)" }}>
              <h2 style={{ marginTop: 0 }}>What opens after entry</h2>
              <div style={responsiveGrid(180)}>
                {[
                  ["Projects", "Execution visibility and stage continuity"],
                  ["Bids", "Approval queue and pipeline context"],
                  ["Files", "Bid packages, permits, and onboarding docs"],
                  ["Messages", "Auricrux-guided customer communications"],
                  ["Billing", "Invoice readiness and account follow-through"],
                  ["Academy", "Workforce training continuity"],
                ].map(([title, detail]) => (
                  <div key={title} style={moduleStyle}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
                    <div style={{ color: "#4b5563", lineHeight: 1.5 }}>{detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <PublicActionRail
          title="Continue into the FCA workspace"
          detail="Login closes with the same shared action rail as the other public routes so workspace entry, platform state, academy continuity, and walkthrough options remain consistently visible."
        />

        <ShellFooter />
      </div>
    </div>
  );
}
