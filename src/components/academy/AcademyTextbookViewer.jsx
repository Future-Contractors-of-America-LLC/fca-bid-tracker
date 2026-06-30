import { useMemo, useState } from "react";
import { academyFigureUrl } from "./academyFigureUrl";

const card = { border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, background: "#fff" };

export default function AcademyTextbookViewer({ readingTextbook, moduleNumber }) {
  const sections = useMemo(() => {
    const all = readingTextbook?.sections || [];
    if (!moduleNumber) return all;
    return all.filter((s) => !s.moduleNumber || Number(s.moduleNumber) === Number(moduleNumber));
  }, [readingTextbook, moduleNumber]);
  const [index, setIndex] = useState(0);
  const section = sections[index];
  if (!sections.length) return null;

  return (
    <section style={{ ...card, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>{readingTextbook?.title || "Textbook"}</h3>
        <div style={{ color: "#64748b" }}>Section {index + 1} of {sections.length}</div>
      </div>
      {section ? (
        <>
          <h4 style={{ marginTop: 0 }}>{section.title}</h4>
          <div style={{ color: "#334155", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{section.body || section.text}</div>
          {(section.annotatedFigures || []).map((fig) => {
            const src = academyFigureUrl(fig.imageAssetKey || fig.figureId);
            return (
              <figure key={fig.figureId || fig.imageAssetKey} style={{ margin: "16px 0" }}>
                {src ? <img src={src} alt={fig.altText || fig.title} style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid #e2e8f0" }} /> : null}
                <figcaption style={{ color: "#475569", marginTop: 8 }}>{fig.title}</figcaption>
              </figure>
            );
          })}
        </>
      ) : null}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button type="button" disabled={index <= 0} onClick={() => setIndex((v) => Math.max(0, v - 1))}>Previous</button>
        <button type="button" disabled={index >= sections.length - 1} onClick={() => setIndex((v) => Math.min(sections.length - 1, v + 1))}>Next</button>
      </div>
    </section>
  );
}
