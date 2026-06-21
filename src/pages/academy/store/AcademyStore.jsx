import { useCallback, useEffect, useMemo, useState } from "react";
import ShellHeader from "../../../components/ShellHeader";
import ShellFooter from "../../../components/ShellFooter";
import PublicCtaRow from "../../../components/PublicCtaRow";
import { fetchAcademyCommerceCatalog, formatUsd } from "../../../api/academyCommerceClient";
import { academyCtaSets, shellHeaderCtaSets, shellJourney } from "../../../websiteShell";
import { pageShellStyle } from "../../../publicShellStyles";

const PAGE_SIZE = 48;

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const laneLabels = {
  apprenticeship: "Apprenticeship",
  certification: "Certification",
  degree: "Degree",
  licensure: "Licensure Prep",
  professional: "Professional Development",
};

function StoreTabs({ active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
      {[
        { key: "courses", label: "Courses" },
        { key: "pathways", label: "Pathways" },
      ].map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          style={{
            border: active === tab.key ? "1px solid #1d4ed8" : "1px solid #cbd5e1",
            background: active === tab.key ? "#eff6ff" : "#fff",
            color: active === tab.key ? "#1d4ed8" : "#334155",
            borderRadius: 999,
            padding: "8px 16px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function CourseCard({ course }) {
  return (
    <article style={cardStyle}>
      <div style={{ color: "#1d4ed8", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
        {laneLabels[course.lane] || course.lane}
      </div>
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>{course.title}</h3>
      <p style={{ color: "#475569", marginTop: 0 }}>
        {course.moduleCount ? `${course.moduleCount} modules` : `${course.duration || ""} modules`}
        {course.credential ? ` | ${course.credential}` : ""}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <strong style={{ fontSize: 20, color: "#0f172a" }}>{formatUsd(course.retailPrice)}</strong>
        <a
          href={`/academy/store/course/${course.programKey}`}
          style={{
            border: "1px solid #2563eb",
            background: "#2563eb",
            color: "#fff",
            borderRadius: 10,
            padding: "10px 14px",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Buy now
        </a>
      </div>
    </article>
  );
}

function PathwayCard({ pathway }) {
  return (
    <article style={cardStyle}>
      <div style={{ color: "#7c3aed", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
        Pathway bundle | {laneLabels[pathway.lane] || pathway.lane}
      </div>
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>{pathway.title}</h3>
      <p style={{ color: "#475569", marginTop: 0 }}>
        {pathway.programCount} courses included
        {pathway.bundleDiscountPercent ? ` | Save ${pathway.bundleDiscountPercent}%` : ""}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          {pathway.subtotalPrice && pathway.subtotalPrice > pathway.retailPrice ? (
            <span style={{ color: "#94a3b8", textDecoration: "line-through", marginRight: 8 }}>
              {formatUsd(pathway.subtotalPrice)}
            </span>
          ) : null}
          <strong style={{ fontSize: 20, color: "#0f172a" }}>{formatUsd(pathway.retailPrice)}</strong>
        </div>
        <a
          href={`/academy/store/pathway/${pathway.pathwayKey}`}
          style={{
            border: "1px solid #7c3aed",
            background: "#7c3aed",
            color: "#fff",
            borderRadius: 10,
            padding: "10px 14px",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Buy pathway
        </a>
      </div>
    </article>
  );
}

export default function AcademyStore() {
  const [tab, setTab] = useState("courses");
  const [lane, setLane] = useState("");
  const [courses, setCourses] = useState([]);
  const [pathways, setPathways] = useState([]);
  const [lanes, setLanes] = useState([]);
  const [pagination, setPagination] = useState({ offset: 0, limit: PAGE_SIZE, totalCourses: 0, hasMore: false });
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const loadCatalog = useCallback(async ({ laneFilter, offset = 0, append = false } = {}) => {
    const isInitial = offset === 0 && !append;
    if (isInitial) setLoading(true);
    else setLoadingMore(true);
    setError("");
    try {
      const payload = await fetchAcademyCommerceCatalog({
        lane: laneFilter || undefined,
        offset,
        limit: PAGE_SIZE,
      });
      setPathways(payload.pathways || []);
      setLanes(payload.lanes || []);
      setStripeConfigured(Boolean(payload.stripeConfigured));
      setPagination(payload.pagination || { offset: 0, limit: PAGE_SIZE, totalCourses: 0, hasMore: false });
      setCourses((current) => (append ? [...current, ...(payload.courses || [])] : (payload.courses || [])));
    } catch (loadError) {
      setError(loadError.message || "Unable to load academy store.");
    } finally {
      if (isInitial) setLoading(false);
      else setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog({ laneFilter: lane, offset: 0, append: false });
  }, [lane, loadCatalog]);

  const visiblePathways = useMemo(() => pathways || [], [pathways]);
  const courseSummary = pagination.totalCourses || courses.length;

  function handleLoadMore() {
    if (!pagination.hasMore || loadingMore) return;
    loadCatalog({ laneFilter: lane, offset: courses.length, append: true });
  }

  return (
    <div style={pageShellStyle}>
      <ShellHeader ctaSet={shellHeaderCtaSets.academy} journey={shellJourney.academy} />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px 48px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: "#1d4ed8", fontWeight: 700, fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            FCA Academy Store
          </div>
          <h1 style={{ margin: "8px 0 12px", fontSize: 34 }}>Courses and pathways without Contractor Command</h1>
          <p style={{ color: "#475569", lineHeight: 1.7, maxWidth: 760 }}>
            Purchase individual academy courses or full pathway bundles for your team. This storefront is separate from
            Contractor Command SaaS billing - buy only the training you need.
          </p>
        </div>

        <div style={{ ...cardStyle, background: "#f8fafc", marginBottom: 24 }}>
          <strong>Contractor Command SaaS</strong> covers the full operating platform.
          <span style={{ color: "#475569" }}> This store is for academy-only buyers who want standalone courses and pathways.</span>
          <div style={{ marginTop: 10, color: "#475569", fontSize: 14 }}>
            FCA How-To and Operator Guides are included with every Contractor Command subscription and are not sold here.
          </div>
          {!stripeConfigured ? (
            <div style={{ marginTop: 10, color: "#b45309", fontWeight: 600 }}>
              Online checkout uses contact-sales fallback until Stripe keys are configured on Auricrux Central.
            </div>
          ) : null}
        </div>

        <StoreTabs active={tab} onChange={setTab} />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setLane("")}
            style={{
              border: lane === "" ? "1px solid #1d4ed8" : "1px solid #cbd5e1",
              background: lane === "" ? "#eff6ff" : "#fff",
              borderRadius: 999,
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            All lanes
          </button>
          {(lanes || []).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setLane(item.key)}
              style={{
                border: lane === item.key ? "1px solid #1d4ed8" : "1px solid #cbd5e1",
                background: lane === item.key ? "#eff6ff" : "#fff",
                borderRadius: 999,
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              {item.label || laneLabels[item.key] || item.key}
            </button>
          ))}
        </div>

        {loading ? <p style={{ color: "#64748b" }}>Loading store catalog...</p> : null}
        {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}

        {!loading && !error && tab === "courses" ? (
          <>
            <p style={{ color: "#64748b", marginTop: 0, marginBottom: 16 }}>
              Showing {courses.length} of {courseSummary} purchasable courses
              {lane ? ` in ${laneLabels[lane] || lane}` : " across apprenticeship, certification, degree, licensure, and professional development"}.
            </p>
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {courses.map((course) => (
                <CourseCard key={course.programKey} course={course} />
              ))}
            </div>
            {pagination.hasMore ? (
              <div style={{ marginTop: 24, textAlign: "center" }}>
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{
                    border: "1px solid #2563eb",
                    background: "#fff",
                    color: "#2563eb",
                    borderRadius: 10,
                    padding: "12px 20px",
                    fontWeight: 700,
                    cursor: loadingMore ? "wait" : "pointer",
                  }}
                >
                  {loadingMore ? "Loading..." : "Load more courses"}
                </button>
              </div>
            ) : null}
          </>
        ) : null}

        {!loading && !error && tab === "pathways" ? (
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
            {visiblePathways.map((pathway) => (
              <PathwayCard key={pathway.pathwayKey} pathway={pathway} />
            ))}
          </div>
        ) : null}

        <PublicCtaRow ctaSet={academyCtaSets.catalog} style={{ marginTop: 32 }} />
      </main>
      <ShellFooter />
    </div>
  );
}
