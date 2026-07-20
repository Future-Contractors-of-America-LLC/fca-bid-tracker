import { useEffect, useMemo, useState } from "react";
import PublicTopNav from "../../components/PublicTopNav";
import PublicPackageRouteGroupsPanel from "../../components/PublicPackageRouteGroupsPanel";
import ShellFooter from "../../components/ShellFooter";
import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import ProductIllustration from "../../components/ProductIllustration";
import { filterVisibleActions } from "../../ctaBehavior";
import { publicHomeMessaging } from "../../systemContinuity";
import { websiteMarketReadiness } from "../../websiteMarketReadiness";
import { publicSurfaceLinks } from "../../websiteShell";
import { academyClassrooms, websiteEnterpriseProof } from "../../productBlueprint";
import { brandIdentity } from "../../brandIdentity";
import { isProtectedCustomerRoute, resolveLoginHref } from "../../customerSession";
import { toggleAuricruxAssistant } from "../../auricruxAssistant";
import {
  cardStyle,
  ctaPrimaryStyle,
  ctaSecondaryStyle,
  pageShellStyle,
  responsiveGrid,
} from "../../publicShellStyles";

const heroCtaOnDark = {
  ...ctaPrimaryStyle,
  background: "#fff",
  color: "#0f172a",
  border: "none",
};

const heroCtaSecondaryOnDark = {
  ...ctaSecondaryStyle,
  background: "transparent",
  color: "#e2e8f0",
  border: "1px solid rgba(226, 232, 240, 0.45)",
};

const homeExploreLinks = publicSurfaceLinks.filter((item) => item.key !== "pricing");

const buyerProfiles = {
  executive: {
    key: "executive",
    label: "Owner / Executive",
    headline: "Margin visibility, risk mitigation, and bonding readiness",
    proof: "See margin, exposure, and audit posture in one workspace before issues become claims.",
    kpiLabel: "Focus area",
    kpiValue: "Finance + risk",
    ctaLabel: "Open executive path",
    href: "/portal/finance",
  },
  operations: {
    key: "operations",
    label: "Operations Director",
    headline: "Resource leveling, project velocity, and workflow governance",
    proof: "Unify precon, project controls, field tasks, and closeout in one connected workspace.",
    kpiLabel: "Focus area",
    kpiValue: "Coordination",
    ctaLabel: "Open operations path",
    href: "/portal/operations",
  },
  field: {
    key: "field",
    label: "Field Superintendent",
    headline: "Field logs, punch follow-through, and mobile readiness",
    proof: "Turn fragmented site updates into clear action packets with reliable follow-through.",
    kpiLabel: "Focus area",
    kpiValue: "Field execution",
    ctaLabel: "Open field path",
    href: "/portal/field-tasks",
  },
};

const industryCampaigns = {
  electrical: {
    label: "Electrical contractors",
    headline: "Electrical workflow orchestration with zero signal loss",
    detail: "Coordinate RFIs, prefabrication dependencies, QA hold points, and payment continuity across every electrical package.",
  },
  concrete: {
    label: "Concrete contractors",
    headline: "Concrete execution control from pour plan to closeout",
    detail: "Track sequence constraints, pump windows, weather risk, and field quality records without spreadsheet sprawl.",
  },
  mechanical: {
    label: "Mechanical contractors",
    headline: "Mechanical systems delivery with clear handoffs",
    detail: "Align procurement, install progression, startup checklists, and commissioning evidence in one job workspace.",
  },
};

const academyPathwayHighlights = [
  {
    name: "Safety & foundations",
    role: "Apprentice → crew-ready",
    outcome: "Self-paced safety, documentation, and field communication tracks tied to live workspace routines.",
    roi: "Credential pathways in product",
  },
  {
    name: "Qualification tracks",
    role: "Laborer → specialist",
    outcome: "Role-aligned Academy modules that attach learning to bids, projects, and field execution.",
    roi: "Training inside the job, not beside it",
  },
  {
    name: "Leadership readiness",
    role: "Coordinator → Project Lead",
    outcome: "Governance, escalation, and communication tracks with Auricrux guidance on next steps.",
    roi: "Workforce continuity by design",
  },
];

