const OPTIONS = [
  { id: "extendedTime", label: "Extended time (1.5x)" },
  { id: "unlimitedTime", label: "Unlimited time" },
  { id: "readerScribe", label: "Reader / scribe support" },
  { id: "largePrint", label: "Large print format" },
  { id: "screenReaderCompatible", label: "Screen reader compatible delivery" },
  { id: "frequentBreaks", label: "Frequent breaks" },
  { id: "reducedDistraction", label: "Reduced distraction environment" },
];

const card = { border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, background: "#fff" };

export default function AcademyAccommodationPicker({ learnerId, selected = [], onChange, onSave, busy = false }) {
  if (!learnerId) return null;
  const set = new Set(selected || []);

  function toggle(id) {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange?.([...next]);
  }

  return (
    <section style={{ ...card, marginBottom: 16 }}>
      <h3 style={{ marginTop: 0 }}>IEP / 504 accommodations</h3>
      <p style={{ color: "#475569", lineHeight: 1.6 }}>Applies to proctored exams and high-stakes assessments for {learnerId}.</p>
      <div style={{ display: "grid", gap: 8 }}>
        {OPTIONS.map((opt) => (
          <label key={opt.id} style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
            <input type="checkbox" checked={set.has(opt.id)} onChange={() => toggle(opt.id)} />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      <button type="button" disabled={busy} onClick={() => onSave?.([...set])} style={{ marginTop: 12, border: "1px solid #2563eb", background: "#2563eb", color: "#fff", borderRadius: 8, padding: "8px 12px", fontWeight: 700, cursor: "pointer" }}>
        {busy ? "Saving..." : "Save accommodations"}
      </button>
    </section>
  );
}
