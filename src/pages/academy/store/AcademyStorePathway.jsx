import { useEffect, useState } from "react";
import ShellHeader from "../../../components/ShellHeader";
import ShellFooter from "../../../components/ShellFooter";
import { fetchAcademyCommerceCatalog, formatUsd } from "../../../api/academyCommerceClient";
import { getPathwayLmsConfig } from "../../../academyPathwayLms";
import { shellHeaderCtaSets, shellJourney } from "../../../websiteShell";
import { pageShellStyle, cardStyle, ctaPrimaryStyle } from "../../../publicShellStyles";

function readPathwayKey() {
  if (typeof window === "undefined") return "";
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
}

export default function AcademyStorePathway() {
  const pathwayKey = readPathwayKey();
  const config = getPathwayLmsConfig(pathwayKey);
  const [pathwayOffer, setPathwayOffer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchAcademyCommerceCatalog()
      .then((payload) => {
        if (!active) return;
        const match = (payload?.pathways || []).find((item) => item.pathwayKey === pathwayKey);
        setPathwayOffer(match || null);
      })
      .catch(() => {
        if (active) setPathwayOffer(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [pathwayKey]);

  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        compact
        eyebrow="FCA Academy Store"
        title={config?.heroTitle || "Pathway bundle"}
        subtitle={config?.heroSubtitle || "Purchase a pathway bundle for your team."}
        primaryHref="/academy/store"
        primaryLabel="Back to store"
        secondaryHref={shellHeaderCtaSets.academy.secondaryHref}
        secondaryLabel={shellHeaderCtaSets.academy.secondaryLabel}
        journey={shellJourney}
        currentJourney="academy"
      />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 48px" }}>
        <div style={cardStyle}>
          {loading ? <p>Loading pathway offer...</p> : null}
          {!loading && pathwayOffer ? (
            <>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{formatUsd(pathwayOffer.priceUsd)}</div>
              <p style={{ color: "#475569", lineHeight: 1.65 }}>{pathwayOffer.summary}</p>
              <a href={pathwayOffer.checkoutHref || "/academy/store"} style={{ ...ctaPrimaryStyle, display: "inline-block", marginTop: 12 }}>
                Continue to checkout
              </a>
            </>
          ) : null}
          {!loading && !pathwayOffer ? (
            <p style={{ color: "#475569" }}>
              This pathway bundle is not listed yet. <a href="/contact">Contact sales</a> for rollout pricing.
            </p>
          ) : null}
        </div>
      </main>
      <ShellFooter />
    </div>
  );
}