function readInitialWebsiteState() {
  if (typeof window === "undefined") {
    return {
      role: "executive",
      surface: "/portal/scheduling",
      projects: 6,
      headcount: 12,
      adminHours: 14,
      industry: "",
    };
  }

  const params = new URLSearchParams(window.location.search);
  const storedRole = window.localStorage.getItem("fca_home_role") || "";
  const role = params.get("role") || storedRole || "executive";
  const surface = params.get("surface") || "/portal/scheduling";
  const industry = (params.get("industry") || params.get("utm_industry") || "").toLowerCase();

  const projects = Number(params.get("projects") || "6") || 6;
  const headcount = Number(params.get("headcount") || "12") || 12;
  const adminHours = Number(params.get("adminhrs") || "14") || 14;

  return {
    role: buyerProfiles[role] ? role : "executive",
    surface: ["/portal/scheduling", "/portal/finance", "/portal/field-tasks"].includes(surface) ? surface : "/portal/scheduling",
    projects,
    headcount,
    adminHours,
    industry,
  };
}

function BrandArtBand() {
  const fca = brandIdentity.fca.colors;
  const auricrux = brandIdentity.auricrux.colors;
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 20,
        marginBottom: 48,
        padding: "clamp(28px, 5vw, 48px)",
        background: `linear-gradient(135deg, ${fca.primarySoft} 0%, #fff 45%, ${auricrux.primarySoft} 100%)`,
        border: `1px solid ${fca.primary}22`,
      }}
    >
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
        <FcaBrandMark />
        <AuricruxBrandMark />
      </div>
      <p style={{ position: "relative", marginTop: 20, marginBottom: 0, maxWidth: 640, color: "#475569", lineHeight: 1.7, fontSize: 17 }}>
        FCA is an AI-native contractor platform built for the full job lifecycle. Auricrux is the intelligence layer inside it — able to recommend the next step or carry the action across leads, bids, delivery, billing, and Academy training.
      </p>
    </div>
  );
}

