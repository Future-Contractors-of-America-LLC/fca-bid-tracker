import { useMemo } from "react";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import useAcademyLms from "../../hooks/useAcademyLms";
import useCustomerSession from "../../hooks/useCustomerSession";
import { organizeCatalogHierarchy } from "../../academyOfferings";
import { hasAcademySubscription, shouldShowMemberOnlyPathway } from "../../academySubscriptionAccess";
import { getCertificationAgencyAlignment } from "../../academyCatalogTaxonomy";
import { getPathwayLmsConfig, listPathwayLmsConfigs } from "../../academyPathwayLms";
import { shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import { pageShellStyle } from "../../publicShellStyles";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

function readPathwayKey() {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return params.get("pathway") || "";
}

function PathwayHero({ config, courseCount, topicCount }) {
  return (
    <section
      style={{
        ...cardStyle,
        border: `1px solid ${config.border}`,
        background: `linear-gradient(135deg, ${config.accentSoft} 0%, #fff 60%)`,
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ color: config.accent, fontWeight: 700, fontSize: 13, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Auricrux-operated mini-LMS
          </div>
          <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: 28 }}>{config.heroTitle}</h2>
          <p style={{ color: "#475569", lineHeight: 1.7, marginTop: 0, maxWidth: 640 }}>{config.heroSubtitle}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            {config.features.map((feature) => (
              <span
                key={feature}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: config.accent,
                  background: config.accentSoft,
                  border: `1px solid ${config.border}`,
                  borderRadius: 999,
                  padding: "6px 12px",
                }}
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <AuricruxBrandMark size={48} />
          <div style={{ marginTop: 10, fontSize: 13, color: "#64748b" }}>
            Operated by <strong style={{ color: "#0f172a" }}>{config.operatedBy}</strong>
          </div>
          <div style={{ marginTop: 8, fontSize: 14, color: "#334155" }}>
            <strong>{topicCount}</strong> topics | <strong>{courseCount}</strong> courses
          </div>
        </div>
      </div>
    </section>
  );
}

function TopicRow({ topic, pathwayKey, config }) {
  const agency = pathwayKey === "certification" ? getCertificationAgencyAlignment(topic.key) : null;
  return (
    <a
      href={`/academy/catalog?pathway=${pathwayKey}&topic=${topic.key}`}
      style={{
        ...cardStyle,
        display: "block",
        textDecoration: "none",
        color: "inherit",
        borderLeft: `4px solid ${config.accent}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <h3 style={{ marginTop: 0, marginBottom: 6 }}>{topic.label}</h3>
          <p style={{ color: "#475569", lineHeight: 1.65, marginTop: 0, marginBottom: 0 }}>{topic.description}</p>
          {agency ? (
            <div style={{ marginTop: 10, fontSize: 13, color: config.accent, fontWeight: 600 }}>
              Aligned with {agency.primary} | {agency.bodies.slice(0, 3).join(", ")}
            </div>
          ) : null}
        </div>
        <div style={{ color: "#64748b", fontSize: 14, whiteSpace: "nowrap" }}>
          {topic.courses.length} courses
        </div>
      </div>
    </a>
  );
}

export default function AcademyPathwayHub() {
  const pathwayKey = readPathwayKey();
  const { session } = useCustomerSession();
  const config = getPathwayLmsConfig(pathwayKey);
  const { academyState } = useAcademyLms();
  const apiPrograms = academyState?.catalog?.programs || [];
  const includeOperatorGuides = hasAcademySubscription(session);
  const hierarchy = useMemo(
    () => organizeCatalogHierarchy(apiPrograms, { includeOperatorGuides }),
    [apiPrograms, includeOperatorGuides],
  );
  const pathway = hierarchy.find((entry) => entry.key === pathwayKey) || null;
  const memberOnlyBlocked = pathwayKey && !shouldShowMemberOnlyPathway(pathwayKey, session);
  const visiblePathwayConfigs = useMemo(
    () => listPathwayLmsConfigs().filter((entry) => shouldShowMemberOnlyPathway(entry.key, session)),
    [session],
  );

  if (memberOnlyBlocked) {
    return (
      <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
        <ShellHeader
          compact
          eyebrow="FCA Academy"
          title="Subscription required"
          subtitle="FCA How-To and Operator Guides are included with Contractor Command subscriptions."
          primaryHref="/login?next=/academy/pathway?pathway=fca-how-to"
          primaryLabel="Sign in"
          journey={shellJourney}
          currentJourney="academy"
        />
        <main style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 48px" }}>
          <div style={{ ...cardStyle, border: "1px solid #fecaca", background: "#fef2f2" }}>
            <p style={{ color: "#475569", lineHeight: 1.65, marginTop: 0 }}>
              Operator guides are not sold in the Academy Store and are not shown in the public catalog menu.
              Sign in with an active Contractor Command workspace to access them from your learner dashboard.
            </p>
            <a href="/academy/catalog" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>Browse public catalog</a>
          </div>
        </main>
        <ShellFooter />
      </div>
    );
  }

  if (!config || !pathway) {
    return (
      <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
        <ShellHeader
          compact
          eyebrow="FCA Academy"
          title="Pathway not found"
          subtitle="Choose a pathway mini-LMS below."
          primaryHref="/academy/catalog"
          primaryLabel="Full catalog"
          journey={shellJourney}
          currentJourney="academy"
        />
        <main style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 48px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {visiblePathwayConfigs.map((entry) => (
              <a key={entry.key} href={`/academy/pathway?pathway=${entry.key}`} style={{ ...cardStyle, textDecoration: "none", color: "inherit" }}>
                <h3 style={{ marginTop: 0 }}>{entry.heroTitle}</h3>
                <p style={{ color: "#475569", lineHeight: 1.65 }}>{entry.heroSubtitle}</p>
              </a>
            ))}
          </div>
        </main>
        <ShellFooter />
      </div>
    );
  }

  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        compact
        eyebrow={`${config.heroTitle} | Auricrux`}
        title={config.heroTitle}
        subtitle={`${pathway.courseCount} courses across ${pathway.topics.length} topics`}
        primaryHref={config.dashboardRoute}
        primaryLabel="My progress"
        secondaryHref={shellHeaderCtaSets.academy.secondaryHref}
        secondaryLabel={shellHeaderCtaSets.academy.secondaryLabel}
        journey={shellJourney}
        currentJourney="academy"
      />

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 48px" }}>
        <nav style={{ marginBottom: 20, fontSize: 14, color: "#64748b" }}>
          <a href="/academy" style={{ color: "#2563eb", textDecoration: "none" }}>Academy</a>
          {" / "}
          <a href="/academy/catalog" style={{ color: "#2563eb", textDecoration: "none" }}>Catalog</a>
          {" / "}
          <span style={{ color: "#0f172a", fontWeight: 600 }}>{config.heroTitle}</span>
        </nav>

        <PathwayHero config={config} courseCount={pathway.courseCount} topicCount={pathway.topics.length} />

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
          <a
            href={config.catalogRoute}
            style={{ border: `1px solid ${config.accent}`, background: config.accent, color: "#fff", borderRadius: 10, padding: "10px 16px", fontWeight: 700, textDecoration: "none" }}
          >
            Browse full catalog
          </a>
          <a
            href={config.dashboardRoute}
            style={{ border: `1px solid ${config.border}`, background: "#fff", color: config.accent, borderRadius: 10, padding: "10px 16px", fontWeight: 700, textDecoration: "none" }}
          >
            Learner dashboard
          </a>
        </div>

        <h2 style={{ marginTop: 0, marginBottom: 16 }}>Topics in this pathway</h2>
        <div style={{ display: "grid", gap: 14 }}>
          {pathway.topics.map((topic) => (
            <TopicRow key={topic.key} topic={topic} pathwayKey={pathwayKey} config={config} />
          ))}
        </div>

        <section style={{ ...cardStyle, marginTop: 32, background: "#f8fafc" }}>
          <strong>Connected ecosystem</strong>
          <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: 0 }}>
            This mini-LMS is embedded in FCA Contractor Command and futurecontractorsofamerica.com.
            Progress, credentials, and portal labs sync through Auricrux-Central - one operator, multiple pathway experiences.
          </p>
        </section>
      </main>

      <ShellFooter />
    </div>
  );
}
