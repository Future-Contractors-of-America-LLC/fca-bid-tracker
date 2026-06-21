import { academyTheme } from "../../academyDesignSystem";
import { getPathwayByKey, getTopicByKey } from "../../academyCatalogTaxonomy";
import { getPathwayLmsConfig } from "../../academyPathwayLms";

function ProgressRing({ percent, size = 72, stroke = 6 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, percent || 0) / 100) * circumference;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={academyTheme.ivyBlue}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}

function moduleNavStatus(moduleNumber, enrollment) {
  const completed = enrollment?.completedModuleNumbers || [];
  if (completed.includes(moduleNumber)) return "complete";
  const next = (enrollment?.completedModules || 0) + 1;
  if (moduleNumber === next) return "current";
  if (moduleNumber <= next) return "available";
  return "locked";
}

export function AcademyBreadcrumbs({ items = [] }) {
  if (!items.length) return null;
  return (
    <nav style={{ marginBottom: 16, fontSize: 13, color: "#64748b", fontFamily: academyTheme.sans }} aria-label="Course navigation">
      {items.map((item, index) => (
        <span key={item.href || item.label}>
          {index > 0 ? " / " : null}
          {item.href ? (
            <a href={item.href} style={{ color: academyTheme.ivyBlue, textDecoration: "none", fontWeight: index === items.length - 1 ? 700 : 500 }}>
              {item.label}
            </a>
          ) : (
            <span style={{ color: academyTheme.ivyNavy, fontWeight: 700 }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export default function AcademyCourseChrome({
  program,
  modules = [],
  enrollment,
  currentModuleNumber = null,
  pathwayKey,
  topicKey,
  children,
  showSidebar = true,
}) {
  const pathway = getPathwayByKey(pathwayKey);
  const topic = getTopicByKey(topicKey);
  const lms = getPathwayLmsConfig(pathwayKey);
  const progress = enrollment?.progressPercent || 0;
  const programKey = program?.key;

  const breadcrumbs = [
    { label: "Academy", href: "/academy" },
    { label: pathway?.label || "Catalog", href: pathwayKey ? `/academy/pathway?pathway=${pathwayKey}` : "/academy/catalog" },
    ...(topic ? [{ label: topic.label, href: `/academy/catalog?pathway=${pathwayKey}&topic=${topicKey}` }] : []),
    { label: program?.title || "Course" },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 48px" }}>
      <AcademyBreadcrumbs items={breadcrumbs} />

      <header
        style={{
          background: `linear-gradient(135deg, ${academyTheme.ivyNavy} 0%, ${academyTheme.ivyBlue} 100%)`,
          color: "#fff",
          borderRadius: 4,
          padding: "24px 28px",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: academyTheme.ivyGold, marginBottom: 8 }}>
              {lms?.heroTitle || pathway?.label || "FCA Academy"} ù Auricrux School of Construction
            </div>
            <h1 style={{ margin: "0 0 8px", fontFamily: academyTheme.serif, fontSize: 28, fontWeight: 600, lineHeight: 1.25 }}>
              {program?.title}
            </h1>
            <div style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.6 }}>
              {program?.credential}
              {program?.courseCode ? ` ù ${program.courseCode}` : ""}
              {program?.creditHours ? ` ù ${program.creditHours} credits` : ""}
              {program?.ceuHours ? ` ù ${program.ceuHours} CEU` : ""}
            </div>
          </div>
          {enrollment ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative", width: 72, height: 72 }}>
                <ProgressRing percent={progress} />
                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 15, color: "#fff" }}>
                  {progress}%
                </div>
              </div>
              <div style={{ fontSize: 13, color: "#e2e8f0" }}>
                <div>{enrollment.completedModules}/{enrollment.totalModules || modules.length} modules</div>
                <div style={{ opacity: 0.85 }}>Canvas-style progress</div>
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: showSidebar ? "minmax(240px, 280px) 1fr" : "1fr", gap: 20, alignItems: "start" }}>
        {showSidebar ? (
          <aside
            style={{
              background: academyTheme.canvasSidebar,
              border: `1px solid ${academyTheme.canvasBorder}`,
              borderRadius: 4,
              overflow: "hidden",
              position: "sticky",
              top: 16,
            }}
          >
            <div style={{ padding: "14px 16px", borderBottom: `1px solid ${academyTheme.canvasBorder}`, background: "#f8fafc", fontWeight: 700, color: academyTheme.ivyNavy, fontSize: 14 }}>
              Modules
            </div>
            <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {modules.map((mod) => {
                const num = Number(mod.moduleNumber);
                const status = moduleNavStatus(num, enrollment);
                const isActive = currentModuleNumber === num;
                const locked = status === "locked";
                const href = locked ? undefined : `/academy/programs/${programKey}/modules/${num}`;
                const rowStyle = {
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  padding: "12px 16px",
                  borderBottom: `1px solid ${academyTheme.canvasBorder}`,
                  background: isActive ? "#eff6ff" : "#fff",
                  textDecoration: "none",
                  color: academyTheme.ivyNavy,
                  cursor: locked ? "not-allowed" : "pointer",
                  opacity: locked ? 0.55 : 1,
                };
                const icon = status === "complete" ? "\u2713" : status === "locked" ? "\u2014" : status === "current" ? "\u25B6" : "\u25CB";
                const content = (
                  <>
                    <span style={{ width: 20, flexShrink: 0, color: status === "complete" ? academyTheme.success : status === "current" ? academyTheme.current : academyTheme.locked, fontWeight: 700 }}>
                      {icon}
                    </span>
                    <span>
                      <div style={{ fontSize: 12, color: "#64748b" }}>Module {num}</div>
                      <div style={{ fontSize: 14, fontWeight: isActive ? 700 : 600, lineHeight: 1.4 }}>{mod.title}</div>
                    </span>
                  </>
                );
                return (
                  <li key={num}>
                    {href ? (
                      <a href={href} style={rowStyle}>{content}</a>
                    ) : (
                      <div style={rowStyle}>{content}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          </aside>
        ) : null}

        <div>{children}</div>
      </div>
    </div>
  );
}
