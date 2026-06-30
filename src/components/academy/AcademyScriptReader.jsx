import { useMemo, useState } from "react";
import { academyFigureUrl } from "./academyFigureUrl";

const card = { border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, background: "#fff" };

function FigureBlock({ figure }) {
  if (!figure) return null;
  const src = academyFigureUrl(figure.imageAssetKey || figure.figureId);
  return (
    <figure style={{ margin: "16px 0", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
      {src ? <img src={src} alt={figure.altText || figure.title || "Figure"} style={{ width: "100%", display: "block" }} /> : null}
      <figcaption style={{ padding: 12, color: "#475569", lineHeight: 1.6 }}>
        <strong>{figure.title}</strong>
        {figure.description ? <div>{figure.description}</div> : null}
        {Array.isArray(figure.annotations) && figure.annotations.length ? (
          <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
            {figure.annotations.map((a) => (
              <li key={a.label}><strong>{a.label}:</strong> {a.callout}</li>
            ))}
          </ul>
        ) : null}
      </figcaption>
    </figure>
  );
}

export default function AcademyScriptReader({ lectureScript, skillsDemoScript, title = "Student script" }) {
  const tabs = useMemo(() => {
    const out = [];
    if (lectureScript?.sections?.length) out.push({ key: "lecture", label: "Lecture script", script: lectureScript });
    if (skillsDemoScript?.sections?.length) out.push({ key: "skills", label: "Skills demo", script: skillsDemoScript });
    return out;
  }, [lectureScript, skillsDemoScript]);
  const [active, setActive] = useState(tabs[0]?.key || "lecture");
  const current = tabs.find((t) => t.key === active)?.script;
  if (!tabs.length) return null;

  return (
    <section style={{ ...card, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <div style={{ display: "flex", gap: 8 }}>
          {tabs.map((tab) => (
            <button key={tab.key} type="button" onClick={() => setActive(tab.key)} style={{ border: active === tab.key ? "1px solid #2563eb" : "1px solid #cbd5e1", background: active === tab.key ? "#2563eb" : "#fff", color: active === tab.key ? "#fff" : "#0f172a", borderRadius: 8, padding: "6px 10px", fontWeight: 700, cursor: "pointer" }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {(current?.sections || []).map((section, idx) => (
        <article key={section.sectionId || idx} style={{ marginBottom: 18 }}>
          <h4 style={{ margin: "0 0 8px" }}>{section.title || `Section ${idx + 1}`}</h4>
          <div style={{ color: "#334155", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{section.body || section.text}</div>
          {(section.annotatedFigures || []).map((fig) => (
            <FigureBlock key={fig.figureId || fig.imageAssetKey} figure={fig} />
          ))}
        </article>
      ))}
    </section>
  );
}
