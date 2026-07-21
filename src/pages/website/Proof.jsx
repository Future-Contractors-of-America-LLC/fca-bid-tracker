import { useEffect, useMemo, useState } from "react";
import PublicTopNav from "../../components/PublicTopNav";
import ShellFooter from "../../components/ShellFooter";
import ProductIllustration from "../../components/ProductIllustration";
import { brandIdentity } from "../../brandIdentity";
import { routes } from "../../routes";
import { academyCatalog } from "../../academyCatalog";
import {
  cardStyle,
  ctaPrimaryStyle,
  ctaSecondaryStyle,
  pageShellStyle,
  responsiveGrid,
} from "../../publicShellStyles";

// Defensible scope facts. Course/CTE counts are the number of accreditation-tier
// program artifacts produced by the FCA Academy factory in auricrux-central
// (artifacts/academy/*.json and vdoe-cte-*.json respectively).
const SCOPE_FACTS = {
  academyCourses: 1251,
  cteProgramsVdoe: 39,
};

const heroCtaOnDark = { ...ctaPrimaryStyle, background: "#fff", color: "#0f172a", border: "none" };
const heroCtaSecondaryOnDark = {
  ...ctaSecondaryStyle,
  background: "transparent",
  color: "#e2e8f0",
  border: "1px solid rgba(226, 232, 240, 0.45)",
};

const repositories = [
  {
    name: "auricrux-central",
    role: "Control plane, platform API, and the Auricrux AI factory",
    detail:
      "Runs the shared inference spine, publishing bridge, and the automated Academy content factory that produces accreditation-tier curriculum.",
  },
  {
    name: "fca-bid-tracker",
    role: "The web platform you are looking at now",
    detail:
      "Customer web shell: the bid-to-bill Contractor Command workspace, FCA Academy, and the CTE program portal. This site is one of its public surfaces.",
  },
  {
    name: "fca-mobile-maui",
    role: "FCA Contractor Command mobile app",
    detail:
      "Cross-platform iOS and Android field app (.NET MAUI) sharing the same identity, project spine, and Auricrux intelligence as the web platform.",
  },
];

const clarityCards = [
  {
    label: "The platform",
    title: "FCA, an AI-native contractor operating system",
    body:
      "Future Contractors of America runs the full job lifecycle in one workspace: leads, bids, estimating and takeoff, project delivery, document control, billing, closeout, warranty, and workforce training.",
  },
  {
    label: "The intelligence",
    title: "Auricrux, the AI layer inside every workflow",
    body:
      "Auricrux reads live workspace signals and either recommends the next step or takes the authorized action for you, across bids, delivery, billing, and Academy training.",
  },
  {
    label: "The customer",
    title: "Contractors, and the schools that train them",
    body:
      "Commercial and residential contractors who need one governed system instead of scattered tools, plus CTE schools and workforce programs training the next generation of the trades.",
  },
  {
    label: "The problem",
    title: "Construction runs on disconnected tools",
    body:
      "Spreadsheets, email, and point apps lose signal between the office and the field. FCA keeps the whole job, and the people learning to run it, on one connected spine.",
  },
];

function MetricTile({ value, label, tone = "#1d4ed8" }) {
  return (
    <div style={{ ...cardStyle, textAlign: "center", padding: "18px 14px" }}>
      <div style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, color: tone, lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ color: "#475569", fontSize: 13, marginTop: 6, lineHeight: 1.4 }}>{label}</div>
    </div>
  );
}

function useDeploymentStatus() {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    let active = true;
    fetch("/deployment-status.json", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active) setStatus(data);
      })
      .catch(() => {
        if (active) setStatus(null);
      });
    return () => {
      active = false;
    };
  }, []);
  return status;
}