export default function Home() {
  const initialState = useMemo(() => readInitialWebsiteState(), []);
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
  const visibleSurfaceLinks = filterVisibleActions(homeExploreLinks, currentPath);
  const mapPublicHref = (href) => (isProtectedCustomerRoute(href) ? resolveLoginHref(href) : href);
  const [activeBuyer, setActiveBuyer] = useState(initialState.role);
  const [demoSurface, setDemoSurface] = useState(initialState.surface);
  const [projectCount, setProjectCount] = useState(initialState.projects);
  const [headcount, setHeadcount] = useState(initialState.headcount);
  const [weeklyAdminHours, setWeeklyAdminHours] = useState(initialState.adminHours);
  const [industryKey, setIndustryKey] = useState(initialState.industry);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalLog, setTerminalLog] = useState(() => [
    "AURICRUX TERMINAL READY",
    "Type: role executive | role operations | role field | demo finance | industry electrical | walkthrough | ask auricrux | help",
  ]);

  const campaign = useMemo(() => {
    return industryCampaigns[industryKey] || null;
  }, [industryKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("role", activeBuyer);
    params.set("surface", demoSurface);
    params.set("projects", String(projectCount));
    params.set("headcount", String(headcount));
    params.set("adminhrs", String(weeklyAdminHours));

    if (industryKey) {
      params.set("industry", industryKey);
    } else {
      params.delete("industry");
    }

    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash || ""}`;
    window.history.replaceState(null, "", nextUrl);
    window.localStorage.setItem("fca_home_role", activeBuyer);
  }, [activeBuyer, demoSurface, projectCount, headcount, weeklyAdminHours, industryKey]);

  const activeProfile = buyerProfiles[activeBuyer] || buyerProfiles.executive;
  const monthlyWaste = Math.round((Number(projectCount) * Number(weeklyAdminHours) * 4.33 * 82) || 0);

  const walkthroughPrompts = {
    "/portal/scheduling": "Want to see how Auricrux mitigates a two-week delay in under 60 seconds?",
    "/portal/finance": "Want to watch Auricrux detect margin variance and launch a proactive transparency conversation?",
    "/portal/field-tasks": "Want to see how Auricrux converts site noise into prioritized field actions instantly?",
  };

  function runTerminalCommand(rawCommand) {
    const command = String(rawCommand || "").trim().toLowerCase();
    if (!command) return;

    if (command === "help") {
      setTerminalLog((current) => [
        ...current,
        "Commands: role <executive|operations|field>, demo <scheduling|finance|field>, industry <electrical|concrete|mechanical>, calc <projects> <headcount> <adminhrs>, ask auricrux, walkthrough",
      ].slice(-12));
      return;
    }

    if (command.startsWith("role ")) {
      const value = command.replace("role ", "").trim();
      if (buyerProfiles[value]) {
        setActiveBuyer(value);
        setTerminalLog((current) => [...current, `Role lane switched to ${buyerProfiles[value].label}.`].slice(-12));
      }
      return;
    }

    if (command.startsWith("demo ")) {
      const value = command.replace("demo ", "").trim();
      const map = {
        scheduling: "/portal/scheduling",
        finance: "/portal/finance",
        field: "/portal/field-tasks",
      };
      if (map[value]) {
        setDemoSurface(map[value]);
        setTerminalLog((current) => [...current, `Demo context moved to ${value}.`].slice(-12));
      }
      return;
    }

    if (command.startsWith("industry ")) {
      const value = command.replace("industry ", "").trim();
      if (industryCampaigns[value]) {
        setIndustryKey(value);
        setTerminalLog((current) => [...current, `Industry profile set to ${industryCampaigns[value].label}.`].slice(-12));
      }
      return;
    }

    if (command.startsWith("calc ")) {
      const parts = command.replace("calc ", "").split(/\s+/).map(Number);
      if (parts.length >= 3 && parts.every((row) => Number.isFinite(row) && row > 0)) {
        setProjectCount(parts[0]);
        setHeadcount(parts[1]);
        setWeeklyAdminHours(parts[2]);
        setTerminalLog((current) => [...current, "Capacity calculator values updated from terminal command."].slice(-12));
      }
      return;
    }

    if (command === "ask auricrux") {
      toggleAuricruxAssistant();
      setTerminalLog((current) => [...current, "Auricrux assistant opened."].slice(-12));
      return;
    }

    if (command === "walkthrough" || command === "sandbox") {
      if (typeof window !== "undefined") {
        window.location.assign("/contact");
      }
      return;
    }

    setTerminalLog((current) => [...current, `Unknown command: ${rawCommand}`].slice(-12));
  }

  return (
    <div style={{ ...pageShellStyle, background: "#ffffff", minHeight: "100vh", paddingTop: 0, maxWidth: "none", margin: 0, width: "100%" }}>
      <PublicTopNav />

      <section
        style={{
          background: "linear-gradient(165deg, #0f172a 0%, #1e3a5f 42%, #0f172a 100%)",
          padding: "clamp(48px, 8vw, 88px) clamp(20px, 4vw, 40px)",
          marginBottom: 0,
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 32, marginBottom: 32 }}>
            <div style={{ flex: "1 1 360px" }}>
              <div style={{ color: "#93c5fd", fontWeight: 700, marginBottom: 12, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 12 }}>
                {publicHomeMessaging.header.eyebrow}
              </div>
              <h1 style={{ marginTop: 0, fontSize: "clamp(2.25rem, 4.5vw, 3.25rem)", lineHeight: 1.1, fontWeight: 800, maxWidth: 720, color: "#f8fafc" }}>
                {publicHomeMessaging.header.title}
              </h1>
              <p style={{ color: "#cbd5e1", lineHeight: 1.75, maxWidth: 560, marginTop: 18, fontSize: 18 }}>
                {publicHomeMessaging.header.subtitle}
              </p>
              {campaign ? (
                <div style={{ marginTop: 14, borderLeft: "3px solid #60a5fa", paddingLeft: 12, maxWidth: 620 }}>
                  <div style={{ color: "#bfdbfe", fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Personalized for {campaign.label}
                  </div>
                  <div style={{ color: "#f8fafc", fontWeight: 700, marginTop: 4 }}>{campaign.headline}</div>
                  <div style={{ color: "#cbd5e1", fontSize: 14, marginTop: 4 }}>{campaign.detail}</div>
                </div>
              ) : null}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
                <a href="/intake" style={heroCtaOnDark}>Get started</a>
                <a href="/login" style={heroCtaSecondaryOnDark}>Sign in</a>
              </div>
            </div>
            <div style={{ flex: "0 1 auto", display: "grid", gap: 16, padding: 20, borderRadius: 18, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <div style={{ filter: "brightness(1.15)" }}>
                <FcaBrandMark compact showTagline={false} />
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.15)" }} />
              <AuricruxBrandMark compact />
              <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.55, margin: 0, maxWidth: 360 }}>
                Public pages explain the offer. Your signed-in workspace is where you create jobs, files, schedules, invoices, and training progress.
              </p>
              <a href="/login?next=/portal/platform" style={{ ...heroCtaOnDark, textAlign: "center" }}>Sign in to workspace</a>
            </div>
          </div>
        </div>
      </section>

      <div style={{ padding: "clamp(32px, 5vw, 56px) clamp(20px, 4vw, 40px)", maxWidth: 1280, margin: "0 auto", boxSizing: "border-box" }}>
        <BrandArtBand />

        <section style={{ marginBottom: 40 }}>
          <div style={{ color: "#1e3a8a", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            See the product
          </div>
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: "clamp(1.3rem, 2.2vw, 1.7rem)" }}>How Contractor Command actually works</h2>
          <p style={{ color: "#475569", marginTop: 0, marginBottom: 22, lineHeight: 1.6, maxWidth: 720 }}>
            Estimating takeoff, the plan creation panel, and financials — illustrated the way your team uses them on live jobs.
          </p>
          <div style={responsiveGrid(280)}>
            <div>
              <ProductIllustration variant="takeoff" />
              <a href={mapPublicHref("/portal/estimates")} style={{ ...ctaSecondaryStyle, display: "inline-block", marginTop: 12 }}>Open estimating</a>
            </div>
            <div>
              <ProductIllustration variant="plans" />
              <a href={mapPublicHref("/portal/plans")} style={{ ...ctaSecondaryStyle, display: "inline-block", marginTop: 12 }}>Open plan room</a>
            </div>
            <div>
              <ProductIllustration variant="finance" />
              <a href={mapPublicHref("/portal/finance")} style={{ ...ctaSecondaryStyle, display: "inline-block", marginTop: 12 }}>Open financials</a>
            </div>
          </div>
        </section>

        <section id="owner-executive" style={{ ...cardStyle, marginBottom: 26, borderTop: `3px solid ${brandIdentity.fca.colors.primary}` }}>
          <div style={{ color: "#1e3a8a", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            Decision Path
          </div>
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: "clamp(1.3rem, 2.2vw, 1.7rem)" }}>Choose your path</h2>
          <p style={{ color: "#475569", marginTop: 0, lineHeight: 1.6, maxWidth: 760 }}>
            FCA adapts the experience by stakeholder role so each buyer sees outcome-first evidence before deep module detail.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {Object.values(buyerProfiles).map((profile) => (
              <button
                key={profile.key}
                type="button"
                onClick={() => setActiveBuyer(profile.key)}
                style={{
                  ...ctaSecondaryStyle,
                  cursor: "pointer",
                  border: activeBuyer === profile.key ? "1px solid #2563eb" : "1px solid #cbd5e1",
                  background: activeBuyer === profile.key ? "#eff6ff" : "#fff",
                  color: activeBuyer === profile.key ? "#1e40af" : "#334155",
                }}
              >
                {profile.label}
              </button>
            ))}
          </div>
          <div id="operations-director" style={{ border: "1px solid #dbeafe", borderRadius: 14, padding: 16, background: "#f8fbff" }}>
            <div style={{ color: "#1e3a8a", fontWeight: 800, marginBottom: 6 }}>{activeProfile.headline}</div>
            <div style={{ color: "#334155", lineHeight: 1.6, marginBottom: 10 }}>{activeProfile.proof}</div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{activeProfile.kpiLabel}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a" }}>{activeProfile.kpiValue}</div>
              </div>
              <a id="field-superintendent" href={mapPublicHref(activeProfile.href)} style={{ ...ctaPrimaryStyle, alignSelf: "center" }}>{activeProfile.ctaLabel}</a>
            </div>
          </div>
        </section>

        <section style={{ ...cardStyle, marginBottom: 26, padding: 0, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            <div style={{ padding: 20, background: "#fff7ed", borderRight: "1px solid #fed7aa" }}>
              <div style={{ color: "#9a3412", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>Before Auricrux</div>
              <h3 style={{ marginTop: 8, marginBottom: 10, fontSize: 19 }}>Contracting chaos</h3>
              <ul style={{ margin: 0, paddingLeft: 18, color: "#7c2d12", lineHeight: 1.8 }}>
                <li>Scattered spreadsheets and disconnected updates</li>
                <li>Missed RFIs and delayed escalation loops</li>
                <li>Invoices stalled by fragmented approval context</li>
              </ul>
            </div>
            <div style={{ padding: 20, background: "#ecfeff" }}>
              <div style={{ color: "#155e75", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>With FCA Workflow</div>
              <h3 style={{ marginTop: 8, marginBottom: 10, fontSize: 19 }}>Governed coordination at speed</h3>
              <ul style={{ margin: 0, paddingLeft: 18, color: "#0f4c5c", lineHeight: 1.8 }}>
                <li>Auricrux turns workspace signals into a clear recommended next action</li>
                <li>Risk events become tasked actions with owners and due dates</li>
                <li>Payment trust improves through proactive transparency and activity history</li>
              </ul>
            </div>
          </div>
        </section>

        <section style={{ ...cardStyle, marginBottom: 26 }}>
          <div style={{ color: "#1e3a8a", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            Live Walkthrough
          </div>
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: "clamp(1.2rem, 2.1vw, 1.55rem)" }}>Ask Auricrux in context</h2>
          <p style={{ color: "#475569", lineHeight: 1.6, maxWidth: 760 }}>
            Move from passive browsing to guided product experience with context-aware prompts tied to module surfaces.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {["/portal/scheduling", "/portal/finance", "/portal/field-tasks"].map((route) => (
              <button
                key={route}
                type="button"
                onClick={() => setDemoSurface(route)}
                style={{
                  ...ctaSecondaryStyle,
                  cursor: "pointer",
                  background: demoSurface === route ? "#eff6ff" : "#fff",
                  border: demoSurface === route ? "1px solid #2563eb" : "1px solid #cbd5e1",
                }}
              >
                {route.replace("/portal/", "").replace(/-/g, " ")}
              </button>
            ))}
          </div>
          <div style={{ border: "1px solid #dbeafe", borderRadius: 12, padding: 14, background: "#f8fbff" }}>
            <div style={{ color: "#1e40af", fontWeight: 700, marginBottom: 8 }}>
              {walkthroughPrompts[demoSurface]}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" onClick={() => toggleAuricruxAssistant()} style={{ ...ctaPrimaryStyle, border: "none", cursor: "pointer" }}>
                Ask Auricrux
              </button>
              <a href={mapPublicHref(demoSurface)} style={ctaSecondaryStyle}>Open {demoSurface.replace("/portal/", "")} demo</a>
            </div>
          </div>
        </section>

        <section style={{ ...cardStyle, marginBottom: 26 }}>
          <div style={{ color: "#1e3a8a", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            Capacity-Gap Calculator
          </div>
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: "clamp(1.2rem, 2.1vw, 1.55rem)" }}>Quantify administrative waste in under 30 seconds</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>Active projects</span>
              <input type="number" min="1" value={projectCount} onChange={(event) => setProjectCount(event.target.value)} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px" }} />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>Headcount</span>
              <input type="number" min="1" value={headcount} onChange={(event) => setHeadcount(event.target.value)} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px" }} />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>Average weekly admin hours</span>
              <input type="number" min="1" value={weeklyAdminHours} onChange={(event) => setWeeklyAdminHours(event.target.value)} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px" }} />
            </label>
          </div>
          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            <div style={{ color: "#334155" }}>Illustrative monthly admin friction cost: <strong style={{ color: "#0f172a" }}>${monthlyWaste.toLocaleString()}</strong></div>
            <div style={{ color: "#64748b", fontSize: 13 }}>
              Planning input only (projects × weekly admin hours × $82/hr). Use it to size the coordination problem FCA and Auricrux are built to reduce — not a measured customer savings claim.
            </div>
          </div>
        </section>

        <section style={{ ...cardStyle, marginBottom: 26, borderTop: "3px solid #0f766e" }}>
          <div style={{ color: "#0f766e", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            Live Product Access
          </div>
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: "clamp(1.2rem, 2.1vw, 1.55rem)" }}>Sign in to the live workspace — or book a walkthrough</h2>
          <p style={{ color: "#475569", lineHeight: 1.65, maxWidth: 760 }}>
            Buyers can open the real FCA platform today. Sales conversations start from a working product, not a deck.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="/login?next=/portal/platform" style={ctaPrimaryStyle}>Sign in to workspace</a>
            <a href="/contact" style={ctaSecondaryStyle}>Book a walkthrough</a>
            <button type="button" onClick={() => runTerminalCommand("walkthrough")} style={{ ...ctaSecondaryStyle, cursor: "pointer" }}>
              Request from terminal
            </button>
          </div>
        </section>

        <div style={{ marginBottom: 48 }}>
          <ProductIllustration variant="home" />
        </div>

        <section style={{ marginBottom: 48 }}>
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: "clamp(1.35rem, 2.5vw, 1.85rem)" }}>What FCA delivers</h2>
          <p style={{ color: "#64748b", marginBottom: 24, maxWidth: 620, lineHeight: 1.65 }}>
            One AI-native platform for bids, projects, billing, customer communication, and workforce training.
          </p>
          <div style={responsiveGrid(260)}>
            {visibleSurfaceLinks.map((item) => (
              <a
                key={item.key}
                href={item.href}
                style={{ ...cardStyle, borderTop: `3px solid ${brandIdentity.fca.colors.primary}`, textDecoration: "none", color: "inherit", display: "block" }}
              >
                <h3 style={{ marginTop: 0, fontSize: 17 }}>{item.title}</h3>
                <p style={{ color: "#475569", lineHeight: 1.65, marginBottom: 0, fontSize: 14 }}>{item.detail}</p>
              </a>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 48 }}>
          <h2 style={{ marginBottom: 20, fontSize: "clamp(1.25rem, 2.5vw, 1.65rem)" }}>Built for every stage of growth</h2>
          <div style={responsiveGrid(280)}>
            {websiteMarketReadiness.buyerJourneys.map((journey) => (
              <article
                key={journey.title}
                style={{
                  ...cardStyle,
                  background: `linear-gradient(180deg, ${brandIdentity.fca.colors.primarySoft} 0%, #fff 100%)`,
                }}
              >
                <div style={{ color: brandIdentity.fca.colors.primaryDark, fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  {journey.audience}
                </div>
                <h3 style={{ marginTop: 0, fontSize: 17 }}>{journey.title}</h3>
                <p style={{ color: "#475569", lineHeight: 1.65, fontSize: 14, marginBottom: 12 }}>{journey.outcome}</p>
                <a href={journey.route} style={{ ...ctaPrimaryStyle, display: "inline-block", fontSize: 14 }}>{journey.label}</a>
              </article>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 48 }}>
          <div style={responsiveGrid(200)}>
            {websiteMarketReadiness.trustSignals.map((signal) => (
              <article key={signal.title} style={{ ...cardStyle, padding: 16 }}>
                <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: 6, fontSize: 15 }}>{signal.title}</div>
                <p style={{ color: "#64748b", lineHeight: 1.6, margin: 0, fontSize: 14 }}>{signal.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 48 }}>
          <h2 style={{ marginBottom: 20, fontSize: "clamp(1.25rem, 2.5vw, 1.65rem)" }}>What you can open today</h2>
          <div style={responsiveGrid(280)}>
            {websiteEnterpriseProof.map((item) => (
              <article key={item.title} style={cardStyle}>
                <h3 style={{ marginTop: 0, fontSize: 17 }}>{item.title}</h3>
                <p style={{ color: "#475569", lineHeight: 1.65, fontSize: 14, marginBottom: 0 }}>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 48 }}>
          <h2 style={{ marginBottom: 20, fontSize: "clamp(1.25rem, 2.5vw, 1.65rem)" }}>Academy classrooms</h2>
          <div style={responsiveGrid(280)}>
            {academyClassrooms.map((classroom) => (
              <article key={classroom.title} style={cardStyle}>
                <div style={{ color: brandIdentity.fca.colors.primaryDark, fontWeight: 800, fontSize: 12, marginBottom: 8 }}>{classroom.credential}</div>
                <h3 style={{ marginTop: 0, fontSize: 17 }}>{classroom.title}</h3>
                <p style={{ color: "#475569", lineHeight: 1.65, fontSize: 14, marginBottom: 12 }}>{classroom.cadence} · {classroom.delivery}</p>
                <a href={mapPublicHref(classroom.linkedSurface)} style={{ ...ctaSecondaryStyle, display: "inline-block", fontSize: 14 }}>{classroom.linkedLabel}</a>
              </article>
            ))}
          </div>
        </section>

        <section style={{ ...cardStyle, marginBottom: 48 }}>
          <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: "clamp(1.2rem, 2.1vw, 1.55rem)" }}>Academy talent pipeline, not just course access</h2>
          <p style={{ color: "#475569", lineHeight: 1.65, maxWidth: 760 }}>
            FCA Academy supports contractor labor continuity from first-day onboarding to project leadership with role-aligned credentials and deployment readiness.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            {[
              { title: "Day 1 Training", detail: "Safety onboarding, documentation standards, and field communication baseline." },
              { title: "Skill Validation", detail: "Task-based qualification checkpoints linked to live production workflows." },
              { title: "Crew Readiness", detail: "Deployment tracking tied to project schedules and labor demand." },
              { title: "Project Lead", detail: "Leadership path with governance, budget signal literacy, and escalation protocols." },
            ].map((stage) => (
              <article key={stage.title} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 12, background: "#fff" }}>
                <div style={{ color: "#1e3a8a", fontWeight: 800, fontSize: 13 }}>{stage.title}</div>
                <div style={{ color: "#475569", fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{stage.detail}</div>
              </article>
            ))}
          </div>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            {academyPathwayHighlights.map((story) => (
              <article key={story.name} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 12, background: "#f8fafc" }}>
                <div style={{ color: "#0f172a", fontWeight: 800, fontSize: 14 }}>{story.name}</div>
                <div style={{ color: "#1e3a8a", fontWeight: 700, fontSize: 12, marginTop: 2 }}>{story.role}</div>
                <div style={{ color: "#475569", lineHeight: 1.55, fontSize: 13, marginTop: 6 }}>{story.outcome}</div>
                <div style={{ color: "#166534", fontWeight: 700, fontSize: 12, marginTop: 6 }}>{story.roi}</div>
              </article>
            ))}
          </div>
        </section>

        <section style={{ ...cardStyle, marginBottom: 48 }}>
          <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: "clamp(1.2rem, 2.1vw, 1.55rem)" }}>Trust and governance</h2>
          <p style={{ color: "#475569", lineHeight: 1.65, maxWidth: 760 }}>
            Enterprise rollout requires legal and procurement confidence. FCA exposes governance controls, security posture, and workspace activity history in one place.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="/legal" style={ctaSecondaryStyle}>Legal center</a>
            <a href="/security" style={ctaSecondaryStyle}>Security & compliance</a>
            <a href="/portal/audit" style={ctaSecondaryStyle}>Activity history</a>
            <a href="/login?next=/portal/admin" style={ctaPrimaryStyle}>Trust workspace</a>
          </div>
        </section>

        <PublicPackageRouteGroupsPanel
          eyebrow="Platform depth"
          title="Every module connected in one workspace"
          detail="Route groups behind bids, projects, field execution, finance, academy, and Auricrux intelligence."
        />

        <ShellFooter />
      </div>
    </div>
  );
}