export default function Proof() {
  const deployment = useDeploymentStatus();

  const productSurfaceCount = useMemo(
    () =>
      Object.keys(routes).filter(
        (key) => key.startsWith("/portal") || key.startsWith("/academy") || key.startsWith("/cte"),
      ).length,
    [],
  );

  const pathways = academyCatalog.pathways || [];

  const gitSha = deployment?.gitSha || deployment?.gitSHA || null;
  const shortSha = gitSha && gitSha !== "local-dev" ? gitSha.slice(0, 10) : null;
  const buildDate = deployment?.buildMarkerDate || (deployment?.generatedAt ? deployment.generatedAt.slice(0, 10) : null);
  const deployHost = deployment?.defaultHost || (Array.isArray(deployment?.expectedHosts) ? deployment.expectedHosts[0] : null);

  const productVariants = [
    { variant: "takeoff", href: "/login?next=/portal/estimates", label: "Open estimating and takeoff" },
    { variant: "plans", href: "/login?next=/portal/plans", label: "Open the plan room" },
    { variant: "finance", href: "/login?next=/portal/finance", label: "Open financials" },
    { variant: "academy", href: "/academy/catalog", label: "Browse the Academy catalog" },
    { variant: "auricrux", href: "/auricrux", label: "See how Auricrux works" },
    { variant: "home", href: "/login?next=/portal/platform", label: "Open Contractor Command" },
  ];

  return (
    <div style={{ ...pageShellStyle, background: "#ffffff", minHeight: "100vh", paddingTop: 0, maxWidth: "none", margin: 0, width: "100%" }}>
      <PublicTopNav />

      <section
        style={{
          background: "linear-gradient(165deg, #0f172a 0%, #1e3a5f 42%, #0f172a 100%)",
          padding: "clamp(48px, 8vw, 80px) clamp(20px, 4vw, 40px)",
        }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ color: "#93c5fd", fontWeight: 700, marginBottom: 12, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 12 }}>
            Build and scope proof
          </div>
          <h1 style={{ marginTop: 0, fontSize: "clamp(2rem, 4.5vw, 3rem)", lineHeight: 1.1, fontWeight: 800, maxWidth: 820, color: "#f8fafc" }}>
            This is how much of Future Contractors of America is already built and live.
          </h1>
          <p style={{ color: "#cbd5e1", lineHeight: 1.75, maxWidth: 720, marginTop: 18, fontSize: 18 }}>
            FCA is a deployed, AI-native contractor platform, not a concept. Below is the current scope, the active
            repositories behind it, the live deployment fingerprint, and the real product surfaces you can open today.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 26 }}>
            <a href="/login?next=/portal/platform" style={heroCtaOnDark}>Open the live workspace</a>
            <a href="/contact" style={heroCtaSecondaryOnDark}>Book a walkthrough</a>
          </div>
          {shortSha || buildDate ? (
            <div style={{ marginTop: 22, display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "8px 14px", borderRadius: 999, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)" }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              <span style={{ color: "#bbf7d0", fontSize: 13, fontWeight: 700 }}>
                Live deployment{buildDate ? `, built ${buildDate}` : ""}{shortSha ? `, commit ${shortSha}` : ""}
              </span>
            </div>
          ) : null}
        </div>
      </section>

      <div style={{ padding: "clamp(32px, 5vw, 56px) clamp(20px, 4vw, 40px)", maxWidth: 1080, margin: "0 auto", boxSizing: "border-box" }}>
        {/* Scope at a glance */}
        <section style={{ marginBottom: 44 }}>
          <h2 style={{ marginTop: 0, marginBottom: 18, fontSize: "clamp(1.35rem, 2.5vw, 1.85rem)" }}>Scope at a glance</h2>
          <div style={responsiveGrid(180)}>
            <MetricTile value={SCOPE_FACTS.academyCourses.toLocaleString()} label="Accreditation-tier Academy courses" />
            <MetricTile value={SCOPE_FACTS.cteProgramsVdoe} label="VDOE-aligned CTE programs" tone="#0f766e" />
            <MetricTile value={`${productSurfaceCount}+`} label="Live product and Academy surfaces" tone="#7c3aed" />
            <MetricTile value="3" label="Active production repositories" tone="#b45309" />
            <MetricTile value="iOS + Android" label="Contractor Command mobile app" tone="#0369a1" />
          </div>
        </section>

        {/* 30-second clarity */}
        <section style={{ marginBottom: 44 }}>
          <div style={{ color: "#1e3a8a", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            In 30 seconds
          </div>
          <h2 style={{ marginTop: 0, marginBottom: 18, fontSize: "clamp(1.35rem, 2.5vw, 1.85rem)" }}>What FCA is, and who it is for</h2>
          <div style={responsiveGrid(260)}>
            {clarityCards.map((card) => (
              <article key={card.title} style={{ ...cardStyle, borderTop: `3px solid ${brandIdentity.fca.colors.primary}` }}>
                <div style={{ color: "#1e3a8a", fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  {card.label}
                </div>
                <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 17 }}>{card.title}</h3>
                <p style={{ color: "#475569", lineHeight: 1.6, fontSize: 14, margin: 0 }}>{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Active development evidence */}
        <section style={{ marginBottom: 44 }}>
          <div style={{ color: "#166534", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            Active development
          </div>
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: "clamp(1.35rem, 2.5vw, 1.85rem)" }}>Built continuously, deployed continuously</h2>
          <p style={{ color: "#475569", lineHeight: 1.6, maxWidth: 760, marginTop: 0 }}>
            The platform ships through automated CI/CD: every change is built and deployed to Azure with commit-level
            provenance. The fingerprint below is read live from this site&apos;s deployment manifest.
          </p>

          <div style={{ ...cardStyle, borderTop: "3px solid #16a34a", marginBottom: 18 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
              <div style={{ flex: "1 1 200px" }}>
                <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Live commit</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginTop: 4, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                  {shortSha || "verifying..."}
                </div>
              </div>
              <div style={{ flex: "1 1 160px" }}>
                <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Last build</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{buildDate || "verifying..."}</div>
              </div>
              <div style={{ flex: "2 1 240px" }}>
                <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Deployed host</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginTop: 4, wordBreak: "break-all" }}>
                  {deployHost || "futurecontractorsofamerica.com"}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <a href="/deployment-status.json" style={{ ...ctaSecondaryStyle, display: "inline-block", fontSize: 13 }}>
                View raw deployment manifest
              </a>
            </div>
          </div>

          <div style={responsiveGrid(300)}>
            {repositories.map((repo) => (
              <article key={repo.name} style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <code style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", background: "#f1f5f9", padding: "3px 8px", borderRadius: 6 }}>{repo.name}</code>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#166534", background: "#dcfce7", padding: "2px 8px", borderRadius: 999 }}>active</span>
                </div>
                <div style={{ color: "#1e3a8a", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{repo.role}</div>
                <p style={{ color: "#475569", lineHeight: 1.6, fontSize: 13, margin: 0 }}>{repo.detail}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Product evidence */}
        <section style={{ marginBottom: 44 }}>
          <div style={{ color: "#1e3a8a", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            See the product
          </div>
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: "clamp(1.35rem, 2.5vw, 1.85rem)" }}>Real product surfaces, not mockups of a plan</h2>
          <p style={{ color: "#475569", lineHeight: 1.6, maxWidth: 760, marginTop: 0, marginBottom: 22 }}>
            Every panel below is a live surface inside Contractor Command. Sign in to use them, or explore the Academy and
            CTE catalogs without an account.
          </p>
          <div style={responsiveGrid(300)}>
            {productVariants.map((item) => (
              <div key={item.variant}>
                <ProductIllustration variant={item.variant} />
                <a href={item.href} style={{ ...ctaSecondaryStyle, display: "inline-block", marginTop: 12, fontSize: 14 }}>{item.label}</a>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture */}
        <section style={{ ...cardStyle, marginBottom: 44, background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)" }}>
          <div style={{ color: "#7c3aed", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            Architecture
          </div>
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: "clamp(1.3rem, 2.3vw, 1.7rem)" }}>One inference spine behind every surface</h2>
          <p style={{ color: "#475569", lineHeight: 1.6, maxWidth: 760, marginTop: 0 }}>
            The web platform and the mobile app share a single control plane and AI factory. FCA runs its own native
            engines first; external services are optional adapters, not dependencies.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 12, marginTop: 12 }}>
            <div style={{ border: "1px solid #dbeafe", borderRadius: 12, padding: 14, background: "#fff" }}>
              <div style={{ fontWeight: 800, color: "#1d4ed8", fontSize: 14 }}>Web platform</div>
              <div style={{ color: "#475569", fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>fca-bid-tracker: Contractor Command, Academy, CTE portal</div>
            </div>
            <div style={{ border: "1px solid #dbeafe", borderRadius: 12, padding: 14, background: "#fff" }}>
              <div style={{ fontWeight: 800, color: "#0369a1", fontSize: 14 }}>Mobile app</div>
              <div style={{ color: "#475569", fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>fca-mobile-maui: iOS and Android field execution</div>
            </div>
            <div style={{ border: "1px solid #ddd6fe", borderRadius: 12, padding: 14, background: "#faf5ff" }}>
              <div style={{ fontWeight: 800, color: "#7c3aed", fontSize: 14 }}>Auricrux-Central</div>
              <div style={{ color: "#475569", fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>Control plane, platform API, and the Auricrux AI factory plus inference spine</div>
            </div>
          </div>
        </section>

        {/* Scope by pathway */}
        {pathways.length ? (
          <section style={{ marginBottom: 44 }}>
            <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: "clamp(1.35rem, 2.5vw, 1.85rem)" }}>Training scope across the trades</h2>
            <p style={{ color: "#475569", lineHeight: 1.6, maxWidth: 760, marginTop: 0, marginBottom: 22 }}>
              The FCA Academy spans apprenticeship, licensure, degree, and CTE pathways: {SCOPE_FACTS.academyCourses.toLocaleString()} courses in
              all, including {SCOPE_FACTS.cteProgramsVdoe} VDOE-aligned CTE programs.
            </p>
            <div style={responsiveGrid(260)}>
              {pathways.map((pathway) => (
                <article key={pathway.title} style={cardStyle}>
                  <h3 style={{ marginTop: 0, fontSize: 16 }}>{pathway.title}</h3>
                  <p style={{ color: "#475569", lineHeight: 1.6, fontSize: 14, marginBottom: 12 }}>{pathway.description}</p>
                  <a href={pathway.route} style={{ ...ctaSecondaryStyle, display: "inline-block", fontSize: 13 }}>{pathway.label}</a>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {/* Closing CTA */}
        <section style={{ ...cardStyle, marginBottom: 40, borderTop: "3px solid #0f766e", textAlign: "center" }}>
          <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: "clamp(1.3rem, 2.3vw, 1.7rem)" }}>See it for yourself</h2>
          <p style={{ color: "#475569", lineHeight: 1.65, maxWidth: 640, margin: "0 auto 18px" }}>
            Open the live workspace, browse the Academy, or book a walkthrough. Every claim on this page is something you
            can verify in the product today.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <a href="/login?next=/portal/platform" style={ctaPrimaryStyle}>Open the live workspace</a>
            <a href="/academy/catalog" style={ctaSecondaryStyle}>Browse the Academy</a>
            <a href="/contact" style={ctaSecondaryStyle}>Book a walkthrough</a>
          </div>
        </section>

        <ShellFooter />
      </div>
    </div>
  );
}
